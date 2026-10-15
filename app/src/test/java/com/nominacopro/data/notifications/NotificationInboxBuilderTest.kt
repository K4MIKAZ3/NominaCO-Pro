package com.nominacopro.data.notifications

import com.nominacopro.domain.model.InboxNotificationKind
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate
import java.time.ZoneOffset

class NotificationInboxBuilderTest {

    @Test
    fun buildsJornadaAlertOnOrdinaryWorkdayWithoutEntry() {
        val monday = LocalDate.of(2026, 3, 2)
        val items = NotificationInboxBuilder.build(
            today = monday,
            hasWorkDayToday = false,
            manualHolidays = emptySet(),
            reminderEnabled = true,
            versionCode = 50,
            versionName = "1.7.39",
            readIds = emptySet(),
            zoneId = ZoneOffset.UTC,
        )

        assertTrue(items.any { it.kind == InboxNotificationKind.JORNADA })
        assertTrue(items.any { it.kind == InboxNotificationKind.UPDATE })
        assertTrue(items.none { it.kind == InboxNotificationKind.TIP })
    }

    @Test
    fun skipsJornadaOnSundayAndMarksReadIds() {
        val sunday = LocalDate.of(2026, 3, 1)
        val items = NotificationInboxBuilder.build(
            today = sunday,
            hasWorkDayToday = false,
            manualHolidays = emptySet(),
            reminderEnabled = false,
            versionCode = 50,
            versionName = "1.7.39",
            readIds = setOf("whats_new_50", "tip_reminder"),
            zoneId = ZoneOffset.UTC,
        )

        assertTrue(items.none { it.kind == InboxNotificationKind.JORNADA })
        assertEquals(2, items.size)
        assertTrue(items.all { it.read })
    }
}
