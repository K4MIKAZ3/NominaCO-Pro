package com.nominacopro.ui

import android.app.Application
import android.content.Intent
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.nominacopro.data.CalendarMark
import com.nominacopro.NominaApp
import com.nominacopro.data.NominaRepository
import com.nominacopro.data.update.ApkInstaller
import com.nominacopro.data.update.AppUpdateManifest
import com.nominacopro.domain.model.AppPreferences
import com.nominacopro.domain.model.DayType
import com.nominacopro.domain.model.EmployeeProfile
import com.nominacopro.domain.model.ExpenseCategory
import com.nominacopro.domain.model.ExpenseEntry
import com.nominacopro.domain.model.ManualDeduction
import com.nominacopro.domain.model.MonthSummary
import com.nominacopro.domain.model.MonthlyPayroll
import com.nominacopro.domain.model.PayrollEntryType
import com.nominacopro.domain.model.PeriodPayrollSummary
import com.nominacopro.domain.model.YearSettlementReport
import com.nominacopro.domain.model.WorkDayEntry
import com.nominacopro.domain.payperiod.PayPeriod
import com.nominacopro.domain.payperiod.PayPeriodCalculator
import com.nominacopro.domain.payperiod.PayPeriodType
import com.nominacopro.data.sync.SyncUiState
import com.nominacopro.export.PdfExporter
import com.nominacopro.notifications.ReminderScheduler
import com.nominacopro.util.NetworkMonitor
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.io.File
import java.time.LocalDate
import java.time.LocalTime
import java.time.YearMonth

data class AppUpdateUiState(
    val manifest: AppUpdateManifest? = null,
    val downloading: Boolean = false,
    val progress: Float = 0f,
    val downloadedApkPath: String? = null,
    val awaitingInstallPermission: Boolean = false,
)

