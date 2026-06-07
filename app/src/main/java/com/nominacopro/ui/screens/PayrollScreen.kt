package com.nominacopro.ui.screens

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.domain.model.ManualDeduction
import com.nominacopro.domain.model.MonthlyPayroll
import com.nominacopro.domain.model.PayrollEntryType
import com.nominacopro.domain.model.PayrollLine
import com.nominacopro.domain.model.PeriodPayrollSummary
import com.nominacopro.domain.model.WorkDayEntry
import com.nominacopro.domain.payperiod.PayPeriod
import com.nominacopro.ui.Formatters

@Composable
fun PayrollScreen(
    payroll: MonthlyPayroll?,
    periodSummary: PeriodPayrollSummary?,
    payPeriods: List<PayPeriod>,
    selectedPeriodIndex: Int,
    onSelectPeriod: (Int) -> Unit,
    periodManualEntries: List<ManualDeduction>,
    workDays: List<WorkDayEntry>,
    periodWorkDays: List<WorkDayEntry>,
    manualDeductions: List<ManualDeduction>,
    use24Hour: Boolean,
    profileMissing: Boolean,
    onAddDeduction: () -> Unit,
    onAddAdvance: () -> Unit,
    onRemoveManualEntry: (Long) -> Unit,
    onExportPayrollPdf: () -> Unit,
    onExportWorkDaysPdf: () -> Unit,
    modifier: Modifier = Modifier,
) {
    if (profileMissing) {
        EmptyMessage("Configura tu perfil para ver la liquidación.", modifier)
        return
    }
    if (payroll == null) {
        EmptyMessage("Sin datos de nómina para este mes.", modifier)
        return
    }

    val advances = periodManualEntries.filter { it.entryType == PayrollEntryType.ADVANCE }
    val deductions = periodManualEntries.filter { it.entryType == PayrollEntryType.DEDUCTION }

    LazyColumn(modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Text(
                "Liquidación ${Formatters.monthNameFull(payroll.month)} ${payroll.year}",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
            )
        }

        if (payPeriods.isNotEmpty()) {
            item {
                Text("Período de cobro", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                Row(
                    Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    payPeriods.forEach { period ->
                        FilterChip(
                            selected = period.indexInMonth == selectedPeriodIndex,
                            onClick = { onSelectPeriod(period.indexInMonth) },
                            label = { Text(period.label) },
                        )
                    }
                }
            }
        }

        periodSummary?.let { summary ->
            item {
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f),
                    ),
                ) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text("Resumen del período", fontWeight = FontWeight.SemiBold)
                        Text(
                            "${summary.periodStart.dayOfMonth}/${summary.periodStart.monthValue} – ${summary.periodEnd.dayOfMonth}/${summary.periodEnd.monthValue}",
                            color = MaterialTheme.colorScheme.primary,
                        )
                        Row(
                            Modifier.fillMaxWidth().padding(vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                        ) {
                            Text("Días trabajados")
                            Text("${summary.workedDays}", color = MaterialTheme.colorScheme.primary)
                        }
                        RowAmount("Valor día", summary.dailyRate, false)
                        RowAmount("Devengado bruto", summary.grossTotal, false)
                        RowAmount("Descuentos legales", summary.legalDeductions, true)
                        if (summary.manualDeductions > 0) {
                            RowAmount("Egresos / préstamos", summary.manualDeductions, true)
                        }
                        RowAmount("Neto del período", summary.netTotal, false, bold = true)
                        HorizontalDivider(Modifier.padding(vertical = 4.dp))
                        RowAmount("Avances recibidos", summary.advances, true)
                        RowAmount("Saldo pendiente por cobrar", summary.pendingBalance, false, bold = true)
                    }
                }
            }
        }

        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilledTonalButton(onClick = onExportPayrollPdf, modifier = Modifier.weight(1f)) {
                    Icon(Icons.Default.PictureAsPdf, null, modifier = Modifier.padding(end = 4.dp))
                    Text("PDF nómina")
                }
                OutlinedButton(onClick = onExportWorkDaysPdf, modifier = Modifier.weight(1f)) {
                    Text("PDF días")
                }
            }
        }

        item {
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
                Column(Modifier.padding(16.dp)) {
                    Text("Mes completo", fontWeight = FontWeight.SemiBold)
                    Text(
                        "${payroll.workedDays} días · Valor día ${Formatters.money(payroll.dailyRate)}",
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                        modifier = Modifier.padding(bottom = 8.dp),
                    )
                    payroll.earnings.forEach { line -> PayrollRow(line, false) }
                    HorizontalDivider(Modifier.padding(vertical = 8.dp))
                    payroll.legalDeductions.forEach { line -> PayrollRow(line, true) }

                    Row(
                        Modifier.fillMaxWidth().padding(top = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text("Avances del período", fontWeight = FontWeight.SemiBold)
                        IconButton(onClick = onAddAdvance) {
                            Icon(Icons.Default.Add, contentDescription = "Agregar avance")
                        }
                    }
                    if (advances.isEmpty()) {
                        Text(
                            "Sin avances registrados en este período.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                        )
                    } else {
                        advances.forEach { entry ->
                            ManualEntryRow(entry, onRemoveManualEntry)
                        }
                    }

                    Row(
                        Modifier.fillMaxWidth().padding(top = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text("Egresos del mes", fontWeight = FontWeight.SemiBold)
                        IconButton(onClick = onAddDeduction) {
                            Icon(Icons.Default.Add, contentDescription = "Agregar egreso")
                        }
                    }
                    if (manualDeductions.filter { it.entryType == PayrollEntryType.DEDUCTION }.isEmpty()) {
                        Text(
                            "Sin egresos manuales este mes.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                        )
                    } else {
                        manualDeductions.filter { it.entryType == PayrollEntryType.DEDUCTION }.forEach { d ->
                            ManualEntryRow(d, onRemoveManualEntry)
                        }
                    }

                    HorizontalDivider(Modifier.padding(vertical = 8.dp))
                    RowAmount("NETO MES", payroll.netTotal, false, bold = true)
                }
            }
        }

        item {
            Text("Días del período", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        }

        val daysToShow = if (periodWorkDays.isNotEmpty()) periodWorkDays else workDays
        if (daysToShow.isEmpty()) {
            item {
                Text(
                    "No hay jornadas en este período.",
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                )
            }
        } else {
            items(daysToShow.sortedBy { it.date }) { entry ->
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(12.dp)) {
                        Text(
                            "${entry.date.dayOfMonth}/${entry.date.monthValue}/${entry.date.year}",
                            fontWeight = FontWeight.SemiBold,
                        )
                        Text(
                            "${Formatters.formatTime(entry.start, use24Hour)} – ${Formatters.formatTime(entry.end, use24Hour)}",
                            color = MaterialTheme.colorScheme.primary,
                        )
                    }
                }
            }
        }

        item {
            Text(
                "Base legal: Ley 2466/2025 · SMMLV ${Formatters.money(ColombiaLaborLaw2026.SMMLV)} · Uso personal",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
            )
        }
    }
}

