package com.nominacopro.domain.calculator

import com.nominacopro.domain.law.ColombiaLaborLaw2026
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.temporal.TemporalAdjusters

/**
 * Dominical y festivo remunerado sin laborar: si el trabajador cumple la semana ordinaria
 * (5 días lun–vie), el empleador paga el domingo y los festivos no trabajados (CST art. 179–186).
 */
data class RemuneratedRestDays(
    val paidSundays: Int,
    val paidWeekdayHolidays: Int,
) {
    val totalDays: Int get() = paidSundays + paidWeekdayHolidays
}

object RemuneratedRestCalculator {

    fun calculate(
        start: LocalDate,
        end: LocalDate,
        workedDates: Set<LocalDate>,
        manualHolidays: Set<LocalDate>,
        workDaysPerWeek: Int = ColombiaLaborLaw2026.ORDINARY_WORK_DAYS_PER_WEEK,
    ): RemuneratedRestDays {
        var paidSundays = 0
        var paidWeekdayHolidays = 0

        var weekStart = start.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
        while (!weekStart.isAfter(end)) {
            if (weekQualifies(weekStart, start, end, workedDates, manualHolidays, workDaysPerWeek)) {
                for (offset in 0..6) {
                    val date = weekStart.plusDays(offset.toLong())
                    if (date.isBefore(start) || date.isAfter(end)) continue
                    if (workedDates.contains(date)) continue
                    when {
                        ColombiaLaborLaw2026.isSunday(date) -> paidSundays++
                        ColombiaLaborLaw2026.isWeekdayHoliday(date, manualHolidays) -> paidWeekdayHolidays++
                    }
                }
            }
            weekStart = weekStart.plusWeeks(1)
        }

        return RemuneratedRestDays(paidSundays, paidWeekdayHolidays)
    }

    private fun weekQualifies(
        weekStart: LocalDate,
        periodStart: LocalDate,
        periodEnd: LocalDate,
        workedDates: Set<LocalDate>,
        manualHolidays: Set<LocalDate>,
        workDaysPerWeek: Int,
    ): Boolean {
        var availableOrdinary = 0
        var workedOrdinary = 0
        for (offset in 0..6) {
            val date = weekStart.plusDays(offset.toLong())
            if (date.isBefore(periodStart) || date.isAfter(periodEnd)) continue
            if (!ColombiaLaborLaw2026.isOrdinaryWorkday(date, manualHolidays)) continue
            availableOrdinary++
            if (workedDates.contains(date)) workedOrdinary++
        }
        if (availableOrdinary == 0) return false
        val required = minOf(workDaysPerWeek, availableOrdinary)
        return workedOrdinary >= required
    }
}
