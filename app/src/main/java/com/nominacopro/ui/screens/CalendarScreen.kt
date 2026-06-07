package com.nominacopro.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nominacopro.data.CalendarMark
import com.nominacopro.domain.model.MonthSummary
import com.nominacopro.domain.model.MonthlyPayroll
import com.nominacopro.ui.Formatters
import com.nominacopro.ui.components.NominaTopBar
import com.nominacopro.ui.theme.NominaDesign
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.YearMonth
import kotlin.math.ceil

@Composable
fun CalendarScreen(
    dashboard: List<MonthSummary>,
    yearMonth: YearMonth,
    marks: Map<LocalDate, CalendarMark>,
    payroll: MonthlyPayroll?,
    onPrev: () -> Unit,
    onNext: () -> Unit,
    onToday: () -> Unit,
    onDayClick: (LocalDate) -> Unit,
    modifier: Modifier = Modifier,
) {
    val days = buildCalendarDays(yearMonth)
    val rows = ceil((days.size) / 7.0).toInt()
    val gridHeight = (rows * 48 + (rows - 1) * 8).dp
    val workedCount = marks.values.count { it.worked }
    val pendingCount = countPendingWeekdays(yearMonth, marks)
    val monthLabel = Formatters.monthNameFull(yearMonth.monthValue).replaceFirstChar { it.titlecase() }

    LazyColumn(
        modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            NominaTopBar(
                title = "Calendario",
                subtitle = monthLabel,
            )
        }

        item {
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = onPrev) {
                        Icon(Icons.Default.ChevronLeft, null, tint = NominaDesign.TextMuted)
                    }
                    Text(
                        "${monthLabel} ${yearMonth.year}",
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 16.sp,
                    )
                    IconButton(onClick = onNext) {
                        Icon(Icons.Default.ChevronRight, null, tint = NominaDesign.TextMuted)
                    }
                }
                Surface(
                    shape = CircleShape,
                    color = NominaDesign.GreenGlow,
                    modifier = Modifier.clickable(onClick = onToday),
                ) {
                    Row(
                        Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        Icon(Icons.Default.CalendarMonth, null, tint = NominaDesign.Green, modifier = Modifier.size(16.dp))
                        Text("Hoy", color = NominaDesign.Green, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                    }
                }
            }
        }

        item {
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                shape = NominaDesign.CardShape,
                color = NominaDesign.SurfaceElevated,
            ) {
                Column(Modifier.padding(16.dp)) {
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(7),
                        modifier = Modifier.height(gridHeight),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        userScrollEnabled = false,
                    ) {
                        items(listOf("LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM")) { label ->
                            Text(
                                label,
                                modifier = Modifier.padding(4.dp),
                                color = NominaDesign.TextMuted,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Medium,
                            )
                        }
                        items(days) { cell ->
                            if (cell == null) {
                                Box(Modifier.aspectRatio(1f))
                            } else {
                                MockupDayCell(cell, marks[cell], onDayClick)
                            }
                        }
                    }
                    Row(
                        Modifier.padding(top = 14.dp),
                        horizontalArrangement = Arrangement.spacedBy(16.dp),
                    ) {
                        LegendItem(NominaDesign.Green, "Día trabajado")
                        LegendItem(NominaDesign.TextMuted, "Día no trabajado")
                    }
                }
            }
        }

        item {
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                shape = NominaDesign.CardShape,
                color = NominaDesign.SurfaceElevated,
            ) {
                Row(
                    Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(14.dp),
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(NominaDesign.CardShape)
                            .background(NominaDesign.Green.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(Icons.Default.CalendarMonth, null, tint = NominaDesign.Green)
                    }
                    Column(Modifier.weight(1f)) {
                        Text("Resumen de ${monthLabel.lowercase()}", color = NominaDesign.TextMuted, fontSize = 13.sp)
                        Row(
                            Modifier.padding(top = 6.dp),
                            verticalAlignment = Alignment.Bottom,
                            horizontalArrangement = Arrangement.spacedBy(16.dp),
                        ) {
                            SummaryStat(workedCount.toString(), "días trabajados", NominaDesign.Green)
                            Box(
                                Modifier
                                    .size(width = 1.dp, height = 28.dp)
                                    .background(NominaDesign.TextMuted.copy(alpha = 0.25f)),
                            )
                            SummaryStat(pendingCount.toString(), "días pendientes", MaterialTheme.colorScheme.onSurface)
                        }
                    }
                }
            }
        }

        payroll?.let { p ->
            item {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    shape = NominaDesign.CardShape,
                    color = NominaDesign.SurfaceElevated,
                ) {
                    Row(
                        Modifier.fillMaxWidth().padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Column {
                            Text("Neto estimado del mes", color = NominaDesign.TextMuted, fontSize = 13.sp)
                            Text(
                                Formatters.money(p.netTotal),
                                color = NominaDesign.Green,
                                fontWeight = FontWeight.Bold,
                                fontSize = 22.sp,
                            )
                        }
                        Text("${p.workedDays} días", color = NominaDesign.Cyan, fontWeight = FontWeight.Medium)
                    }
                }
            }
        }

        if (dashboard.isNotEmpty()) {
            item { Box(Modifier.height(8.dp)) }
        }
    }
}

