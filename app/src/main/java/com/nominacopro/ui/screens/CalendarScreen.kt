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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.WorkHistory
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nominacopro.data.CalendarMark
import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.domain.model.MonthlyPayroll
import com.nominacopro.ui.Formatters
import java.time.LocalDate
import java.time.YearMonth

@Composable
fun CalendarScreen(
    yearMonth: YearMonth,
    marks: Map<LocalDate, CalendarMark>,
    payroll: MonthlyPayroll?,
    onPrev: () -> Unit,
    onNext: () -> Unit,
    onToday: () -> Unit,
    onDayClick: (LocalDate) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier.fillMaxSize().padding(16.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onPrev) { Icon(Icons.Default.ChevronLeft, null) }
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    Formatters.monthName(yearMonth.monthValue).replaceFirstChar { it.titlecase() },
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                )
                Text("${yearMonth.year}", color = MaterialTheme.colorScheme.primary)
            }
            IconButton(onClick = onNext) { Icon(Icons.Default.ChevronRight, null) }
        }
        Text("Hoy", modifier = Modifier.clickable { onToday() }.padding(bottom = 8.dp), color = MaterialTheme.colorScheme.secondary)

        payroll?.let {
            Card(
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp).clickable { },
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            ) {
                Row(
                    Modifier.fillMaxWidth().padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Column {
                        Text("Neto estimado", color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f))
                        Text(Formatters.money(it.netTotal), style = MaterialTheme.typography.headlineSmall, color = MaterialTheme.colorScheme.primary)
                    }
                    Text("${it.workedDays} días", color = MaterialTheme.colorScheme.secondary)
                }
            }
        }

        val days = buildCalendarDays(yearMonth)
        LazyVerticalGrid(columns = GridCells.Fixed(7), modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            items(listOf("D", "L", "M", "M", "J", "V", "S")) { label ->
                Text(label, modifier = Modifier.padding(4.dp), color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
            }
            items(days) { cell ->
                if (cell == null) {
                    Box(Modifier.aspectRatio(1f))
                } else {
                    DayCell(cell, marks[cell], onDayClick)
                }
            }
        }
    }
}

@Composable
private fun DayCell(date: LocalDate, mark: CalendarMark?, onClick: (LocalDate) -> Unit) {
    val isToday = date == LocalDate.now()
    val bg = when {
        mark?.worked == true -> Color(0x334ADE80)
        mark?.manualHoliday == true -> Color(0x33F59E0B)
        mark?.officialHoliday == true || mark?.sunday == true -> Color(0x33F87171)
        date.dayOfWeek.value == 6 -> Color(0x3322D3EE)
        else -> MaterialTheme.colorScheme.surface
    }
    Box(
        modifier = Modifier
            .aspectRatio(1f)
            .clip(RoundedCornerShape(8.dp))
            .background(bg)
            .border(
                width = if (isToday) 2.dp else 1.dp,
                color = if (isToday) MaterialTheme.colorScheme.tertiary else MaterialTheme.colorScheme.outline.copy(alpha = 0.2f),
                shape = RoundedCornerShape(8.dp),
            )
            .clickable { onClick(date) }
            .padding(4.dp),
    ) {
        Text("${date.dayOfMonth}", fontWeight = FontWeight.Bold, fontSize = MaterialTheme.typography.bodyMedium.fontSize)
        if (mark?.worked == true) {
            Icon(Icons.Default.WorkHistory, null, modifier = Modifier.align(Alignment.TopEnd).size(12.dp), tint = MaterialTheme.colorScheme.primary)
        }
        if (mark?.manualHoliday == true || (mark?.officialHoliday == true && mark.worked.not())) {
            Icon(Icons.Default.Star, null, modifier = Modifier.align(Alignment.BottomEnd).size(10.dp), tint = MaterialTheme.colorScheme.tertiary)
        }
    }
}

private fun buildCalendarDays(ym: YearMonth): List<LocalDate?> {
    val first = ym.atDay(1)
    val offset = first.dayOfWeek.value % 7
    val result = mutableListOf<LocalDate?>()
    repeat(offset) { result.add(null) }
    for (d in 1..ym.lengthOfMonth()) result.add(ym.atDay(d))
    return result
}
