package com.nominacopro.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.nominacopro.data.CalendarMark
import com.nominacopro.data.NominaRepository
import com.nominacopro.domain.model.DayType
import com.nominacopro.domain.model.EmployeeProfile
import com.nominacopro.domain.model.MonthlyPayroll
import com.nominacopro.domain.model.WorkDayEntry
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.LocalTime
import java.time.YearMonth

@OptIn(ExperimentalCoroutinesApi::class)
class MainViewModel(private val repository: NominaRepository) : ViewModel() {

    private val _yearMonth = MutableStateFlow(YearMonth.now())
    val yearMonth: StateFlow<YearMonth> = _yearMonth.asStateFlow()

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

    class Factory(private val repository: NominaRepository) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T =
            MainViewModel(repository) as T
    }
}
