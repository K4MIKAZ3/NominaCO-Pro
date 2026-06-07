package com.nominacopro.domain.calculator

import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.domain.model.EmployeeProfile
import com.nominacopro.domain.model.HourBreakdown
import com.nominacopro.domain.model.ManualDeduction
import com.nominacopro.domain.model.MonthlyPayroll
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
        val hourly = ColombiaLaborLaw2026.hourlyRate(profile.monthlySalary, profile.dailyHours)
        val daysInMonth = ym.lengthOfMonth()

        var breakdown = HourBreakdown()
        var workedDays = 0
        var restDays = 0

        for (d in 1..daysInMonth) {
            val date = LocalDate.of(year, month, d)
            if (ColombiaLaborLaw2026.isRestDay(date, manualHolidays)) restDays++
            val entry = entries.find { it.date == date } ?: continue
            workedDays++
            val dayBreakdown = HourCalculator.calculate(
                entry = entry,
                dailyHours = profile.dailyHours,
                isRestDay = ColombiaLaborLaw2026.isRestDay(date, manualHolidays),
            )
            breakdown = breakdown + dayBreakdown
        }

        val domFactor = ColombiaLaborLaw2026.dominicalFactor(LocalDate.of(year, month, 15))

        val baseProportional = proportionalBase(profile.monthlySalary, workedDays, restDays, daysInMonth)
        val transport = if (ColombiaLaborLaw2026.qualifiesTransport(profile.monthlySalary)) {
            (ColombiaLaborLaw2026.SUBSIDIO_TRANSPORTE * workedDays / workingDaysInMonth(year, month, manualHolidays)).toLong()
        } else 0L

        val recargoNocturno = pay(hourly, breakdown.nocturnaOrdinaria, ColombiaLaborLaw2026.Factors.NOCTURNA - 1.0)
        val extraDiurna = pay(hourly, breakdown.extraDiurna, ColombiaLaborLaw2026.Factors.EXTRA_DIURNA)
        val extraNocturna = pay(hourly, breakdown.extraNocturna, ColombiaLaborLaw2026.Factors.EXTRA_NOCTURNA)
        val recargoDomDiurno = pay(hourly, breakdown.dominicalDiurna, domFactor - 1.0)
        val recargoDomNocturno = pay(hourly, breakdown.dominicalNocturna, (domFactor - 1.0) + (ColombiaLaborLaw2026.Factors.NOCTURNA - 1.0))
        val extraDomDiurna = pay(hourly, breakdown.extraDominicalDiurna, ColombiaLaborLaw2026.extraDominicalDiurnaFactor(LocalDate.of(year, month, 15)))
        val extraDomNocturna = pay(hourly, breakdown.extraDominicalNocturna, ColombiaLaborLaw2026.extraDominicalNocturnaFactor(LocalDate.of(year, month, 15)))

        val earnings = buildList {
            add(PayrollLine("Salario base proporcional", baseProportional, code = "SBP"))
            if (transport > 0) add(PayrollLine("Subsidio de transporte", transport, code = "ST"))
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
            year = year,
            month = month,
            workedDays = workedDays,
            restDays = restDays,
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
        if (manual.isEmpty()) return payroll
        val lines = manual.map { PayrollLine(it.label, it.amount, isDeduction = true) }
        val total = manual.sumOf { it.amount }
        return payroll.copy(
            manualDeductions = lines,
            netTotal = payroll.netTotal - total,
        )
    }

    private fun proportionalBase(salary: Long, worked: Int, rest: Int, daysInMonth: Int): Long {
        val paidDays = worked + rest
        return (salary * paidDays / ColombiaLaborLaw2026.DIAS_MES_REFERENCIA.toDouble()).toLong()
            .coerceAtMost(salary)
    }

    private fun workingDaysInMonth(year: Int, month: Int, manual: Set<LocalDate>): Int {
        val ym = YearMonth.of(year, month)
        var count = 0
        for (d in 1..ym.lengthOfMonth()) {
            val date = LocalDate.of(year, month, d)
            if (!ColombiaLaborLaw2026.isRestDay(date, manual)) count++
        }
        return count.coerceAtLeast(1)
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
