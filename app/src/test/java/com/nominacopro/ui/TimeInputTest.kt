package com.nominacopro.ui

import org.junit.Assert.assertEquals
import org.junit.Test
import java.time.LocalTime

class TimeInputTest {

    @Test
    fun toLocalTime_12h_interpretsPmCorrectly() {
        val state = TimeFieldState(hour = "5", minute = "00", amPm = AmPm.PM)
        val time = TimeInput.toLocalTime(state, use24Hour = false, fallback = LocalTime.of(8, 0))
        assertEquals(LocalTime.of(17, 0), time)
    }

    @Test
    fun toLocalTime_12h_morningShift() {
        val start = TimeInput.toLocalTime(
            TimeFieldState("8", "00", AmPm.AM),
            use24Hour = false,
            fallback = LocalTime.of(8, 0),
        )
        val end = TimeInput.toLocalTime(
            TimeFieldState("5", "00", AmPm.PM),
            use24Hour = false,
            fallback = LocalTime.of(17, 0),
        )
        assertEquals(LocalTime.of(8, 0), start)
        assertEquals(LocalTime.of(17, 0), end)
    }

    @Test
    fun fieldsFrom_12h_showsPmHour() {
        val fields = TimeInput.fieldsFrom(LocalTime.of(17, 30), use24Hour = false)
        assertEquals("5", fields.hour)
        assertEquals("30", fields.minute)
        assertEquals(AmPm.PM, fields.amPm)
    }

    @Test
    fun toLocalTime_24h_unchanged() {
        val state = TimeFieldState(hour = "17", minute = "00")
        val time = TimeInput.toLocalTime(state, use24Hour = true, fallback = LocalTime.of(8, 0))
        assertEquals(LocalTime.of(17, 0), time)
    }
}
