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
import com.nominacopro.domain.model.WorkDayEntry
import com.nominacopro.export.PdfExporter
import com.nominacopro.notifications.ReminderScheduler
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
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

    val dashboard: StateFlow<List<MonthSummary>> = repository.observeDashboard(3).stateIn(
        viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList(),
    )

    fun prevMonth() { _yearMonth.value = _yearMonth.value.minusMonths(1) }
    fun nextMonth() { _yearMonth.value = _yearMonth.value.plusMonths(1) }
    fun goToday() { _yearMonth.value = YearMonth.now() }

    fun saveProfile(profile: EmployeeProfile) {
        viewModelScope.launch { repository.saveProfile(profile) }
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
        val ym = _yearMonth.value
        viewModelScope.launch {
            repository.addManualDeduction(
                ManualDeduction(
                    yearMonth = ym,
                    label = label,
                    amount = amount,
                ),
            )
        }
    }

    fun removeManualDeduction(id: Long) {
        viewModelScope.launch { repository.removeManualDeduction(id) }
    }

    fun updatePreferences(transform: (AppPreferences) -> AppPreferences) {
        viewModelScope.launch {
            val updated = transform(preferences.value)
            repository.setPreferences(updated)
            if (updated.reminderEnabled) {
                ReminderScheduler.schedule(getApplication(), updated.reminderHour, updated.reminderMinute)
            } else {
                ReminderScheduler.cancel(getApplication())
            }
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