@Composable
private fun MockupDayCell(date: LocalDate, mark: CalendarMark?, onClick: (LocalDate) -> Unit) {
    val isToday = date == LocalDate.now()
    val worked = mark?.worked == true

    Column(
        modifier = Modifier
            .aspectRatio(1f)
            .clickable { onClick(date) },
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Box(contentAlignment = Alignment.Center) {
            if (worked) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(NominaDesign.Green),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        "${date.dayOfMonth}",
                        color = Color(0xFF052E16),
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                    )
                }
            } else {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .then(
                            if (isToday) {
                                Modifier.border(2.dp, NominaDesign.Green, CircleShape)
                            } else {
                                Modifier
                            },
                        ),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        "${date.dayOfMonth}",
                        color = if (isToday) NominaDesign.Green else NominaDesign.TextMuted,
                        fontWeight = if (isToday) FontWeight.Bold else FontWeight.Normal,
                        fontSize = 14.sp,
                    )
                }
            }
        }
        if (worked) {
            Box(
                modifier = Modifier
                    .padding(top = 4.dp)
                    .size(5.dp)
                    .clip(CircleShape)
                    .background(NominaDesign.Green),
            )
        }
    }
}

@Composable
private fun LegendItem(color: Color, label: String) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        Box(
            Modifier
                .size(8.dp)
                .clip(CircleShape)
                .background(color),
        )
        Text(label, color = NominaDesign.TextMuted, fontSize = 12.sp)
    }
}

@Composable
private fun SummaryStat(value: String, label: String, valueColor: Color) {
    Column {
        Text(value, color = valueColor, fontWeight = FontWeight.Bold, fontSize = 24.sp)
        Text(label, color = NominaDesign.TextMuted, fontSize = 12.sp)
    }
}

private fun countPendingWeekdays(ym: YearMonth, marks: Map<LocalDate, CalendarMark>): Int {
    val today = LocalDate.now()
    val end = if (ym == YearMonth.from(today)) today else ym.atEndOfMonth()
    if (ym.isBefore(YearMonth.from(today))) return 0
    var pending = 0
    var d = ym.atDay(1)
    while (!d.isAfter(end)) {
        if (d.dayOfWeek != DayOfWeek.SATURDAY && d.dayOfWeek != DayOfWeek.SUNDAY) {
            if (marks[d]?.worked != true) pending++
        }
        d = d.plusDays(1)
    }
    return pending
}

private fun buildCalendarDays(ym: YearMonth): List<LocalDate?> {
    val first = ym.atDay(1)
    val offset = (first.dayOfWeek.value + 6) % 7
    val result = mutableListOf<LocalDate?>()
    repeat(offset) { result.add(null) }
    for (day in 1..ym.lengthOfMonth()) result.add(ym.atDay(day))
    return result
}