@Composable
private fun ManualEntryRow(entry: ManualDeduction, onRemove: (Long) -> Unit) {
    Row(
        Modifier.fillMaxWidth().padding(vertical = 2.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f)) {
            Text(entry.label)
            Text(
                entry.entryType.label,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.55f),
            )
        }
        Text("- ${Formatters.money(entry.amount)}", color = MaterialTheme.colorScheme.error)
        IconButton(onClick = { onRemove(entry.id) }) {
            Icon(Icons.Default.Delete, contentDescription = "Eliminar")
        }
    }
}

@Composable
private fun PayrollRow(line: PayrollLine, deduction: Boolean, bold: Boolean = false) {
    val label = buildString {
        append(line.code ?: line.label.take(3).uppercase())
        line.hours?.let { h ->
            if (h > 0) append(" · ${Formatters.hours(h)} h")
        }
    }
    Row(
        Modifier.fillMaxWidth().padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Column(Modifier.weight(1f)) {
            Text(label, fontWeight = if (bold) FontWeight.Bold else FontWeight.SemiBold)
            if (line.code != null && line.label != line.code) {
                Text(
                    line.label,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.55f),
                )
            }
        }
        Text(
            (if (deduction) "- " else "") + Formatters.money(line.amount),
            color = if (deduction) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary,
            fontWeight = if (bold) FontWeight.Bold else FontWeight.Normal,
        )
    }
}

@Composable
private fun RowAmount(label: String, amount: Long, deduction: Boolean, bold: Boolean = false) {
    Row(
        Modifier.fillMaxWidth().padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(label, fontWeight = if (bold) FontWeight.Bold else FontWeight.Normal)
        Text(
            (if (deduction) "- " else "") + Formatters.money(amount),
            color = if (deduction) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary,
            fontWeight = if (bold) FontWeight.Bold else FontWeight.Normal,
        )
    }
}

@Composable
private fun EmptyMessage(text: String, modifier: Modifier = Modifier) {
    Column(modifier.fillMaxSize().padding(24.dp)) {
        Text(text, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f))
    }
}
