package com.nominacopro.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nominacopro.ui.navigation.NominaTab
import com.nominacopro.ui.theme.NominaDesign

@Composable
fun NominaLogoMark(size: Int = 32) {
    Box(
        modifier = Modifier
            .size(size.dp)
            .clip(NominaDesign.CardShape)
            .background(NominaDesign.Green),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            "N",
            color = Color(0xFF052E16),
            fontWeight = FontWeight.ExtraBold,
            fontSize = (size * 0.55f).sp,
        )
    }
}

@Composable
fun NominaTopBar(
    title: String,
    subtitle: String? = null,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            NominaLogoMark(size = 34)
            Column {
                Text(
                    "NominaApp",
                    fontWeight = FontWeight.Bold,
                    fontSize = 17.sp,
                    color = MaterialTheme.colorScheme.onBackground,
                )
                Text(
                    title,
                    fontSize = 13.sp,
                    color = NominaDesign.TextMuted,
                )
            }
        }
        Box {
            Icon(
                Icons.Default.Notifications,
                contentDescription = null,
                tint = NominaDesign.TextMuted,
            )
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(NominaDesign.Green),
            )
        }
    }
    subtitle?.let {
        Text(
            it,
            modifier = Modifier.padding(horizontal = 16.dp).padding(bottom = 4.dp),
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
        )
        Text(
            "Visualiza tus días trabajados",
            modifier = Modifier.padding(horizontal = 16.dp).padding(bottom = 8.dp),
            color = NominaDesign.TextMuted,
            fontSize = 14.sp,
        )
    }
}

@Composable
fun NominaBottomBar(
    selected: NominaTab,
    onSelect: (NominaTab) -> Unit,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        color = NominaDesign.Surface,
        tonalElevation = 0.dp,
        shadowElevation = 8.dp,
    ) {
        Row(
            Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(vertical = 6.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
        ) {
            NominaTab.entries.forEach { tab ->
                val active = tab == selected
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onSelect(tab) }
                        .padding(vertical = 4.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(0.5f)
                            .height(3.dp)
                            .clip(CircleShape)
                            .background(if (active) NominaDesign.Green else Color.Transparent),
                    )
                    Icon(
                        tab.icon,
                        contentDescription = tab.label,
                        tint = if (active) NominaDesign.Green else NominaDesign.TextMuted,
                        modifier = Modifier.padding(top = 6.dp),
                    )
                    Text(
                        tab.label,
                        fontSize = 11.sp,
                        color = if (active) NominaDesign.Green else NominaDesign.TextMuted,
                        modifier = Modifier.padding(top = 2.dp),
                    )
                }
            }
        }
    }
}

@Composable
fun NominaHeroCard(
    label: String,
    amount: String,
    badge: String,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = NominaDesign.CardShape,
        color = NominaDesign.SurfaceElevated,
    ) {
        Column(Modifier.padding(20.dp)) {
            Text(label, color = NominaDesign.TextMuted, fontSize = 14.sp)
            Text(
                amount,
                color = NominaDesign.Green,
                fontWeight = FontWeight.Bold,
                fontSize = 32.sp,
                modifier = Modifier.padding(vertical = 6.dp),
            )
            Row(
                modifier = Modifier
                    .clip(CircleShape)
                    .background(NominaDesign.GreenGlow)
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                Text("✓", color = NominaDesign.Green, fontWeight = FontWeight.Bold)
                Text(badge, color = NominaDesign.Green, fontSize = 13.sp)
            }
        }
    }
}

@Composable
fun NominaStatCard(
    label: String,
    amount: String,
    icon: ImageVector,
    accent: Color,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier,
        shape = NominaDesign.CardShape,
        color = NominaDesign.SurfaceElevated,
    ) {
        Column(Modifier.padding(16.dp)) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(accent.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(icon, null, tint = accent, modifier = Modifier.size(20.dp))
            }
            Text(
                label,
                color = NominaDesign.TextMuted,
                fontSize = 12.sp,
                modifier = Modifier.padding(top = 10.dp),
            )
            Text(
                amount,
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                modifier = Modifier.padding(top = 4.dp),
            )
        }
    }
}

@Composable
fun NominaAccentSection(
    title: String,
    amount: String?,
    accent: Color,
    expanded: Boolean,
    onToggle: () -> Unit,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    Surface(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, accent.copy(alpha = 0.35f), NominaDesign.CardShape),
        shape = NominaDesign.CardShape,
        color = NominaDesign.SurfaceElevated,
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(
                Modifier
                    .fillMaxWidth()
                    .clickable(onClick = onToggle),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(Modifier.weight(1f)) {
                    Text(title, fontWeight = FontWeight.SemiBold, color = accent)
                    amount?.let {
                        Text(
                            it,
                            fontWeight = FontWeight.Bold,
                            fontSize = 22.sp,
                            modifier = Modifier.padding(top = 4.dp),
                        )
                    }
                }
                Text(
                    if (expanded) "▲" else "▼",
                    color = NominaDesign.TextMuted,
                )
            }
            if (expanded) {
                Column(Modifier.padding(top = 12.dp)) {
                    content()
                }
            }
        }
    }
}

@Composable
fun NominaStatusBadge(
    text: String,
    modifier: Modifier = Modifier,
) {
    Text(
        text,
        modifier = modifier
            .clip(CircleShape)
            .background(NominaDesign.GreenGlow)
            .padding(horizontal = 10.dp, vertical = 4.dp),
        color = NominaDesign.Green,
        fontSize = 12.sp,
        fontWeight = FontWeight.Medium,
    )
}
