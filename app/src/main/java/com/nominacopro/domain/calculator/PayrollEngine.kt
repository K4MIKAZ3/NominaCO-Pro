package com.nominacopro.domain.calculator

import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.domain.model.EmployeeProfile
import com.nominacopro.domain.model.HourBreakdown
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
            add(PayrollLine("Salario base proporcional", baseProportional))
            if (transport > 0) add(PayrollLine("Subsidio de transporte", transport))
            if (recargoNocturno > 0) add(PayrollLine("Recargo nocturno (+35%)", recargoNocturno))
            if (extraDiurna > 0) add(PayrollLine("Horas extra diurnas (+25%)", extraDiurna))
            if (extraNocturna > 0) add(PayrollLine("Horas extra nocturnas (+75%)", extraNocturna))
            if (recargoDomDiurno > 0) add(PayrollLine("Recargo dominical/festivo diurno", recargoDomDiurno))
            if (recargoDomNocturno > 0) add(PayrollLine("Recargo dominical/festivo nocturno", recargoDomNocturno))
            if (extraDomDiurna > 0) add(PayrollLine("Extra dominical/festivo diurna", extraDomDiurna))
            if (extraDomNocturna > 0) add(PayrollLine("Extra dominical/festivo nocturna", extraDomNocturna))
        }

        val gross = earnings.sumOf { it.amount }
        val salud = (gross * ColombiaLaborLaw2026.DESCUENTO_SALUD).toLong()
        val pension = (gross * ColombiaLaborLaw2026.DESCUENTO_PENSION).toLong()
        val deductions = listOf(
            PayrollLine("Aporte salud (4%)", salud, isDeduction = true),
            PayrollLine("Aporte pensión (4%)", pension, isDeduction = true),
        )

        return MonthlyPayroll(
            year = year,
            month = month,
            workedDays = workedDays,
            restDays = restDays,
            breakdown = breakdown,
            earnings = earnings,
            deductions = deductions,
            grossTotal = gross,
            netTotal = gross - salud - pension,
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
