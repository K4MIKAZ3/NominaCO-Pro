package com.nominacopro.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
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
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.TrendingDown
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nominacopro.domain.model.ExpenseCategory
import com.nominacopro.domain.model.ExpenseEntry
import com.nominacopro.domain.model.MonthlyPayroll
import com.nominacopro.ui.Formatters
import com.nominacopro.ui.components.NominaHeroCard
import com.nominacopro.ui.components.NominaStatCard
import com.nominacopro.ui.components.NominaTopBar
import com.nominacopro.ui.theme.NominaDesign
import java.time.YearMonth

@Composable
fun ExpensesScreen(
    yearMonth: YearMonth,
    expenses: List<ExpenseEntry>,
    payroll: MonthlyPayroll?,
    profileMissing: Boolean,
    onPrev: () -> Unit,
    onNext: () -> Unit,
    onToday: () -> Unit,
    onAdd: () -> Unit,
    onRemove: (Long) -> Unit,
    modifier: Modifier = Modifier,
) {
    val monthLabel = Formatters.monthNameFull(yearMonth.monthValue).replaceFirstChar { it.titlecase() }
    val totalExpenses = expenses.sumOf { it.amount }
    val netPayroll = payroll?.netTotal ?: 0L
    val balance = netPayroll - totalExpenses
    val categoryTotals = ExpenseCategory.entries.mapNotNull { category ->
        val total = expenses.filter { it.category == category }.sumOf { it.amount }
        if (total > 0) category to total else null
    }.sortedByDescending { it.second }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        floatingActionButton = {
            FloatingActionButton(
                onClick = onAdd,
                containerColor = NominaDesign.Green,
                contentColor = Color(0xFF052E16),
            ) {
                Icon(Icons.Default.Add, contentDescription = "Agregar gasto")
            }
        },
    ) { padding ->
        LazyColumn(
            Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(bottom = 88.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            item { NominaTopBar(title = "Gastos", subtitle = monthLabel) }

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
                        onClick = onToday,
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
                Column(
                    Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .expenseMonthSwipe(yearMonth, onPrev, onNext),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    if (profileMissing) {
                        Surface(
                            shape = NominaDesign.CardShape,
                            color = NominaDesign.SurfaceElevated,
                        ) {
                            Text(
                                "Configura tu perfil laboral en Ajustes para comparar gastos con tu neto estimado.",
                                modifier = Modifier.padding(16.dp),
                                color = NominaDesign.TextMuted,
                                fontSize = 14.sp,
                            )
                        }
                    } else {
                        NominaHeroCard(
                            label = "Balance del mes",
                            amount = Formatters.money(balance),
                            badge = if (balance >= 0) "Neto − gastos" else "Gastos superan el neto",
                        )
                        Row(
                            Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                        ) {
                            NominaStatCard(
                                label = "Neto estimado",
                                amount = Formatters.money(netPayroll),
                                icon = Icons.Default.AccountBalanceWallet,
                                accent = NominaDesign.Green,
                                modifier = Modifier.weight(1f),
                            )
                            NominaStatCard(
                                label = "Gastos",
                                amount = Formatters.money(totalExpenses),
                                icon = Icons.Default.TrendingDown,
                                accent = Color(0xFFF87171),
                                modifier = Modifier.weight(1f),
                            )
                        }
                    }
                }
            }

            if (categoryTotals.isNotEmpty()) {
                item {
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        shape = NominaDesign.CardShape,
                        color = NominaDesign.SurfaceElevated,
                    ) {
                        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            Text("Por categoría", fontWeight = FontWeight.SemiBold)
                            categoryTotals.forEach { (category, total) ->
                                Row(
                                    Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically,
                                ) {
                                    Row(
                                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                    ) {
                                        Box(
                                            Modifier
                                                .size(8.dp)
                                                .clip(CircleShape)
                                                .background(categoryColor(category)),
                                        )
                                        Text(category.label, color = NominaDesign.TextSecondary, fontSize = 14.sp)
                                    }
                                    Text(
                                        Formatters.money(total),
                                        fontWeight = FontWeight.Medium,
                                        color = MaterialTheme.colorScheme.onSurface,
                                    )
                                }
                            }
                        }
                    }
                }
            }

            item {
                Text(
                    "Movimientos",
                    modifier = Modifier.padding(horizontal = 16.dp),
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 16.sp,
                )
            }

            if (expenses.isEmpty()) {
                item {
                    Text(
                        "Sin gastos registrados este mes.",
                        modifier = Modifier.padding(horizontal = 16.dp),
                        color = NominaDesign.TextMuted,
                    )
                }
            } else {
                items(expenses, key = { it.id }) { entry ->
                    ExpenseRow(entry = entry, onRemove = { onRemove(entry.id) })
                }
            }
        }
    }
}

@Composable
private fun ExpenseRow(
    entry: ExpenseEntry,
    onRemove: () -> Unit,
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = NominaDesign.CardShape,
        color = NominaDesign.SurfaceElevated,
    ) {
        Row(
            Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(entry.label, fontWeight = FontWeight.Medium)
                Text(
                    buildString {
                        append(entry.category.label)
                        if (entry.isFixed) append(" · Fijo")
                        else append(" · ${Formatters.shortDate(entry.date)}")
                    },
                    color = NominaDesign.TextMuted,
                    fontSize = 13.sp,
                )
            }
            Text(
                Formatters.money(entry.amount),
                color = Color(0xFFF87171),
                fontWeight = FontWeight.SemiBold,
            )
            IconButton(onClick = onRemove) {
                Icon(Icons.Default.Delete, contentDescription = "Eliminar", tint = NominaDesign.TextMuted)
            }
        }
    }
}

private fun categoryColor(category: ExpenseCategory): Color = when (category) {
    ExpenseCategory.HOUSING -> Color(0xFF60A5FA)
    ExpenseCategory.FOOD -> Color(0xFF4ADE80)
    ExpenseCategory.TRANSPORT -> Color(0xFF38BDF8)
    ExpenseCategory.HEALTH -> Color(0xFFF472B6)
    ExpenseCategory.LEISURE -> Color(0xFFA78BFA)
    ExpenseCategory.EDUCATION -> Color(0xFFFBBF24)
    ExpenseCategory.OTHER -> NominaDesign.TextMuted
}

private fun Modifier.expenseMonthSwipe(
    yearMonth: YearMonth,
    onPrev: () -> Unit,
    onNext: () -> Unit,
): Modifier = pointerInput(yearMonth) {
    var totalDrag = 0f
    val threshold = size.width * 0.12f
    detectHorizontalDragGestures(
        onHorizontalDrag = { _, dragAmount -> totalDrag += dragAmount },
        onDragEnd = {
            when {
                totalDrag > threshold -> onPrev()
                totalDrag < -threshold -> onNext()
            }
            totalDrag = 0f
        },
        onDragCancel = { totalDrag = 0f },
    )
}
