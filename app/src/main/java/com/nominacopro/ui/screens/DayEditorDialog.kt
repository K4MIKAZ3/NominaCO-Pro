package com.nominacopro.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.domain.model.DayType
import com.nominacopro.domain.model.WorkDayEntry
import java.time.LocalDate
import java.time.LocalTime

@Composable
fun DayEditorDialog(
    date: LocalDate,
    existingEntry: WorkDayEntry?,
    isManualHoliday: Boolean,
    isOfficialHoliday: Boolean,
    onDismiss: () -> Unit,
    onSave: (LocalTime, LocalTime, DayType, String, Boolean) -> Unit,
    onDelete: () -> Unit,
) {
    var startH by remember(date, existingEntry) {
        mutableStateOf(existingEntry?.start?.hour?.toString()?.padStart(2, '0') ?: "08")
    }
    var startM by remember(date, existingEntry) {
        mutableStateOf(existingEntry?.start?.minute?.toString()?.padStart(2, '0') ?: "00")
    }
    var endH by remember(date, existingEntry) {
        mutableStateOf(existingEntry?.end?.hour?.toString()?.padStart(2, '0') ?: "16")
    }
    var endM by remember(date, existingEntry) {
        mutableStateOf(existingEntry?.end?.minute?.toString()?.padStart(2, '0') ?: "30")
    }
    var notes by remember(date, existingEntry) { mutableStateOf(existingEntry?.notes ?: "") }
    var manual by remember(date, isManualHoliday) { mutableStateOf(isManualHoliday) }

    val isSunday = ColombiaLaborLaw2026.isSunday(date)
    val isRestDay = isOfficialHoliday || isSunday || manual

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Día ${date.dayOfMonth}/${date.monthValue}/${date.year}") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                when {
                    isOfficialHoliday -> Text("Festivo oficial Colombia 2026")
                    isSunday -> Text("Domingo — recargo dominical si trabajas")
                    manual -> Text("Festivo manual — descanso remunerado")
                }
                if (!isOfficialHoliday) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(checked = manual, onCheckedChange = { manual = it })
                        Text("Marcar como festivo manual")
                    }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = startH,
                        onValueChange = { startH = it.filter(Char::isDigit).take(2) },
                        label = { Text("Entrada h") },
                        modifier = Modifier.weight(1f),
                    )
                    OutlinedTextField(
                        value = startM,
                        onValueChange = { startM = it.filter(Char::isDigit).take(2) },
                        label = { Text("m") },
                        modifier = Modifier.weight(1f),
                    )
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = endH,
                        onValueChange = { endH = it.filter(Char::isDigit).take(2) },
                        label = { Text("Salida h") },
                        modifier = Modifier.weight(1f),
                    )
                    OutlinedTextField(
                        value = endM,
                        onValueChange = { endM = it.filter(Char::isDigit).take(2) },
                        label = { Text("m") },
                        modifier = Modifier.weight(1f),
                    )
                }
                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Notas") },
                    modifier = Modifier.fillMaxWidth(),
                )
                Text(
                    "Se descuenta 1 h de almuerzo (12:00–13:00) si aplica.",
                    style = MaterialTheme.typography.bodySmall,
                )
                if (isRestDay) {
                    Text(
                        "Recargos dominical/festivo según Ley 2466/2025.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary,
                    )
                }
            }
        },
        confirmButton = {
            Button(onClick = {
                val start = LocalTime.of(
                    startH.toIntOrNull()?.coerceIn(0, 23) ?: 8,
                    startM.toIntOrNull()?.coerceIn(0, 59) ?: 0,
                )
                val end = LocalTime.of(
                    endH.toIntOrNull()?.coerceIn(0, 23) ?: 16,
                    endM.toIntOrNull()?.coerceIn(0, 59) ?: 30,
                )
                val manualSet = if (manual) setOf(date) else emptySet()
                val type = if (ColombiaLaborLaw2026.isRestDay(date, manualSet)) {
                    DayType.FESTIVO_DOMINICAL
                } else {
                    DayType.NORMAL
                }
                onSave(start, end, type, notes, manual)
            }) { Text("Guardar") }
        },
        dismissButton = {
            Row {
                if (existingEntry != null) {
                    TextButton(onClick = onDelete) { Text("Borrar") }
                }
                TextButton(onClick = onDismiss) { Text("Cancelar") }
            }
        },
    )
}
