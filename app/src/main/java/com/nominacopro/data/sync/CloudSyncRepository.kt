package com.nominacopro.data.sync

import androidx.room.withTransaction
import com.nominacopro.data.auth.SupabaseProvider
import com.nominacopro.data.local.NominaDatabase
import com.nominacopro.data.local.dao.ManualDeductionDao
import com.nominacopro.data.local.dao.ManualHolidayDao
import com.nominacopro.data.local.dao.ProfileDao
import com.nominacopro.data.local.dao.WorkDayDao
import com.nominacopro.data.local.entity.ManualDeductionEntity
import com.nominacopro.data.local.entity.ManualHolidayEntity
import com.nominacopro.data.local.entity.ProfileEntity
import com.nominacopro.data.local.entity.WorkDayEntity
import com.nominacopro.data.preferences.AppPreferencesStore
import com.nominacopro.domain.model.AppPreferences
import com.nominacopro.domain.model.EmployeeProfile
import com.nominacopro.domain.model.ManualDeduction
import com.nominacopro.domain.model.WorkDayEntry
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.UUID

sealed interface SyncUiState {
    data object Idle : SyncUiState
    data object Syncing : SyncUiState
    data class Success(val message: String) : SyncUiState
    data class Error(val message: String) : SyncUiState
}

enum class BackupActivationStrategy {
    PushLocal,
    PullRemote,
}

