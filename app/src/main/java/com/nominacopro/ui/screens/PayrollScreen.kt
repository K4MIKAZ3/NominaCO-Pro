package com.nominacopro.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.domain.model.ManualDeduction
import com.nominacopro.domain.model.MonthlyPayroll
import com.nominacopro.domain.model.WorkDayEntry
import com.nominacopro.ui.Formatters

@Composable
fun PayrollScreen(
    payroll: MonthlyPayroll?,
    workDays: List<WorkDayEntry>,
    manualDeductions: List<ManualDeduction>,
    use24Hour: Boolean,
    profileMissing: Boolean,
    onAddDeduction: () -> Unit,
    onRemoveDeduction: (Long) -> Unit,
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

    LazyColumn(modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Text(
                "Liquidación ${Formatters.monthNameFull(payroll.month)} ${payroll.year}",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
            )
            Text(
                "${payroll.workedDays} días trabajados · ${payroll.restDays} descansos remunerados",
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
            )
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
                    Text("Devengado", fontWeight = FontWeight.SemiBold)
                    payroll.earnings.forEach { line ->
                        RowAmount(line.label, line.amount, false)
                    }
                    HorizontalDivider(Modifier.padding(vertical = 8.dp))
                    Text("Descuentos legales", fontWeight = FontWeight.SemiBold)
                    payroll.legalDeductions.forEach { line ->
                        RowAmount(line.label, line.amount, true)
                    }

                    Row(
                        Modifier.fillMaxWidth().padding(top = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
                    ) {
                        Text("Egresos / préstamos", fontWeight = FontWeight.SemiBold)
                        IconButton(onClick = onAddDeduction) {
                            Icon(Icons.Default.Add, contentDescription = "Agregar egreso")
                        }
                    }
                    if (manualDeductions.isEmpty()) {
                        Text(
                            "Sin egresos manuales este mes.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                        )
                    } else {
                        manualDeductions.forEach { d ->
                            Row(
                                Modifier.fillMaxWidth().padding(vertical = 2.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
                            ) {
                                Text(d.label, modifier = Modifier.weight(1f))
                                Text("- ${Formatters.money(d.amount)}", color = MaterialTheme.colorScheme.error)
                                IconButton(onClick = { onRemoveDeduction(d.id) }) {
                                    Icon(Icons.Default.Delete, contentDescription = "Eliminar")
                                }
                            }
                        }
                    }

                    HorizontalDivider(Modifier.padding(vertical = 8.dp))
                    RowAmount("NETO A RECIBIR", payroll.netTotal, false, bold = true)
                }
            }
        }

        item {
            Text("Días laborados", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        }

        if (workDays.isEmpty()) {
            item {
                Text(
                    "No hay jornadas registradas este mes.",
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                )
            }
        } else {
            items(workDays.sortedBy { it.date }) { entry ->
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
                        Text(
                            entry.dayType.name.replace('_', ' '),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                        )
                        if (entry.notes.isNotBlank()) {
                            Text(entry.notes, style = MaterialTheme.typography.bodySmall)
                        }
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
