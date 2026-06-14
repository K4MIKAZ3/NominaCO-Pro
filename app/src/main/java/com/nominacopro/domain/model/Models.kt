package com.nominacopro.domain.model

import com.nominacopro.domain.payperiod.PayPeriodType
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

enum class PayrollEntryType(val label: String) {
    DEDUCTION("Egreso / préstamo"),
    ADVANCE("Avance recibido"),
    BONUS("Bono"),
    ;

    companion object {
        fun fromStored(value: String?): PayrollEntryType =
            entries.find { it.name == value } ?: DEDUCTION
    }
}

data class EmployeeProfile(
    val name: String,
    val documentId: String,
    val jobTitle: String,
    val monthlySalary: Long,
    val dailyHours: Int = 8,
    val contractType: ContractType = ContractType.INDEFINIDO,
    val payPeriodType: PayPeriodType = PayPeriodType.BIWEEKLY,
    val pendingVacationDays: Int = 0,
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
    val effectiveDate: LocalDate,
    val label: String,
    val amount: Long,
    val entryType: PayrollEntryType = PayrollEntryType.DEDUCTION,
)

enum class ExpenseCategory(val label: String) {
    HOUSING("Vivienda"),
    FOOD("Alimentación"),
    TRANSPORT("Transporte"),
    HEALTH("Salud"),
    LEISURE("Ocio"),
    EDUCATION("Educación"),
    OTHER("Otros"),
    ;

    companion object {
        fun fromStored(value: String?): ExpenseCategory =
            entries.find { it.name == value } ?: OTHER
    }
}

data class ExpenseEntry(
    val id: Long = 0,
    val cloudId: String? = null,
    val yearMonth: YearMonth,
    val date: LocalDate,
    val label: String,
    val amount: Long,
    val category: ExpenseCategory = ExpenseCategory.OTHER,
    val isFixed: Boolean = false,
)

data class MonthlyPayroll(
    val year: Int,
    val month: Int,
    val workedDays: Int,
    val restDays: Int,
    val remuneratedRestDays: Int = 0,
    val breakdown: HourBreakdown,
    val earnings: List<PayrollLine>,
    val legalDeductions: List<PayrollLine>,
    val manualDeductions: List<PayrollLine> = emptyList(),
    val manualBonuses: List<PayrollLine> = emptyList(),
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

data class PeriodPayrollSummary(
    val periodLabel: String,
    val periodStart: LocalDate,
    val periodEnd: LocalDate,
    val workedDays: Int,
    val dailyRate: Long,
    val grossTotal: Long,
    val legalDeductions: Long,
    val manualDeductions: Long,
    val bonuses: Long,
    val advances: Long,
    val netTotal: Long,
    val pendingBalance: Long,
)

data class SemesterSettlement(
    val label: String,
    val start: LocalDate,
    val end: LocalDate,
    val workedDays: Int,
    val remuneratedRestDays: Int,
    val primaAmount: Long,
    val paymentDeadline: String,
) {
    val totalDays: Int get() = workedDays + remuneratedRestDays
}

data class LiquidationEstimate(
    val cesantias: Long,
    val interesesCesantias: Long,
    val primaProporcional: Long,
    val vacaciones: Long,
    val pendingVacationDays: Int,
    val periodEnd: LocalDate,
    val total: Long,
)

data class YearSettlementReport(
    val year: Int,
    val firstSemester: SemesterSettlement,
    val secondSemester: SemesterSettlement,
    val annualCesantias: Long,
    val annualInteresesCesantias: Long,
    val liquidation: LiquidationEstimate,
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
    val cloudBackupEnabled: Boolean = false,
    val offlineModeEnabled: Boolean = false,
    val lastUpdateCheckAtMs: Long = 0,
    val dismissedUpdateVersionCode: Int = 0,
)
