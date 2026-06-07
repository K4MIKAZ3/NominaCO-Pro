package com.nominacopro.domain.calculator

import org.junit.Assert.assertEquals
import org.junit.Test
import java.time.LocalDate

class RemuneratedRestCalculatorTest {

    @Test
    fun fullWeekMonToFri_paysSunday() {
        val worked = (1..5).map { LocalDate.of(2026, 6, it) }.toSet() // lun–vie 1–5 jun
        val result = RemuneratedRestCalculator.calculate(
            start = LocalDate.of(2026, 6, 1),
            end = LocalDate.of(2026, 6, 15),
            workedDates = worked,
            manualHolidays = emptySet(),
        )
        assertEquals(1, result.paidSundays)
        assertEquals(0, result.paidWeekdayHolidays)
    }

    @Test
    fun incompleteWeek_doesNotPaySunday() {
        val worked = setOf(
            LocalDate.of(2026, 6, 2),
            LocalDate.of(2026, 6, 3),
            LocalDate.of(2026, 6, 4),
        )
        val result = RemuneratedRestCalculator.calculate(
            start = LocalDate.of(2026, 6, 1),
            end = LocalDate.of(2026, 6, 15),
            workedDates = worked,
            manualHolidays = emptySet(),
        )
        assertEquals(0, result.paidSundays)
    }

    @Test
    fun weekdayHoliday_paidWhenWeekCompleted() {
        // Semana 15–21 jun: festivo lun 15; trabaja mar–vie 16–19
        val worked = (16..19).map { LocalDate.of(2026, 6, it) }.toSet()
        val result = RemuneratedRestCalculator.calculate(
            start = LocalDate.of(2026, 6, 15),
            end = LocalDate.of(2026, 6, 21),
            workedDates = worked,
            manualHolidays = emptySet(),
        )
        assertEquals(1, result.paidWeekdayHolidays) // lun 15
        assertEquals(1, result.paidSundays) // dom 21
    }

    @Test
    fun workedSunday_notDoublePaid() {
        val worked = (1..7).map { LocalDate.of(2026, 6, it) }.toSet() // lun–dom, domingo laborado
        val result = RemuneratedRestCalculator.calculate(
            start = LocalDate.of(2026, 6, 1),
            end = LocalDate.of(2026, 6, 15),
            workedDates = worked,
            manualHolidays = emptySet(),
        )
        assertEquals(0, result.paidSundays)
    }
}
