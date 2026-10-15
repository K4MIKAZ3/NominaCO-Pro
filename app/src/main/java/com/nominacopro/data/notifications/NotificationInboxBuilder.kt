package com.nominacopro.data.notifications

import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.domain.model.InboxNotification
import com.nominacopro.domain.model.InboxNotificationAction
import com.nominacopro.domain.model.InboxNotificationKind
import java.time.LocalDate
import java.time.ZoneId

object NotificationInboxBuilder {

    fun build(
        today: LocalDate,
        hasWorkDayToday: Boolean,
        manualHolidays: Set<LocalDate>,
        reminderEnabled: Boolean,
        versionCode: Int,
        versionName: String,
        readIds: Set<String>,
        zoneId: ZoneId = ZoneId.systemDefault(),
    ): List<InboxNotification> {
        val items = mutableListOf<InboxNotification>()
        val todayStartMs = today.atStartOfDay(zoneId).toInstant().toEpochMilli()

        items += InboxNotification(
            id = "whats_new_$versionCode",
            kind = InboxNotificationKind.UPDATE,
            title = "Novedades de Nominapp $versionName",
            body = "Modo online desde Ajustes cuando uses la app sin cuenta, y centro de notificaciones para avisos de jornada y mensajes de la app.",
            createdAtEpochMs = todayStartMs,
            read = "whats_new_$versionCode" in readIds,
            action = InboxNotificationAction.NONE,
        )

        if (ColombiaLaborLaw2026.isOrdinaryWorkday(today, manualHolidays) && !hasWorkDayToday) {
            val id = "jornada_missing_$today"
            items += InboxNotification(
                id = id,
                kind = InboxNotificationKind.JORNADA,
                title = "Jornada sin registrar",
                body = "Hoy es día hábil y aún no marcaste tu entrada y salida. Toca para registrarlas.",
                createdAtEpochMs = todayStartMs + 1,
                read = id in readIds,
                action = InboxNotificationAction.OPEN_TODAY,
            )
        }

        if (!reminderEnabled) {
            val id = "tip_reminder"
            items += InboxNotification(
                id = id,
                kind = InboxNotificationKind.TIP,
                title = "Activa el recordatorio diario",
                body = "En Ajustes puedes programar un aviso local para no olvidar registrar tu jornada.",
                createdAtEpochMs = todayStartMs + 2,
                read = id in readIds,
                action = InboxNotificationAction.OPEN_SETTINGS,
            )
        }

        return items.sortedWith(
            compareBy<InboxNotification> { it.read }
                .thenByDescending { it.createdAtEpochMs },
        )
    }
}
