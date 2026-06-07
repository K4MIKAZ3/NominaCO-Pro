package com.nominacopro.domain.calculator

import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.domain.model.EmployeeProfile
import com.nominacopro.domain.model.HourBreakdown
import com.nominacopro.domain.model.ManualDeduction
import com.nominacopro.domain.model.PayrollEntryType
import com.nominacopro.domain.model.MonthlyPayroll
import com.nominacopro.domain.model.PeriodPayrollSummary
import com.nominacopro.domain.model.PayrollLine
import com.nominacopro.domain.model.WorkDayEntry
import java.time.LocalDate
import java.time.YearMonth

object PayrollEngine {

    fun liquidateMonth(
        profile: EmployeeProfile,
        year: Int,
        month: Int,
        entries: List<WorkDayEntry>,
        manualHolidays: Set<LocalDate>,
    ): MonthlyPayroll {
        val ym = YearMonth.of(year, month)
        return liquidateDateRange(
            profile = profile,
            start = ym.atDay(1),
            end = ym.atEndOfMonth(),
            entries = entries,
            manualHolidays = manualHolidays,
            referenceYear = year,
            referenceMonth = month,
        )
    }

    fun liquidateDateRange(
        profile: EmployeeProfile,
        start: LocalDate,
        end: LocalDate,
        entries: List<WorkDayEntry>,
        manualHolidays: Set<LocalDate>,
        referenceYear: Int = start.year,
        referenceMonth: Int = start.monthValue,
    ): MonthlyPayroll {
        val dailyRate = ColombiaLaborLaw2026.dailyRate(profile.monthlySalary)
        val hourly = ColombiaLaborLaw2026.hourlyRate(profile.monthlySalary, profile.dailyHours)

        var breakdown = HourBreakdown()
        var workedDays = 0
        var restDays = 0

        var date = start
        while (!date.isAfter(end)) {
            if (ColombiaLaborLaw2026.isRestDay(date, manualHolidays)) restDays++
            val entry = entries.find { it.date == date }
            if (entry != null) {
                workedDays++
                val dayBreakdown = HourCalculator.calculate(
                    entry = entry,
                    dailyHours = profile.dailyHours,
                    isRestDay = ColombiaLaborLaw2026.isRestDay(date, manualHolidays),
                )
                breakdown = breakdown + dayBreakdown
            }
            date = date.plusDays(1)
        }

        val workedDates = entries.map { it.date }.toSet()
        val remuneratedRest = RemuneratedRestCalculator.calculate(
            start = start,
            end = end,
            workedDates = workedDates,
            manualHolidays = manualHolidays,
        )
        val dominicalPay = ColombiaLaborLaw2026.remuneratedRestPay(
            profile.monthlySalary,
            remuneratedRest.paidSundays,
        )
        val holidayPay = ColombiaLaborLaw2026.remuneratedRestPay(
            profile.monthlySalary,
            remuneratedRest.paidWeekdayHolidays,
        )

        val midDate = start.plusDays((java.time.temporal.ChronoUnit.DAYS.between(start, end) / 2).coerceAtLeast(0))
        val domFactor = ColombiaLaborLaw2026.dominicalFactor(midDate)

        val baseProportional = ColombiaLaborLaw2026.proportionalBaseSalary(profile.monthlySalary, workedDays)
        val transport = if (ColombiaLaborLaw2026.qualifiesTransport(profile.monthlySalary)) {
            ColombiaLaborLaw2026.transportSubsidyForDays(workedDays)
        } else {
            0L
        }

        val recargoNocturno = pay(hourly, breakdown.nocturnaOrdinaria, ColombiaLaborLaw2026.Factors.NOCTURNA - 1.0)
        val extraDiurna = pay(hourly, breakdown.extraDiurna, ColombiaLaborLaw2026.Factors.EXTRA_DIURNA)
        val extraNocturna = pay(hourly, breakdown.extraNocturna, ColombiaLaborLaw2026.Factors.EXTRA_NOCTURNA)
        val recargoDomDiurno = pay(hourly, breakdown.dominicalDiurna, domFactor - 1.0)
        val recargoDomNocturno = pay(hourly, breakdown.dominicalNocturna, (domFactor - 1.0) + (ColombiaLaborLaw2026.Factors.NOCTURNA - 1.0))
        val extraDomDiurna = pay(hourly, breakdown.extraDominicalDiurna, ColombiaLaborLaw2026.extraDominicalDiurnaFactor(midDate))
        val extraDomNocturna = pay(hourly, breakdown.extraDominicalNocturna, ColombiaLaborLaw2026.extraDominicalNocturnaFactor(midDate))

        val earnings = buildList {
            add(PayrollLine("Salario base proporcional", baseProportional, code = "SBP"))
            if (transport > 0) add(PayrollLine("Subsidio de transporte", transport, code = "ST"))
            if (dominicalPay > 0) {
                add(
                    PayrollLine(
                        "Dominical remunerado (${remuneratedRest.paidSundays} día(s))",
                        dominicalPay,
                        code = "DRD",
                    ),
                )
            }
            if (holidayPay > 0) {
                add(
                    PayrollLine(
                        "Festivo remunerado (${remuneratedRest.paidWeekdayHolidays} día(s))",
                        holidayPay,
                        code = "FER",
                    ),
                )
            }
            if (recargoNocturno > 0) {
                add(PayrollLine("Recargo nocturno (+35%)", recargoNocturno, code = "RN", hours = breakdown.nocturnaOrdinaria))
            }
            if (extraDiurna > 0) {
                add(PayrollLine("Horas extra diurnas (+25%)", extraDiurna, code = "HED", hours = breakdown.extraDiurna))
            }
            if (extraNocturna > 0) {
                add(PayrollLine("Horas extra nocturnas (+75%)", extraNocturna, code = "HEN", hours = breakdown.extraNocturna))
            }
            if (recargoDomDiurno > 0) {
                add(PayrollLine("Recargo dominical/festivo diurno", recargoDomDiurno, code = "RDD", hours = breakdown.dominicalDiurna))
            }
            if (recargoDomNocturno > 0) {
                add(PayrollLine("Recargo dominical/festivo nocturno", recargoDomNocturno, code = "RDN", hours = breakdown.dominicalNocturna))
            }
            if (extraDomDiurna > 0) {
                add(PayrollLine("Extra dominical/festivo diurna", extraDomDiurna, code = "EDD", hours = breakdown.extraDominicalDiurna))
            }
            if (extraDomNocturna > 0) {
                add(PayrollLine("Extra dominical/festivo nocturna", extraDomNocturna, code = "EDN", hours = breakdown.extraDominicalNocturna))
            }
        }

        val gross = earnings.sumOf { it.amount }
        val salud = (gross * ColombiaLaborLaw2026.DESCUENTO_SALUD).toLong()
        val pension = (gross * ColombiaLaborLaw2026.DESCUENTO_PENSION).toLong()
        val legalDeductions = listOf(
            PayrollLine("Aporte salud (4%)", salud, isDeduction = true, code = "SAL"),
            PayrollLine("Aporte pensión (4%)", pension, isDeduction = true, code = "PEN"),
        )

        return MonthlyPayroll(
            year = referenceYear,
            month = referenceMonth,
            workedDays = workedDays,
            restDays = restDays,
            remuneratedRestDays = remuneratedRest.totalDays,
            dailyRate = dailyRate.toLong(),
            hourlyRate = hourly,
            breakdown = breakdown,
            earnings = earnings,
            legalDeductions = legalDeductions,
            manualDeductions = emptyList(),
            grossTotal = gross,
            netTotal = gross - salud - pension,
        )
    }

