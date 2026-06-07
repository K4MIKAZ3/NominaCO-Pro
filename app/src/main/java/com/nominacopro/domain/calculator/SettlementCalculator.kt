package com.nominacopro.domain.calculator

import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.domain.model.EmployeeProfile
import com.nominacopro.domain.model.LiquidationEstimate
import com.nominacopro.domain.model.SemesterSettlement
import com.nominacopro.domain.model.WorkDayEntry
import com.nominacopro.domain.model.YearSettlementReport
import java.time.LocalDate

/**
 * Prima de servicios, cesantías e intereses — CST arts. 249, 306–308; Ley 344/1996.
 * Base prestacional = salario + auxilio de transporte (si aplica).
 * Fórmula: base × días devengados ÷ 360 (año comercial laboral).
 */
object SettlementCalculator {

    fun calculate(
        profile: EmployeeProfile,
        year: Int,
        entries: List<WorkDayEntry>,
        manualHolidays: Set<LocalDate>,
        pendingVacationDays: Int = 0,
        asOf: LocalDate = LocalDate.now(),
    ): YearSettlementReport {
        val yearEnd = minOf(asOf, LocalDate.of(year, 12, 31))
        val yearStart = LocalDate.of(year, 1, 1)
        if (yearEnd.isBefore(yearStart)) {
            return emptyReport(year, pendingVacationDays, yearEnd)
        }

        val yearEntries = entries.filter { it.date.year == year && !it.date.isAfter(yearEnd) }

        val sem1Start = LocalDate.of(year, 1, 1)
        val sem1End = minOf(LocalDate.of(year, 6, 30), yearEnd)
        val sem2Start = LocalDate.of(year, 7, 1)
        val sem2End = yearEnd

        val firstSemester = semesterSettlement(
            profile, yearEntries, manualHolidays, sem1Start, sem1End,
            label = "Primer semestre (ene–jun)",
            deadline = "30 de junio",
        )
        val secondSemester = if (!yearEnd.isBefore(sem2Start)) {
            semesterSettlement(
                profile, yearEntries, manualHolidays, sem2Start, sem2End,
                label = "Segundo semestre (jul–dic)",
                deadline = "20 de diciembre",
            )
        } else {
            SemesterSettlement(
                label = "Segundo semestre (jul–dic)",
                start = sem2Start,
                end = LocalDate.of(year, 12, 31),
                workedDays = 0,
                remuneratedRestDays = 0,
                primaAmount = 0L,
                paymentDeadline = "20 de diciembre",
            )
        }

        val annualPayroll = PayrollEngine.liquidateDateRange(
            profile = profile,
            start = yearStart,
            end = yearEnd,
            entries = yearEntries,
            manualHolidays = manualHolidays,
            referenceYear = year,
            referenceMonth = 1,
        )
        val annualDays = annualPayroll.workedDays + annualPayroll.remuneratedRestDays
        val cesantias = prestacionesAmount(profile, annualDays)
        val intereses = (cesantias * ColombiaLaborLaw2026.INTERES_CESANTIAS_ANUAL * annualDays /
            ColombiaLaborLaw2026.DIAS_ANIO_PRESTACIONES).toLong()

        val currentSemesterPrima = if (!yearEnd.isBefore(sem2Start)) {
            secondSemester.primaAmount
        } else {
            firstSemester.primaAmount
        }

        val vacaciones = ColombiaLaborLaw2026.dailyRate(profile.monthlySalary)
            .toLong() * pendingVacationDays.coerceAtLeast(0)

        val liquidation = LiquidationEstimate(
            cesantias = cesantias,
            interesesCesantias = intereses,
            primaProporcional = currentSemesterPrima,
            vacaciones = vacaciones,
            pendingVacationDays = pendingVacationDays.coerceAtLeast(0),
            periodEnd = yearEnd,
            total = cesantias + intereses + currentSemesterPrima + vacaciones,
        )

        return YearSettlementReport(
            year = year,
            firstSemester = firstSemester,
            secondSemester = secondSemester,
            annualCesantias = cesantias,
            annualInteresesCesantias = intereses,
            liquidation = liquidation,
        )
    }

    private fun semesterSettlement(
        profile: EmployeeProfile,
        allEntries: List<WorkDayEntry>,
        manualHolidays: Set<LocalDate>,
        start: LocalDate,
        end: LocalDate,
        label: String,
        deadline: String,
    ): SemesterSettlement {
        if (end.isBefore(start)) {
            return SemesterSettlement(label, start, end, 0, 0, 0L, deadline)
        }
        val slice = allEntries.filter { it.date in start..end }
        val payroll = PayrollEngine.liquidateDateRange(
            profile = profile,
            start = start,
            end = end,
            entries = slice,
            manualHolidays = manualHolidays,
            referenceYear = start.year,
            referenceMonth = start.monthValue,
        )
        val days = payroll.workedDays + payroll.remuneratedRestDays
        return SemesterSettlement(
            label = label,
            start = start,
            end = end,
            workedDays = payroll.workedDays,
            remuneratedRestDays = payroll.remuneratedRestDays,
            primaAmount = prestacionesAmount(profile, days),
            paymentDeadline = deadline,
        )
    }

    private fun prestacionesAmount(profile: EmployeeProfile, days: Int): Long {
        if (days <= 0) return 0L
        val base = profile.monthlySalary +
            if (ColombiaLaborLaw2026.qualifiesTransport(profile.monthlySalary)) {
                ColombiaLaborLaw2026.SUBSIDIO_TRANSPORTE
            } else {
                0L
            }
        return (base * days / ColombiaLaborLaw2026.DIAS_ANIO_PRESTACIONES).toLong()
    }

    private fun emptyReport(year: Int, vacationDays: Int, end: LocalDate) = YearSettlementReport(
        year = year,
        firstSemester = SemesterSettlement("Primer semestre", LocalDate.of(year, 1, 1), LocalDate.of(year, 6, 30), 0, 0, 0L, "30 de junio"),
        secondSemester = SemesterSettlement("Segundo semestre", LocalDate.of(year, 7, 1), LocalDate.of(year, 12, 31), 0, 0, 0L, "20 de diciembre"),
        annualCesantias = 0L,
        annualInteresesCesantias = 0L,
        liquidation = LiquidationEstimate(0, 0, 0, 0, vacationDays, end, 0),
    )
}
