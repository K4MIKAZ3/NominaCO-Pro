package com.nominacopro.domain.model

import java.time.LocalDate
import java.time.LocalTime
import java.time.YearMonth

enum class DayType {
    NORMAL,
    FESTIVO_DOMINICAL,
    FESTIVO_NOCTURNO,
}

enum class ContractType(val label: String) {
    INDEFINIDO("Indefinido"),
    OBRA_LABOR("Obra o labor"),
    TERMINO_DEFINIDO("Término definido"),
    ;

    companion object {
        fun fromStored(value: String?): ContractType =
            entries.find { it.name == value } ?: INDEFINIDO
    }
}

data class WorkDayEntry(
    val date: LocalDate,
    val start: LocalTime,
    val end: LocalTime,
    val dayType: DayType = DayType.NORMAL,
    val notes: String = "",
)

data class HourBreakdown(
    val normalDiurna: Double = 0.0,
    val nocturnaOrdinaria: Double = 0.0,
    val extraDiurna: Double = 0.0,
    val extraNocturna: Double = 0.0,
    val dominicalDiurna: Double = 0.0,
    val dominicalNocturna: Double = 0.0,
    val extraDominicalDiurna: Double = 0.0,
    val extraDominicalNocturna: Double = 0.0,
) {
    val totalHours: Double =
        normalDiurna + nocturnaOrdinaria + extraDiurna + extraNocturna +
            dominicalDiurna + dominicalNocturna + extraDominicalDiurna + extraDominicalNocturna
}

data class EmployeeProfile(
    val name: String,
    val documentId: String,
    val jobTitle: String,
    val monthlySalary: Long,
    val dailyHours: Int = 8,
    val contractType: ContractType = ContractType.INDEFINIDO,
)

data class PayrollLine(
    val label: String,
    val amount: Long,
    val isDeduction: Boolean = false,
    val code: String? = null,
    val hours: Double? = null,
)

data class ManualDeduction(
    val id: Long = 0,
    val cloudId: String? = null,
    val yearMonth: YearMonth,
    val label: String,
    val amount: Long,
)

data class MonthlyPayroll(
    val year: Int,
    val month: Int,
    val workedDays: Int,
    val restDays: Int,
    val breakdown: HourBreakdown,
    val earnings: List<PayrollLine>,
    val legalDeductions: List<PayrollLine>,
    val manualDeductions: List<PayrollLine> = emptyList(),
    val grossTotal: Long,
    val netTotal: Long,
    val dailyRate: Long = 0,
    val hourlyRate: Double = 0.0,
) {
    val allDeductions: List<PayrollLine> = legalDeductions + manualDeductions
}

data class MonthSummary(
    val yearMonth: YearMonth,
    val grossTotal: Long,
    val legalDeductions: Long,
    val manualDeductions: Long,
    val netTotal: Long,
)

data class AppPreferences(
    val defaultStartHour: Int = 8,
    val defaultStartMinute: Int = 0,
    val defaultEndHour: Int = 16,
    val defaultEndMinute: Int = 30,
    val use24HourFormat: Boolean = true,
    val reminderEnabled: Boolean = false,
    val reminderHour: Int = 18,
    val reminderMinute: Int = 0,
    val darkModeEnabled: Boolean = true,
    val biometricEnabled: Boolean = false,
)
