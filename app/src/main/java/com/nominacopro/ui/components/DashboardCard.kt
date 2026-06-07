package com.nominacopro.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nominacopro.domain.model.MonthSummary
import com.nominacopro.ui.Formatters
import kotlin.math.max

@Composable
fun DashboardCard(
    summaries: List<MonthSummary>,
    modifier: Modifier = Modifier,
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column(Modifier.padding(16.dp)) {
            Text(
                "Resumen últimos 3 meses",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
            )
            Text(
                "Ingresos y descuentos de nómina",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                modifier = Modifier.padding(bottom = 12.dp),
            )

            if (summaries.isEmpty()) {
                Text(
                    "Configura tu perfil para ver el dashboard.",
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                )
            } else {
                val maxValue = summaries.maxOf { max(it.grossTotal, it.netTotal + it.legalDeductions + it.manualDeductions) }
                    .coerceAtLeast(1L)
                    .toFloat()

                Canvas(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(140.dp),
                ) {
                    val barWidth = size.width / (summaries.size * 3f + 1f)
                    val gap = barWidth * 0.4f
                    summaries.forEachIndexed { index, summary ->
                        val xBase = gap + index * (barWidth * 3f + gap)
                        val netH = (summary.netTotal / maxValue) * size.height * 0.85f
                        val legalH = (summary.legalDeductions / maxValue) * size.height * 0.85f
                        val manualH = (summary.manualDeductions / maxValue) * size.height * 0.85f

                        drawRoundRect(
                            color = Color(0xFF4ADE80),
                            topLeft = Offset(xBase, size.height - netH),
                            size = Size(barWidth, netH),
                            cornerRadius = CornerRadius(6f, 6f),
                        )
                        drawRoundRect(
                            color = Color(0xFFF87171),
                            topLeft = Offset(xBase + barWidth + 2f, size.height - legalH),
                            size = Size(barWidth, legalH),
                            cornerRadius = CornerRadius(6f, 6f),
                        )
                        drawRoundRect(
                            color = Color(0xFFF59E0B),
                            topLeft = Offset(xBase + (barWidth + 2f) * 2, size.height - manualH),
                            size = Size(barWidth, manualH),
                            cornerRadius = CornerRadius(6f, 6f),
                        )
                    }
                }

                Row(
                    Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                ) {
                    summaries.forEach { s ->
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                Formatters.monthName(s.yearMonth.monthValue),
                                style = MaterialTheme.typography.labelSmall,
                            )
                            Text(
                                Formatters.money(s.netTotal),
                                color = MaterialTheme.colorScheme.primary,
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.SemiBold,
                            )
                        }
                    }
                }

                Row(
                    Modifier.fillMaxWidth().padding(top = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    LegendDot(Color(0xFF4ADE80), "Neto")
                    LegendDot(Color(0xFFF87171), "Legal")
                    LegendDot(Color(0xFFF59E0B), "Egresos")
                }
            }
        }
    }
}

@Composable
private fun LegendDot(color: Color, label: String) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
        Canvas(Modifier.size(10.dp)) {
            drawCircle(color = color, radius = size.minDimension / 2f)
        }
        Text(label, style = MaterialTheme.typography.labelSmall)
    }
}
