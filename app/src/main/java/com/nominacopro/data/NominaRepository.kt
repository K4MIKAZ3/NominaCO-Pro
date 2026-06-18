package com.nominacopro.data

import android.content.Context
import androidx.room.Room
import com.nominacopro.data.local.NominaDatabase
import com.nominacopro.data.local.entity.ExpenseEntity
import com.nominacopro.data.local.entity.ManualDeductionEntity
import com.nominacopro.data.local.entity.ManualHolidayEntity
import com.nominacopro.data.local.entity.ProfileEntity
import com.nominacopro.data.local.entity.WorkDayEntity
import com.nominacopro.data.preferences.AppPreferencesStore
import com.nominacopro.data.sync.CloudSyncRepository
import com.nominacopro.domain.calculator.PayrollEngine
import com.nominacopro.util.NetworkMonitor
import com.nominacopro.domain.calculator.SettlementCalculator
import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.domain.model.AppPreferences
import com.nominacopro.domain.model.ContractType
import com.nominacopro.domain.model.DayType
import com.nominacopro.domain.model.EmployeeProfile
import com.nominacopro.domain.model.ExpenseCategory
import com.nominacopro.domain.model.ExpenseEntry
import com.nominacopro.domain.model.ManualDeduction
import com.nominacopro.domain.model.PayrollEntryType
import com.nominacopro.domain.model.PeriodPayrollSummary
import com.nominacopro.domain.model.MonthSummary
import com.nominacopro.domain.model.YearSettlementReport
import com.nominacopro.domain.payperiod.PayPeriod
import com.nominacopro.domain.payperiod.PayPeriodType
import com.nominacopro.domain.model.MonthlyPayroll
import com.nominacopro.domain.model.WorkDayEntry
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter

class NominaRepository(context: Context) {

    private val appContext = context.applicationContext

    private val db = Room.databaseBuilder(
        appContext,
        NominaDatabase::class.java,
        "nomina_co_pro.db",
    ).fallbackToDestructiveMigration().build()

    private val profileDao = db.profileDao()
    private val workDayDao = db.workDayDao()
    private val holidayDao = db.manualHolidayDao()
    private val deductionDao = db.manualDeductionDao()
    private val expenseDao = db.expenseDao()
    val preferencesStore = AppPreferencesStore(appContext)

    val cloudSync = CloudSyncRepository(
        db = db,
        profileDao = profileDao,
        workDayDao = workDayDao,
        holidayDao = holidayDao,
        deductionDao = deductionDao,
        expenseDao = expenseDao,
        preferencesStore = preferencesStore,
    )

    private val iso = DateTimeFormatter.ISO_LOCAL_DATE

    private suspend fun maybeCloudSync(block: suspend () -> Unit) {
        if (!NetworkMonitor.isOnline(appContext) || !cloudSync.canAutoSync()) return
        runCatching { block() }
    }

    fun observePreferences(): Flow<AppPreferences> = preferencesStore.observe()

    suspend fun setPreferences(prefs: AppPreferences) {
        preferencesStore.update { prefs }
        maybeCloudSync { cloudSync.pushPreferences(prefs) }
    }

    fun observeProfile() = profileDao.observe().map { it?.toDomain() }

    suspend fun saveProfile(profile: EmployeeProfile) {
        profileDao.upsert(
            ProfileEntity(
                name = profile.name,
                documentId = profile.documentId,
                jobTitle = profile.jobTitle,
                monthlySalary = profile.monthlySalary,
                dailyHours = profile.dailyHours,
                contractType = profile.contractType.name,
                payPeriodType = profile.payPeriodType.name,
                pendingVacationDays = profile.pendingVacationDays,
            ),
        )
        maybeCloudSync { cloudSync.pushProfile(profile) }
    }

    fun observeWorkDays(year: Int, month: Int): Flow<List<WorkDayEntry>> {
        val prefix = YearMonth.of(year, month).toString()
        return workDayDao.observeMonth(prefix).map { list -> list.map { it.toDomain() } }
    }

    fun observeWorkDaysInRange(start: LocalDate, end: LocalDate): Flow<List<WorkDayEntry>> =
        workDayDao.observeRange(start.format(iso), end.format(iso))
            .map { list -> list.map { it.toDomain() } }

    suspend fun saveWorkDay(entry: WorkDayEntry) {
        workDayDao.upsert(entry.toEntity())
        maybeCloudSync { cloudSync.pushWorkDay(entry) }
    }

    suspend fun deleteWorkDay(date: LocalDate) {
        workDayDao.delete(date.format(iso))
        maybeCloudSync { cloudSync.deleteWorkDay(date) }
    }

    fun observeManualHolidays(): Flow<Set<LocalDate>> =
        holidayDao.observeAll().map { list -> list.map { LocalDate.parse(it.dateIso, iso) }.toSet() }

