package com.nominacopro.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Campaign
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.TipsAndUpdates
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nominacopro.domain.model.InboxNotification
import com.nominacopro.domain.model.InboxNotificationKind
import com.nominacopro.ui.theme.NominaDesign

@Composable
fun NotificationsScreen(
    notifications: List<InboxNotification>,
    onBack: () -> Unit,
    onMarkAllRead: () -> Unit,
    onOpenNotification: (InboxNotification) -> Unit,
    modifier: Modifier = Modifier,
) {
    val unread = notifications.count { !it.read }

    Column(
        modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
    ) {
        Row(
            Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Volver")
                }
                Column {
                    Text(
                        "Notificaciones",
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                    )
                    Text(
                        if (unread == 0) "Todo al día" else "$unread sin leer",
                        style = MaterialTheme.typography.bodySmall,
                        color = NominaDesign.TextMuted,
                    )
                }
            }
            if (unread > 0) {
                TextButton(onClick = onMarkAllRead) {
                    Text("Marcar leídas")
                }
            }
        }

        if (notifications.isEmpty()) {
            Box(
                Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    "No hay avisos por ahora.",
                    color = NominaDesign.TextMuted,
                )
            }
        } else {
            LazyColumn(
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                items(notifications, key = { it.id }) { item ->
                    NotificationRow(
                        item = item,
                        onClick = { onOpenNotification(item) },
                    )
                }
            }
        }
    }
}

@Composable
private fun NotificationRow(
    item: InboxNotification,
    onClick: () -> Unit,
) {
    Row(
        Modifier
            .fillMaxWidth()
            .clip(NominaDesign.CardShape)
            .background(NominaDesign.Surface)
            .clickable(onClick = onClick)
            .padding(14.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.Top,
    ) {
        Box(
            Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(NominaDesign.SurfaceElevated),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = iconFor(item.kind),
                contentDescription = null,
                tint = NominaDesign.Green,
            )
        }
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    item.title,
                    fontWeight = if (item.read) FontWeight.Medium else FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.weight(1f),
                )
                if (!item.read) {
                    Box(
                        Modifier
                            .padding(start = 8.dp)
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(NominaDesign.Green),
                    )
                }
            }
            Text(
                item.body,
                style = MaterialTheme.typography.bodySmall,
                color = NominaDesign.TextMuted,
            )
        }
    }
}

private fun iconFor(kind: InboxNotificationKind): ImageVector = when (kind) {
    InboxNotificationKind.JORNADA -> Icons.Default.Schedule
    InboxNotificationKind.UPDATE -> Icons.Default.Campaign
    InboxNotificationKind.TIP -> Icons.Default.TipsAndUpdates
}