    fun applyManualDeductions(
        payroll: MonthlyPayroll,
        manual: List<ManualDeduction>,
    ): MonthlyPayroll {
        val deductions = manual.filter { it.entryType == PayrollEntryType.DEDUCTION }
        if (deductions.isEmpty()) return payroll
        val lines = deductions.map { PayrollLine(it.label, it.amount, isDeduction = true) }
        val total = deductions.sumOf { it.amount }
        return payroll.copy(
            manualDeductions = lines,
            netTotal = payroll.netTotal - total,
        )
    }

    fun buildPeriodSummary(
        payroll: MonthlyPayroll,
        periodLabel: String,
        periodStart: LocalDate,
        periodEnd: LocalDate,
        manualEntries: List<ManualDeduction>,
    ): PeriodPayrollSummary {
        val deductions = manualEntries.filter { it.entryType == PayrollEntryType.DEDUCTION }
        val advances = manualEntries.filter { it.entryType == PayrollEntryType.ADVANCE }
        val payrollWithDeductions = applyManualDeductions(payroll, deductions)
        val advancesTotal = advances.sumOf { it.amount }
        return PeriodPayrollSummary(
            periodLabel = periodLabel,
            periodStart = periodStart,
            periodEnd = periodEnd,
            workedDays = payroll.workedDays,
            dailyRate = payroll.dailyRate,
            grossTotal = payroll.grossTotal,
            legalDeductions = payroll.legalDeductions.sumOf { it.amount },
            manualDeductions = deductions.sumOf { it.amount },
            advances = advancesTotal,
            netTotal = payrollWithDeductions.netTotal,
            pendingBalance = payrollWithDeductions.netTotal - advancesTotal,
        )
    }

    private fun pay(hourly: Double, hours: Double, factor: Double): Long =
        if (hours <= 0) 0L else (hourly * hours * factor).toLong()

    private operator fun HourBreakdown.plus(other: HourBreakdown) = HourBreakdown(
        normalDiurna = normalDiurna + other.normalDiurna,
        nocturnaOrdinaria = nocturnaOrdinaria + other.nocturnaOrdinaria,
        extraDiurna = extraDiurna + other.extraDiurna,
        extraNocturna = extraNocturna + other.extraNocturna,
        dominicalDiurna = dominicalDiurna + other.dominicalDiurna,
        dominicalNocturna = dominicalNocturna + other.dominicalNocturna,
        extraDominicalDiurna = extraDominicalDiurna + other.extraDominicalDiurna,
        extraDominicalNocturna = extraDominicalNocturna + other.extraDominicalNocturna,
    )
}