class CloudSyncRepository(
    private val db: NominaDatabase,
    private val profileDao: ProfileDao,
    private val workDayDao: WorkDayDao,
    private val holidayDao: ManualHolidayDao,
    private val deductionDao: ManualDeductionDao,
    private val preferencesStore: AppPreferencesStore,
) {

    private val iso = DateTimeFormatter.ISO_LOCAL_DATE
    private val postgrest get() = SupabaseProvider.client?.postgrest

    private var activeUserId: String? = null
    var autoSyncEnabled: Boolean = false
        private set

    private val _state = MutableStateFlow<SyncUiState>(SyncUiState.Idle)
    val state: StateFlow<SyncUiState> = _state.asStateFlow()

    val isAvailable: Boolean get() = SupabaseProvider.isConfigured

    fun setActiveUser(userId: String?) {
        activeUserId = userId
        if (userId == null) {
            autoSyncEnabled = false
        }
    }

    fun setAutoSyncEnabled(enabled: Boolean) {
        autoSyncEnabled = enabled && activeUserId != null
    }

    fun canAutoSync(): Boolean = autoSyncEnabled && activeUserId != null

    suspend fun remoteBackupExists(userId: String): Boolean = hasRemoteData(userId)

    suspend fun activateBackup(userId: String, strategy: BackupActivationStrategy) {
        if (!isAvailable) return
        val previousUser = activeUserId
        activeUserId = userId
        if (previousUser != null && previousUser != userId) {
            clearLocalData()
        }
        _state.value = SyncUiState.Syncing
        try {
            when (strategy) {
                BackupActivationStrategy.PushLocal -> {
                    pushAll(userId)
                    _state.value = SyncUiState.Success("Datos subidos a la nube")
                }
                BackupActivationStrategy.PullRemote -> {
                    pullAll(userId)
                    _state.value = SyncUiState.Success("Datos descargados de la nube")
                }
            }
            autoSyncEnabled = true
        } catch (e: Exception) {
            _state.value = SyncUiState.Error(parseSyncError(e))
            throw e
        }
    }

    suspend fun onUserAuthenticated(userId: String) {
        activateBackup(
            userId,
            if (hasRemoteData(userId)) BackupActivationStrategy.PullRemote else BackupActivationStrategy.PushLocal,
        )
    }

    suspend fun syncNow(userId: String): String? {
        if (!isAvailable) return "Supabase no configurado"
        activeUserId = userId
        _state.value = SyncUiState.Syncing
        return try {
            pushAll(userId)
            pullAll(userId)
            autoSyncEnabled = true
            _state.value = SyncUiState.Success("Sincronización completada")
            null
        } catch (e: Exception) {
            val msg = parseSyncError(e)
            _state.value = SyncUiState.Error(msg)
            msg
        }
    }

    suspend fun pushProfile(profile: EmployeeProfile) {
        val userId = activeUserId ?: return
        val pg = postgrest ?: return
        pg.from(TABLE_PROFILES).upsert(profile.toRemote(userId), onConflict = "user_id")
    }

    suspend fun pushWorkDay(entry: WorkDayEntry) {
        val userId = activeUserId ?: return
        val pg = postgrest ?: return
        pg.from(TABLE_WORK_DAYS).upsert(entry.toRemote(userId), onConflict = "user_id,date_iso")
    }

    suspend fun deleteWorkDay(date: LocalDate) {
        val userId = activeUserId ?: return
        val pg = postgrest ?: return
        pg.from(TABLE_WORK_DAYS).delete {
            filter {
                eq("user_id", userId)
                eq("date_iso", date.format(iso))
            }
        }
    }

    suspend fun pushManualHoliday(date: LocalDate, label: String = "") {
        val userId = activeUserId ?: return
        val pg = postgrest ?: return
        pg.from(TABLE_MANUAL_HOLIDAYS).upsert(
            RemoteManualHoliday(userId, date.format(iso), label),
            onConflict = "user_id,date_iso",
        )
    }

    suspend fun deleteManualHoliday(date: LocalDate) {
        val userId = activeUserId ?: return
        val pg = postgrest ?: return
        pg.from(TABLE_MANUAL_HOLIDAYS).delete {
            filter {
                eq("user_id", userId)
                eq("date_iso", date.format(iso))
            }
        }
    }

    suspend fun pushManualDeduction(deduction: ManualDeduction): ManualDeduction {
        val userId = activeUserId ?: return deduction
        val pg = postgrest ?: return deduction
        val cloudId = deduction.cloudId ?: UUID.randomUUID().toString()
        pg.from(TABLE_MANUAL_DEDUCTIONS).upsert(
            RemoteManualDeduction(
                id = cloudId,
                userId = userId,
                yearMonth = deduction.yearMonth.toString(),
                label = deduction.label,
                amount = deduction.amount,
            ),
            onConflict = "id",
        )
        return deduction.copy(cloudId = cloudId)
    }

    suspend fun deleteManualDeduction(cloudId: String?) {
        if (cloudId.isNullOrBlank()) return
        val pg = postgrest ?: return
        pg.from(TABLE_MANUAL_DEDUCTIONS).delete {
            filter { eq("id", cloudId) }
        }
    }

    suspend fun pushPreferences(prefs: AppPreferences) {
        val userId = activeUserId ?: return
        val pg = postgrest ?: return
        pg.from(TABLE_APP_PREFERENCES).upsert(prefs.toRemote(userId), onConflict = "user_id")
    }

    private suspend fun hasRemoteData(userId: String): Boolean {
        val pg = postgrest ?: return false
        val profile = pg.from(TABLE_PROFILES).select {
            filter { eq("user_id", userId) }
        }.decodeList<RemoteProfile>().firstOrNull()
        if (profile != null) return true
        val workDays = pg.from(TABLE_WORK_DAYS).select {
            filter { eq("user_id", userId) }
            limit(1)
        }.decodeList<RemoteWorkDay>()
        return workDays.isNotEmpty()
    }

    private suspend fun pullAll(userId: String) {
        val pg = postgrest ?: error("Supabase no disponible")
        val remoteProfile = pg.from(TABLE_PROFILES).select {
            filter { eq("user_id", userId) }
        }.decodeList<RemoteProfile>().firstOrNull()
        val remoteWorkDays = pg.from(TABLE_WORK_DAYS).select {
            filter { eq("user_id", userId) }
        }.decodeList<RemoteWorkDay>()
        val remoteHolidays = pg.from(TABLE_MANUAL_HOLIDAYS).select {
            filter { eq("user_id", userId) }
        }.decodeList<RemoteManualHoliday>()
        val remoteDeductions = pg.from(TABLE_MANUAL_DEDUCTIONS).select {
            filter { eq("user_id", userId) }
        }.decodeList<RemoteManualDeduction>()
        val remotePrefs = pg.from(TABLE_APP_PREFERENCES).select {
            filter { eq("user_id", userId) }
        }.decodeList<RemoteAppPreferences>().firstOrNull()

        db.withTransaction {
            profileDao.deleteAll()
            remoteProfile?.let { profileDao.upsert(it.toEntity()) }
            workDayDao.deleteAll()
            if (remoteWorkDays.isNotEmpty()) {
                workDayDao.upsertAll(remoteWorkDays.map { it.toEntity() })
            }
            holidayDao.deleteAll()
            if (remoteHolidays.isNotEmpty()) {
                holidayDao.upsertAll(remoteHolidays.map { it.toEntity() })
            }
            deductionDao.deleteAll()
            if (remoteDeductions.isNotEmpty()) {
                deductionDao.upsertAll(remoteDeductions.map { it.toEntity() })
            }
        }
        remotePrefs?.let { prefs ->
            preferencesStore.update { current ->
                prefs.toDomain().copy(
                    darkModeEnabled = current.darkModeEnabled,
                    biometricEnabled = current.biometricEnabled,
                )
            }
        }
    }

    private suspend fun pushAll(userId: String) {
        val pg = postgrest ?: error("Supabase no disponible")
        val profile = profileDao.get()
        if (profile != null) {
            pg.from(TABLE_PROFILES).upsert(profile.toRemote(userId), onConflict = "user_id")
        }
        val workDays = workDayDao.observeAll().first()
        if (workDays.isNotEmpty()) {
            pg.from(TABLE_WORK_DAYS).upsert(
                workDays.map { it.toRemote(userId) },
                onConflict = "user_id,date_iso",
            )
        }
        val holidays = holidayDao.observeAll().first()
        if (holidays.isNotEmpty()) {
            pg.from(TABLE_MANUAL_HOLIDAYS).upsert(
                holidays.map { it.toRemote(userId) },
                onConflict = "user_id,date_iso",
            )
        }
        val deductions = deductionDao.observeAll().first()
        if (deductions.isNotEmpty()) {
            val withCloudIds = deductions.map { entity ->
                val cloudId = entity.cloudId ?: UUID.randomUUID().toString()
                entity.copy(cloudId = cloudId)
            }
            deductionDao.upsertAll(withCloudIds)
            pg.from(TABLE_MANUAL_DEDUCTIONS).upsert(
                withCloudIds.map { it.toRemote(userId) },
                onConflict = "id",
            )
        }
        val prefs = preferencesStore.observe().first()
        pg.from(TABLE_APP_PREFERENCES).upsert(prefs.toRemote(userId), onConflict = "user_id")
    }

    suspend fun clearLocalUserData() {
        activeUserId = null
        autoSyncEnabled = false
        clearLocalData()
        _state.value = SyncUiState.Idle
    }

    private suspend fun clearLocalData() {
        db.withTransaction {
            profileDao.deleteAll()
            workDayDao.deleteAll()
            holidayDao.deleteAll()
            deductionDao.deleteAll()
        }
    }

    private fun parseSyncError(e: Exception): String =
        e.message?.substringBefore("\nURL:")?.trim() ?: "Error de sincronización"

    private companion object {
        const val TABLE_PROFILES = "profiles"
        const val TABLE_WORK_DAYS = "work_days"
        const val TABLE_MANUAL_HOLIDAYS = "manual_holidays"
        const val TABLE_MANUAL_DEDUCTIONS = "manual_deductions"
        const val TABLE_APP_PREFERENCES = "app_preferences"
    }
}