    suspend fun toggleManualHoliday(date: LocalDate, enabled: Boolean) {
        val isoDate = date.format(iso)
        if (enabled) {
            holidayDao.upsert(ManualHolidayEntity(isoDate))
            maybeCloudSync { cloudSync.pushManualHoliday(date) }
        } else {
            holidayDao.delete(isoDate)
            maybeCloudSync { cloudSync.deleteManualHoliday(date) }
        }
    }

    fun observeManualEntriesInRange(start: LocalDate, end: LocalDate): Flow<List<ManualDeduction>> =
        deductionDao.observeRange(start.format(iso), end.format(iso))
            .map { list -> list.map { it.toDomain() } }

    fun observePeriodSummary(period: PayPeriod): Flow<PeriodPayrollSummary?> =
        combine(
            observeProfile(),
            workDayDao.observeRange(period.start.format(iso), period.end.format(iso))
                .map { list -> list.map { it.toDomain() } },
            observeManualHolidays(),
            observeManualEntriesInRange(period.start, period.end),
        ) { profile, entries, manual, manualEntries ->
            profile?.let { p ->
                val payroll = PayrollEngine.liquidateDateRange(
                    profile = p,
                    start = period.start,
                    end = period.end,
                    entries = entries,
                    manualHolidays = manual,
                    referenceYear = period.start.year,
                    referenceMonth = period.start.monthValue,
                )
                PayrollEngine.buildPeriodSummary(
                    payroll = payroll,
                    periodLabel = period.label,
                    periodStart = period.start,
                    periodEnd = period.end,
                    manualEntries = manualEntries,
                )
            }
        }

    fun observeManualDeductions(year: Int, month: Int): Flow<List<ManualDeduction>> {
        val ym = YearMonth.of(year, month).toString()
        return deductionDao.observeMonth(ym).map { list -> list.map { it.toDomain() } }
    }

    suspend fun addManualDeduction(deduction: ManualDeduction) {
        val entity = deduction.toEntity().let { row ->
            if (row.cloudId == null) row.copy(cloudId = java.util.UUID.randomUUID().toString()) else row
        }
        deductionDao.upsert(entity)
        maybeCloudSync { cloudSync.pushManualDeduction(entity.toDomain()) }
    }

    suspend fun removeManualDeduction(id: Long) {
        val existing = deductionDao.getById(id)
        deductionDao.delete(id)
        maybeCloudSync { cloudSync.deleteManualDeduction(existing?.cloudId) }
    }

    fun observeExpenses(year: Int, month: Int): Flow<List<ExpenseEntry>> {
        val ym = YearMonth.of(year, month).toString()
        return expenseDao.observeForMonth(ym).map { list ->
            list.map { entity ->
                entity.toDomain().let { entry ->
                    if (entry.isFixed) {
                        entry.copy(
                            yearMonth = YearMonth.of(year, month),
                            date = LocalDate.of(year, month, 1),
                        )
                    } else {
                        entry
                    }
                }
            }
        }
    }

    suspend fun addExpense(entry: ExpenseEntry) {
        val entity = entry.toEntity().let { row ->
            if (row.cloudId == null) row.copy(cloudId = java.util.UUID.randomUUID().toString()) else row
        }
        expenseDao.upsert(entity)
        maybeCloudSync { cloudSync.pushExpense(entity.toDomain()) }
    }

    suspend fun removeExpense(id: Long) {
        val existing = expenseDao.getById(id)
        expenseDao.delete(id)
        maybeCloudSync { cloudSync.deleteExpense(existing?.cloudId) }
    }

    fun observeMonthlyPayroll(year: Int, month: Int): Flow<MonthlyPayroll?> =
        combine(
            observeProfile(),
            observeWorkDays(year, month),
            observeManualHolidays(),
            observeManualDeductions(year, month),
        ) { profile, entries, manual, deductions ->
            profile?.let { p ->
                val base = PayrollEngine.liquidateMonth(p, year, month, entries, manual)
                PayrollEngine.applyManualEntries(base, deductions)
            }
        }

