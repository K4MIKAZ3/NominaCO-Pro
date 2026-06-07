package com.nominacopro.domain.calculator

import com.nominacopro.domain.model.WorkDayEntry
import org.junit.Assert.assertEquals
import org.junit.Test
import java.time.LocalTime

class HourCalculatorTest {

    @Test
    fun weekday_shiftWithOneExtraHour_countsExtraDiurna() {
        val breakdown = HourCalculator.calculate(
            WorkDayEntry(
                date = java.time.LocalDate.of(2026, 6, 2),
                start = LocalTime.of(8, 0),
                end = LocalTime.of(17, 0),
            ),
            dailyHours = 8,
            isRestDay = false,
        )

        assertEquals(8.0, breakdown.normalDiurna, 0.01)
        assertEquals(1.0, breakdown.extraDiurna, 0.01)
        assertEquals(0.0, breakdown.extraNocturna, 0.01)
    }

    @Test
    fun weekday_longShift_classifiesNightHourAsExtraNocturna() {
        val breakdown = HourCalculator.calculate(
            WorkDayEntry(
                date = java.time.LocalDate.of(2026, 6, 2),
                start = LocalTime.of(8, 0),
                end = LocalTime.of(20, 0),
            ),
            dailyHours = 8,
            isRestDay = false,
        )

        assertEquals(8.0, breakdown.normalDiurna, 0.01)
        assertEquals(0.0, breakdown.nocturnaOrdinaria, 0.01)
        assertEquals(2.0, breakdown.extraDiurna, 0.01)
        assertEquals(1.0, breakdown.extraNocturna, 0.01)
    }

    @Test
    fun weekday_nightOrdinaryWithinJornada_keepsRecargoNocturnoBucket() {
        val breakdown = HourCalculator.calculate(
            WorkDayEntry(
                date = java.time.LocalDate.of(2026, 6, 2),
                start = LocalTime.of(14, 0),
                end = LocalTime.of(22, 0),
            ),
            dailyHours = 8,
            isRestDay = false,
        )

        assertEquals(5.0, breakdown.normalDiurna, 0.01)
        assertEquals(3.0, breakdown.nocturnaOrdinaria, 0.01)
        assertEquals(0.0, breakdown.extraDiurna, 0.01)
        assertEquals(0.0, breakdown.extraNocturna, 0.01)
    }
}