private fun EmployeeProfile.toRemote(userId: String) = RemoteProfile(
    userId = userId,
    name = name,
    documentId = documentId,
    jobTitle = jobTitle,
    monthlySalary = monthlySalary,
    dailyHours = dailyHours,
    contractType = contractType.name,
    payPeriodType = payPeriodType.name,
    pendingVacationDays = pendingVacationDays,
)

private fun ProfileEntity.toRemote(userId: String) = RemoteProfile(
    userId = userId,
    name = name,
    documentId = documentId,
    jobTitle = jobTitle,
    monthlySalary = monthlySalary,
    dailyHours = dailyHours,
    contractType = contractType,
    payPeriodType = payPeriodType,
    pendingVacationDays = pendingVacationDays,
)

private fun RemoteProfile.toEntity() = ProfileEntity(
    name = name,
    documentId = documentId,
    jobTitle = jobTitle,
    monthlySalary = monthlySalary,
    dailyHours = dailyHours,
    contractType = contractType,
    payPeriodType = payPeriodType,
    pendingVacationDays = pendingVacationDays,
)

private fun WorkDayEntry.toRemote(userId: String) = RemoteWorkDay(
    userId = userId,
    dateIso = date.format(DateTimeFormatter.ISO_LOCAL_DATE),
    startTime = start.toString(),
    endTime = end.toString(),
    dayType = dayType.name,
    notes = notes,
)

private fun WorkDayEntity.toRemote(userId: String) = RemoteWorkDay(
    userId = userId,
    dateIso = dateIso,
    startTime = startTime,
    endTime = endTime,
    dayType = dayType,
    notes = notes,
)

private fun RemoteWorkDay.toEntity() = WorkDayEntity(
    dateIso = dateIso,
    startTime = startTime,
    endTime = endTime,
    dayType = dayType,
    notes = notes,
)

private fun ManualHolidayEntity.toRemote(userId: String) = RemoteManualHoliday(
    userId = userId,
    dateIso = dateIso,
    label = label,
)

private fun RemoteManualHoliday.toEntity() = ManualHolidayEntity(
    dateIso = dateIso,
    label = label,
)

private fun ManualDeductionEntity.toRemote(userId: String): RemoteManualDeduction {
    val cloudId = cloudId ?: UUID.randomUUID().toString()
    return RemoteManualDeduction(
        id = cloudId,
        userId = userId,
        yearMonth = yearMonth,
        effectiveDateIso = effectiveDateIso,
        label = label,
        amount = amount,
        entryType = entryType,
    )
}

private fun RemoteManualDeduction.toEntity() = ManualDeductionEntity(
    cloudId = id,
    yearMonth = yearMonth,
    effectiveDateIso = effectiveDateIso ?: "${yearMonth}-01",
    label = label,
    amount = amount,
    entryType = entryType,
)

private fun AppPreferences.toRemote(userId: String) = RemoteAppPreferences(
    userId = userId,
    defaultStartHour = defaultStartHour,
    defaultStartMinute = defaultStartMinute,
    defaultEndHour = defaultEndHour,
    defaultEndMinute = defaultEndMinute,
    use24HourFormat = use24HourFormat,
    reminderEnabled = reminderEnabled,
    reminderHour = reminderHour,
    reminderMinute = reminderMinute,
)

private fun RemoteAppPreferences.toDomain() = AppPreferences(
    defaultStartHour = defaultStartHour,
    defaultStartMinute = defaultStartMinute,
    defaultEndHour = defaultEndHour,
    defaultEndMinute = defaultEndMinute,
    use24HourFormat = use24HourFormat,
    reminderEnabled = reminderEnabled,
    reminderHour = reminderHour,
    reminderMinute = reminderMinute,
)
