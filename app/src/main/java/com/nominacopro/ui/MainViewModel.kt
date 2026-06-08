package com.nominacopro.ui

import android.app.Application
import android.content.Intent
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.nominacopro.data.CalendarMark
import com.nominacopro.data.NominaRepository
import com.nominacopro.domain.model.AppPreferences
import com.nominacopro.domain.model.DayType
import com.nominacopro.domain.model.EmployeeProfile
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
import kotlinx.coroutines.launch
import java.io.File
import java.time.LocalDate
import java.time.LocalTime
import java.time.YearMonth

@OptIn(ExperimentalCoroutinesApi::class)
class MainViewModel(
    private val repository: NominaRepository,
    application: Application,
) : AndroidViewModel(application) {

    private val _yearMonth = MutableStateFlow(YearMonth.now())
    val yearMonth: StateFlow<YearMonth> = _yearMonth.asStateFlow()

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

    class Factory(
        private val repository: NominaRepository,
        private val application: Application,
    ) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T =
            MainViewModel(repository, application) as T
    }
}