    fun observeDashboard(monthCount: Int = 3): Flow<List<MonthSummary>> =
        combine(
            observeProfile(),
            workDayDao.observeAll(),
            holidayDao.observeAll(),
            deductionDao.observeAll(),
        ) { profile, allWork, allHolidays, allDeductions ->
            if (profile == null) return@combine emptyList()
            val p = profile
            val manual = allHolidays.map { LocalDate.parse(it.dateIso, iso) }.toSet()
            val now = YearMonth.now()
            (0 until monthCount).map { offset ->
                val ym = now.minusMonths((monthCount - 1 - offset).toLong())
                val prefix = ym.toString()
                val entries = allWork
                    .filter { it.dateIso.startsWith(prefix) }
                    .map { it.toDomain() }
                val monthEntries = allDeductions
                    .filter { it.yearMonth == prefix }
                    .map { it.toDomain() }
                val payroll = PayrollEngine.applyManualEntries(
                    PayrollEngine.liquidateMonth(p, ym.year, ym.monthValue, entries, manual),
                    monthEntries.filter { it.entryType != PayrollEntryType.ADVANCE },
                )
                MonthSummary(
                    yearMonth = ym,
                    grossTotal = payroll.grossTotal,
                    legalDeductions = payroll.legalDeductions.sumOf { it.amount },
                    manualDeductions = payroll.manualDeductions.sumOf { it.amount },
                    netTotal = payroll.netTotal,
                )
            }
        }

    fun observeYearSettlement(year: Int): Flow<YearSettlementReport?> =
        combine(
            observeProfile(),
            workDayDao.observeAll(),
            observeManualHolidays(),
        ) { profile, allWork, manual ->
            profile?.let { p ->
                val entries = allWork.map { it.toDomain() }.filter { it.date.year == year }
                SettlementCalculator.calculate(
                    profile = p,
                    year = year,
                    entries = entries,
                    manualHolidays = manual,
                    pendingVacationDays = p.pendingVacationDays,
                )
            }
        }

    fun observeCalendarMarks(year: Int, month: Int): Flow<Map<LocalDate, CalendarMark>> =
        combine(observeWorkDays(year, month), observeManualHolidays()) { entries, manual ->
            val ym = YearMonth.of(year, month)
            buildMap {
                for (d in 1..ym.lengthOfMonth()) {
                    val date = LocalDate.of(year, month, d)
                    val worked = entries.any { it.date == date }
                    val official = ColombiaLaborLaw2026.isOfficialHoliday(date)
                    val manualH = manual.contains(date)
                    val sunday = ColombiaLaborLaw2026.isSunday(date)
                    put(date, CalendarMark(worked, official, manualH, sunday))
                }
            }
        }
}

data class CalendarMark(
    val worked: Boolean,
    val officialHoliday: Boolean,
    val manualHoliday: Boolean,
    val sunday: Boolean,
)

private fun ProfileEntity.toDomain() = EmployeeProfile(
    name = name,
    documentId = documentId,
    jobTitle = jobTitle,
    monthlySalary = monthlySalary,
    dailyHours = dailyHours,
    contractType = ContractType.fromStored(contractType),
    payPeriodType = PayPeriodType.fromStored(payPeriodType),
    pendingVacationDays = pendingVacationDays,
)

private fun WorkDayEntity.toDomain() = WorkDayEntry(
    date = LocalDate.parse(dateIso, DateTimeFormatter.ISO_LOCAL_DATE),
    start = java.time.LocalTime.parse(startTime),
    end = java.time.LocalTime.parse(endTime),
    dayType = DayType.valueOf(dayType),
    notes = notes,
)

private fun WorkDayEntry.toEntity() = WorkDayEntity(
    dateIso = date.format(DateTimeFormatter.ISO_LOCAL_DATE),
    startTime = start.toString(),
    endTime = end.toString(),
    dayType = dayType.name,
    notes = notes,
)

private fun ManualDeductionEntity.toDomain() = ManualDeduction(
    id = id,
    cloudId = cloudId,
    yearMonth = YearMonth.parse(yearMonth),
    effectiveDate = LocalDate.parse(effectiveDateIso, DateTimeFormatter.ISO_LOCAL_DATE),
    label = label,
    amount = amount,
    entryType = PayrollEntryType.fromStored(entryType),
)

private fun ManualDeduction.toEntity() = ManualDeductionEntity(
    id = id,
    cloudId = cloudId,
    yearMonth = yearMonth.toString(),
    effectiveDateIso = effectiveDate.format(DateTimeFormatter.ISO_LOCAL_DATE),
    label = label,
    amount = amount,
    entryType = entryType.name,
)

private fun ExpenseEntity.toDomain() = ExpenseEntry(
    id = id,
    cloudId = cloudId,
    yearMonth = YearMonth.parse(yearMonth),
    date = LocalDate.parse(dateIso, DateTimeFormatter.ISO_LOCAL_DATE),
    label = label,
    amount = amount,
    category = ExpenseCategory.fromStored(category.takeIf { it.isNotBlank() }),
    isFixed = isFixed,
)

private fun ExpenseEntry.toEntity() = ExpenseEntity(
    id = id,
    cloudId = cloudId,
    yearMonth = yearMonth.toString(),
    dateIso = date.format(DateTimeFormatter.ISO_LOCAL_DATE),
    label = label,
    amount = amount,
    category = category.name,
    isFixed = isFixed,
)