@OptIn(ExperimentalCoroutinesApi::class)
class MainViewModel(
    private val repository: NominaRepository,
    application: Application,
) : AndroidViewModel(application) {

    private val app = application as NominaApp

    private var mainAppActive = false

    private val _appUpdate = MutableStateFlow(AppUpdateUiState())
    val appUpdate: StateFlow<AppUpdateUiState> = _appUpdate.asStateFlow()

    private val _yearMonth = MutableStateFlow(YearMonth.now())
    val yearMonth: StateFlow<YearMonth> = _yearMonth.asStateFlow()

    private val _expenseYearMonth = MutableStateFlow(YearMonth.now())
    val expenseYearMonth: StateFlow<YearMonth> = _expenseYearMonth.asStateFlow()

    val preferences: StateFlow<AppPreferences> = repository.observePreferences().stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5_000), AppPreferences(),
    )

    val profile: StateFlow<EmployeeProfile?> = repository.observeProfile().stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5_000), null,
    )

    val payroll: StateFlow<MonthlyPayroll?> = _yearMonth
        .flatMapLatest { ym ->
            repository.observeMonthlyPayroll(ym.year, ym.monthValue)
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

    val calendarMarks: StateFlow<Map<LocalDate, CalendarMark>> = _yearMonth
        .flatMapLatest { ym ->
            repository.observeCalendarMarks(ym.year, ym.monthValue)
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyMap())

    val manualHolidays: StateFlow<Set<LocalDate>> = repository.observeManualHolidays().stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5_000), emptySet(),
    )

    val workDaysByDate: StateFlow<Map<LocalDate, WorkDayEntry>> = _yearMonth
        .flatMapLatest { ym ->
            repository.observeWorkDays(ym.year, ym.monthValue)
                .map { entries -> entries.associateBy { it.date } }
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyMap())

    val workDaysList: StateFlow<List<WorkDayEntry>> = _yearMonth
        .flatMapLatest { ym ->
            repository.observeWorkDays(ym.year, ym.monthValue)
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    val manualDeductions: StateFlow<List<ManualDeduction>> = _yearMonth
        .flatMapLatest { ym ->
            repository.observeManualDeductions(ym.year, ym.monthValue)
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    val expenses: StateFlow<List<ExpenseEntry>> = _expenseYearMonth
        .flatMapLatest { ym ->
            repository.observeExpenses(ym.year, ym.monthValue)
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    val expensePayroll: StateFlow<MonthlyPayroll?> = _expenseYearMonth
        .flatMapLatest { ym ->
            repository.observeMonthlyPayroll(ym.year, ym.monthValue)
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

    private val _selectedPeriodIndex = MutableStateFlow(0)
    val selectedPeriodIndex: StateFlow<Int> = _selectedPeriodIndex.asStateFlow()

    val payPeriods: StateFlow<List<PayPeriod>> = combine(profile, _yearMonth) { p, ym ->
        if (p == null || p.payPeriodType == PayPeriodType.MONTHLY) emptyList()
        else PayPeriodCalculator.periodsInMonth(p.payPeriodType, ym)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    val showPayrollSubPeriods: StateFlow<Boolean> = combine(profile, payPeriods) { p, periods ->
        p != null && PayPeriodCalculator.shouldShowSubPeriods(p.payPeriodType, periods)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), false)

    val yearSettlement: StateFlow<YearSettlementReport?> = _yearMonth
        .flatMapLatest { ym -> repository.observeYearSettlement(ym.year) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

    val selectedPayPeriod: StateFlow<PayPeriod?> = combine(payPeriods, _selectedPeriodIndex) { periods, index ->
        periods.getOrNull(index.coerceIn(0, (periods.size - 1).coerceAtLeast(0)))
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

    val periodSummary: StateFlow<PeriodPayrollSummary?> = combine(showPayrollSubPeriods, selectedPayPeriod) { show, period ->
        show to period
    }.flatMapLatest { (show, period) ->
        if (!show || period == null) {
            kotlinx.coroutines.flow.flowOf(null)
        } else {
            repository.observePeriodSummary(period)
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

    val periodManualEntries: StateFlow<List<ManualDeduction>> = combine(showPayrollSubPeriods, selectedPayPeriod) { show, period ->
        show to period
    }.flatMapLatest { (show, period) ->
        if (!show || period == null) {
            kotlinx.coroutines.flow.flowOf(emptyList())
        } else {
            repository.observeManualEntriesInRange(period.start, period.end)
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    val periodWorkDays: StateFlow<List<WorkDayEntry>> = combine(showPayrollSubPeriods, selectedPayPeriod) { show, period ->
        show to period
    }.flatMapLatest { (show, period) ->
        if (!show || period == null) {
            kotlinx.coroutines.flow.flowOf(emptyList())
        } else {
            repository.observeWorkDaysInRange(period.start, period.end)
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    val dashboard: StateFlow<List<MonthSummary>> = repository.observeDashboard(3).stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList(),
    )

    val syncState: StateFlow<SyncUiState> = repository.cloudSync.state.stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5_000), SyncUiState.Idle,
    )

    fun prevMonth() {
        _yearMonth.value = _yearMonth.value.minusMonths(1)
        resetPeriodIndexForCurrentMonth()
    }

    fun nextMonth() {
        _yearMonth.value = _yearMonth.value.plusMonths(1)
        resetPeriodIndexForCurrentMonth()
    }

    fun goToday() {
        _yearMonth.value = YearMonth.now()
        resetPeriodIndexForCurrentMonth()
    }

    fun prevExpenseMonth() {
        _expenseYearMonth.value = _expenseYearMonth.value.minusMonths(1)
    }

    fun nextExpenseMonth() {
        _expenseYearMonth.value = _expenseYearMonth.value.plusMonths(1)
    }

    fun goExpenseToday() {
        _expenseYearMonth.value = YearMonth.now()
    }

    fun selectPayPeriod(index: Int) {
        _selectedPeriodIndex.value = index.coerceAtLeast(0)
    }

    private fun resetPeriodIndexForCurrentMonth() {
        val p = profile.value ?: return
        _selectedPeriodIndex.value = PayPeriodCalculator.defaultPeriodIndex(p.payPeriodType, _yearMonth.value)
    }

    init {
        viewModelScope.launch {
            combine(profile, _yearMonth) { p, ym -> p to ym }
                .collect { (p, ym) ->
                    if (p != null) {
                        _selectedPeriodIndex.value = PayPeriodCalculator.defaultPeriodIndex(p.payPeriodType, ym)
                    }
                }
        }
    }

    fun saveProfile(profile: EmployeeProfile) {
        viewModelScope.launch { repository.saveProfile(profile) }
    }

    fun updatePendingVacationDays(days: Int) {
        val p = profile.value ?: return
        if (p.pendingVacationDays == days) return
        viewModelScope.launch { repository.saveProfile(p.copy(pendingVacationDays = days.coerceAtLeast(0))) }
    }

    fun saveWorkDay(
        date: LocalDate,
        start: LocalTime,
        end: LocalTime,
        dayType: DayType,
        notes: String,
        manualHoliday: Boolean,
    ) {
        viewModelScope.launch {
            repository.toggleManualHoliday(date, manualHoliday)
            repository.saveWorkDay(WorkDayEntry(date, start, end, dayType, notes))
        }
    }

    fun deleteWorkDay(date: LocalDate) {
        viewModelScope.launch { repository.deleteWorkDay(date) }
    }

    fun removeManualHoliday(date: LocalDate) {
        viewModelScope.launch { repository.toggleManualHoliday(date, false) }
    }

    fun addManualDeduction(label: String, amount: Long) {
        addPayrollEntry(PayrollEntryType.DEDUCTION, label, amount)
    }

    fun addAdvance(label: String, amount: Long) {
        addPayrollEntry(PayrollEntryType.ADVANCE, label, amount)
    }

    fun addBonus(label: String, amount: Long) {
        addPayrollEntry(PayrollEntryType.BONUS, label, amount)
    }

    private fun addPayrollEntry(type: PayrollEntryType, label: String, amount: Long) {
        val p = profile.value
        val period = selectedPayPeriod.value
        val ym = _yearMonth.value
        val effectiveDate = when {
            period != null -> LocalDate.now().coerceIn(period.start, period.end)
            p?.payPeriodType == PayPeriodType.MONTHLY ->
                LocalDate.now().coerceIn(ym.atDay(1), ym.atEndOfMonth())
            else -> LocalDate.now()
        }
        val entryYm = YearMonth.from(effectiveDate)
        viewModelScope.launch {
            repository.addManualDeduction(
                ManualDeduction(
                    yearMonth = entryYm,
                    effectiveDate = effectiveDate,
                    label = label,
                    amount = amount,
                    entryType = type,
                ),
            )
        }
    }

    fun removeManualDeduction(id: Long) {
        viewModelScope.launch { repository.removeManualDeduction(id) }
    }

    fun addExpense(
        label: String,
        amount: Long,
        category: ExpenseCategory,
        date: LocalDate = LocalDate.now(),
        isFixed: Boolean = false,
    ) {
        val ym = YearMonth.from(date)
        viewModelScope.launch {
            repository.addExpense(
                ExpenseEntry(
                    yearMonth = ym,
                    date = date,
                    label = label,
                    amount = amount,
                    category = category,
                    isFixed = isFixed,
                ),
            )
        }
    }

    fun removeExpense(id: Long) {
        viewModelScope.launch { repository.removeExpense(id) }
    }

    fun savePreferences(prefs: AppPreferences) {
        viewModelScope.launch {
            repository.setPreferences(prefs)
            if (prefs.reminderEnabled) {
                ReminderScheduler.schedule(getApplication(), prefs.reminderHour, prefs.reminderMinute)
            } else {
                ReminderScheduler.cancel(getApplication())
            }
        }
    }

    fun updatePreferences(transform: (AppPreferences) -> AppPreferences) {
        savePreferences(transform(preferences.value))
    }

    fun syncNow(userId: String, onResult: (String?) -> Unit) {
        viewModelScope.launch {
            if (!NetworkMonitor.isOnline(getApplication())) {
                onResult("Sin conexión a internet. Conéctate para sincronizar tu respaldo.")
                return@launch
            }
            val error = repository.cloudSync.syncNow(userId)
            if (error == null) {
                repository.preferencesStore.update { it.copy(cloudBackupEnabled = true) }
            }
            onResult(error)
        }
    }

    fun exportPayrollPdf(onReady: (File) -> Unit) {
        val p = profile.value ?: return
        val payroll = payroll.value ?: return
        val use24 = preferences.value.use24HourFormat
        viewModelScope.launch {
            val file = PdfExporter.exportPayroll(getApplication(), p, payroll, use24)
            onReady(file)
        }
    }

    fun exportWorkDaysPdf(onReady: (File) -> Unit) {
        val p = profile.value ?: return
        val payroll = payroll.value ?: return
        val days = workDaysList.value
        val use24 = preferences.value.use24HourFormat
        viewModelScope.launch {
            val file = PdfExporter.exportWorkDays(getApplication(), p, payroll, days, use24)
            onReady(file)
        }
    }

    fun sharePdf(file: File): Intent {
        val uri = PdfExporter.shareUri(getApplication(), file)
        return Intent(Intent.ACTION_SEND).apply {
            type = "application/pdf"
            putExtra(Intent.EXTRA_STREAM, uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
    }

    fun setPendingUpdate(manifest: AppUpdateManifest?) {
        if (_appUpdate.value.downloading) return
        _appUpdate.value = if (manifest == null) {
            AppUpdateUiState()
        } else {
            _appUpdate.value.copy(manifest = manifest)
        }
    }

    fun dismissPendingUpdate() {
        if (_appUpdate.value.downloading) return
        val manifest = _appUpdate.value.manifest
        if (manifest != null) {
            viewModelScope.launch {
                repository.preferencesStore.update {
                    it.copy(dismissedUpdateVersionCode = manifest.versionCode)
                }
            }
        }
        _appUpdate.value = AppUpdateUiState()
    }

    fun checkForUpdates(
        force: Boolean = false,
        onResult: ((AppUpdateManifest?) -> Unit)? = null,
    ) {
        viewModelScope.launch {
            if (_appUpdate.value.downloading) {
                onResult?.invoke(null)
                return@launch
            }
            if (!mainAppActive && onResult == null) return@launch
            if (!NetworkMonitor.isOnline(getApplication())) {
                onResult?.invoke(null)
                return@launch
            }

            val prefs = preferences.value
            val now = System.currentTimeMillis()
            if (!force && now - prefs.lastUpdateCheckAtMs < UPDATE_CHECK_INTERVAL_MS) {
                return@launch
            }

            val update = app.appUpdateRepository.checkForUpdate()
            repository.preferencesStore.update { it.copy(lastUpdateCheckAtMs = now) }
            onResult?.invoke(update)

            if (update == null) return@launch
            if (force || update.versionCode > prefs.dismissedUpdateVersionCode) {
                setPendingUpdate(update)
            }
        }
    }

    fun setMainAppActive(active: Boolean) {
        mainAppActive = active
    }

    fun startUpdateDownload() {
        val manifest = _appUpdate.value.manifest ?: return
        if (_appUpdate.value.downloading) return
        viewModelScope.launch {
            _appUpdate.update { it.copy(downloading = true, progress = 0f) }
            try {
                val apk = app.appUpdateRepository.downloadApk(manifest) { progress ->
                    _appUpdate.update { it.copy(progress = progress) }
                }
                val canInstall = ApkInstaller.canInstall(getApplication())
                _appUpdate.update {
                    it.copy(
                        downloading = false,
                        progress = 1f,
                        downloadedApkPath = apk.absolutePath,
                        awaitingInstallPermission = !canInstall,
                    )
                }
                if (canInstall) {
                    ApkInstaller.installApk(getApplication(), apk)
                    _appUpdate.value = AppUpdateUiState()
                }
            } catch (_: Exception) {
                _appUpdate.update { it.copy(downloading = false) }
            }
        }
    }

    fun resumePendingApkInstall() {
        val path = _appUpdate.value.downloadedApkPath ?: return
        val file = File(path)
        if (!file.exists()) {
            _appUpdate.update { it.copy(downloadedApkPath = null) }
            return
        }
        if (ApkInstaller.canInstall(getApplication())) {
            ApkInstaller.installApk(getApplication(), file)
            _appUpdate.value = AppUpdateUiState()
        }
    }

    fun dismissInstallPermissionPrompt() {
        _appUpdate.update { it.copy(awaitingInstallPermission = false) }
    }

    companion object {
        private const val UPDATE_CHECK_INTERVAL_MS = 24L * 60 * 60 * 1000
    }

    class Factory(
        private val repository: NominaRepository,
        private val application: Application,
    ) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T =
            MainViewModel(repository, application) as T
    }
}
