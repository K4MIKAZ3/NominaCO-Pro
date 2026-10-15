package com.nominacopro.domain.model

enum class InboxNotificationKind {
    JORNADA,
    UPDATE,
    TIP,
}

enum class InboxNotificationAction {
    NONE,
    OPEN_TODAY,
    OPEN_SETTINGS,
}

data class InboxNotification(
    val id: String,
    val kind: InboxNotificationKind,
    val title: String,
    val body: String,
    val createdAtEpochMs: Long,
    val read: Boolean,
    val action: InboxNotificationAction = InboxNotificationAction.NONE,
)
