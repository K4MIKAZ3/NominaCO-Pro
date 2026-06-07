package com.nominacopro.domain.payperiod

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate
import java.time.YearMonth

class PayPeriodCalculatorTest {

    @Test
    fun monthlyPeriods_returnsEmpty() {
        val periods = PayPeriodCalculator.periodsInMonth(PayPeriodType.MONTHLY, YearMonth.of(2026, 6))
        assertTrue(periods.isEmpty())
    }

    @Test
    fun monthly_hasNoSubPeriods() {
        assertTrue(!PayPeriodType.MONTHLY.hasSubPeriods)
        assertTrue(PayPeriodType.BIWEEKLY.hasSubPeriods)
    }

    @Test
    fun biweeklyPeriods_splitsMonthInTwo() {
        val periods = PayPeriodCalculator.periodsInMonth(PayPeriodType.BIWEEKLY, YearMonth.of(2026, 6))
        assertEquals(2, periods.size)
        assertEquals(1, periods[0].start.dayOfMonth)
        assertEquals(15, periods[0].end.dayOfMonth)
        assertEquals(16, periods[1].start.dayOfMonth)
        assertEquals(30, periods[1].end.dayOfMonth)
    }

    @Test
    fun venteenPeriods_overlapMonth() {
        val periods = PayPeriodCalculator.periodsInMonth(PayPeriodType.VENTEEN, YearMonth.of(2026, 2))
        assertTrue(periods.isNotEmpty())
    }

    @Test
    fun defaultPeriodIndex_selectsCurrentQuincena() {
        val index = PayPeriodCalculator.defaultPeriodIndex(
            PayPeriodType.BIWEEKLY,
            YearMonth.of(2026, 6),
            LocalDate.of(2026, 6, 20),
        )
        assertEquals(1, index)
    }

    @Test
    fun defaultPeriodIndex_monthlyIsZero() {
        val index = PayPeriodCalculator.defaultPeriodIndex(
            PayPeriodType.MONTHLY,
            YearMonth.of(2026, 6),
            LocalDate.of(2026, 6, 20),
        )
        assertEquals(0, index)
    }
}
