package com.nominacopro.domain.model

import java.time.LocalDate
import java.time.LocalTime

enum class DayType {
    NORMAL,
    FESTIVO_DOMINICAL,
    FESTIVO_NOCTURNO,
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
)

data class PayrollLine(
    val label: String,
    val amount: Long,
    val isDeduction: Boolean = false,
)

data class MonthlyPayroll(
    val year: Int,
    val month: Int,
    val workedDays: Int,
    val restDays: Int,
    val breakdown: HourBreakdown,
    val earnings: List<PayrollLine>,
    val deductions: List<PayrollLine>,
    val grossTotal: Long,
    val netTotal: Long,
)
