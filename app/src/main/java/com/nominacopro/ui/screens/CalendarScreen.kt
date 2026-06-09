package com.nominacopro.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.PaddingValues
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
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.Dp
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
    val workedCount = countWorkedDays(yearMonth, marks)
    val nonWorkedWeekdays = countNonWorkedWeekdays(yearMonth, marks)
    val monthLabel = Formatters.monthNameFull(yearMonth.monthValue).replaceFirstChar { it.titlecase() }

    LazyColumn(
        modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        contentPadding = PaddingValues(bottom = 24.dp),
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
                    BoxWithConstraints(Modifier.fillMaxWidth()) {
                        val gap = 4.dp
                        val rowGap = 8.dp
                        val cellSize = ((maxWidth - gap * 6) / 7).coerceIn(30.dp, 44.dp)
                        val dayRows = ceil(days.size / 7.0).toInt().coerceAtLeast(1)
                        val gridHeight = cellSize * dayRows + rowGap * (dayRows - 1).coerceAtLeast(0)

                        Row(
                            Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(gap),
                        ) {
                            listOf("LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM").forEach { label ->
                                Box(
                                    modifier = Modifier.weight(1f),
                                    contentAlignment = Alignment.Center,
                                ) {
                                    Text(
                                        label,
                                        color = NominaDesign.TextSecondary,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.SemiBold,
                                    )
                                }
                            }
                        }
                        LazyVerticalGrid(
                            columns = GridCells.Fixed(7),
                            modifier = Modifier
                                .padding(top = 8.dp)
                                .height(gridHeight),
                            verticalArrangement = Arrangement.spacedBy(rowGap),
                            horizontalArrangement = Arrangement.spacedBy(gap),
                            userScrollEnabled = false,
                        ) {
                            items(days) { cell ->
                                if (cell == null) {
                                    Box(Modifier.size(cellSize))
                                } else {
                                    MockupDayCell(cell, marks[cell], cellSize, onDayClick)
                                }
                            }
                        }
                    }
                    Column(
                        Modifier.padding(top = 12.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                            LegendItem(NominaDesign.Green, "Día trabajado")
                            LegendItem(NominaDesign.TextSecondary, "Día no trabajado")
                        }
                        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                            LegendItem(NominaDesign.HolidayRed, "Festivo Colombia")
                            LegendItem(NominaDesign.HolidayOrange, "Festivo manual")
                        }
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
                            SummaryStat(
                                nonWorkedWeekdays.toString(),
                                "días no laborados",
                                MaterialTheme.colorScheme.onSurface,
                            )
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
private fun MockupDayCell(
    date: LocalDate,
    mark: CalendarMark?,
    cellSize: Dp,
    onClick: (LocalDate) -> Unit,
) {
    val isToday = date == LocalDate.now()
    val worked = mark?.worked == true
    val isOfficialHoliday = mark?.officialHoliday == true
    val isManualHoliday = mark?.manualHoliday == true
    val holidayColor = when {
        isOfficialHoliday -> NominaDesign.HolidayRed
        isManualHoliday -> NominaDesign.HolidayOrange
        else -> null
    }
    val innerSize = (cellSize * 0.82f).coerceIn(28.dp, 40.dp)

    Box(
        modifier = Modifier
            .size(cellSize)
            .clickable { onClick(date) },
        contentAlignment = Alignment.Center,
    ) {
        if (worked) {
            Box(
                modifier = Modifier
                    .size(innerSize)
                    .clip(CircleShape)
                    .background(NominaDesign.Green),
                contentAlignment = Alignment.Center,
            ) {
                DayNumber(
                    day = date.dayOfMonth,
                    color = Color(0xFF052E16),
                    fontWeight = FontWeight.Bold,
                    underlineColor = holidayColor,
                )
            }
        } else {
            Box(
                modifier = Modifier
                    .size(innerSize)
                    .clip(CircleShape)
                    .then(
                        when {
                            holidayColor != null -> Modifier
                                .background(holidayColor.copy(alpha = 0.16f))
                                .border(1.5.dp, holidayColor, CircleShape)
                            isToday -> Modifier.border(2.dp, NominaDesign.Green, CircleShape)
                            else -> Modifier
                        },
                    ),
                contentAlignment = Alignment.Center,
            ) {
                DayNumber(
                    day = date.dayOfMonth,
                    color = when {
                        holidayColor != null -> holidayColor
                        isToday -> NominaDesign.Green
                        else -> NominaDesign.TextSecondary
                    },
                    fontWeight = if (isToday || holidayColor != null) FontWeight.Bold else FontWeight.Medium,
                    underlineColor = holidayColor,
                )
            }
        }
    }
}

@Composable
private fun DayNumber(
    day: Int,
    color: Color,
    fontWeight: FontWeight,
    underlineColor: Color?,
) {
    Text(
        "$day",
        color = color,
        fontWeight = fontWeight,
        fontSize = 14.sp,
        textDecoration = if (underlineColor != null) TextDecoration.Underline else TextDecoration.None,
    )
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
        Text(label, color = NominaDesign.TextSecondary, fontSize = 12.sp)
    }
}

@Composable
private fun SummaryStat(value: String, label: String, valueColor: Color) {
    Column {
        Text(value, color = valueColor, fontWeight = FontWeight.Bold, fontSize = 24.sp)
        Text(label, color = NominaDesign.TextMuted, fontSize = 12.sp)
    }
}

private fun countWorkedDays(ym: YearMonth, marks: Map<LocalDate, CalendarMark>): Int {
    var count = 0
    var d = ym.atDay(1)
    val end = ym.atEndOfMonth()
    while (!d.isAfter(end)) {
        if (marks[d]?.worked == true) count++
        d = d.plusDays(1)
    }
    return count
}

private fun countNonWorkedWeekdays(ym: YearMonth, marks: Map<LocalDate, CalendarMark>): Int {
    var count = 0
    var d = ym.atDay(1)
    val end = ym.atEndOfMonth()
    while (!d.isAfter(end)) {
        if (d.dayOfWeek != DayOfWeek.SATURDAY && d.dayOfWeek != DayOfWeek.SUNDAY) {
            if (marks[d]?.worked != true) count++
        }
        d = d.plusDays(1)
    }
    return count
}

private fun buildCalendarDays(ym: YearMonth): List<LocalDate?> {
    val first = ym.atDay(1)
    val offset = (first.dayOfWeek.value + 6) % 7
    val result = mutableListOf<LocalDate?>()
    repeat(offset) { result.add(null) }
    for (day in 1..ym.lengthOfMonth()) result.add(ym.atDay(day))
    return result
}
