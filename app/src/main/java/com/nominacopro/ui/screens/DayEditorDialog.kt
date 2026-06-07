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
import com.nominacopro.ui.Formatters
import com.nominacopro.ui.TimeInput
import com.nominacopro.ui.TimeInputRow
import java.time.LocalDate
import java.time.LocalTime

@Composable
fun DayEditorDialog(
    date: LocalDate,
    existingEntry: WorkDayEntry?,
    defaultStart: LocalTime,
    defaultEnd: LocalTime,
    use24Hour: Boolean,
    isManualHoliday: Boolean,
    isOfficialHoliday: Boolean,
    onDismiss: () -> Unit,
    onSave: (LocalTime, LocalTime, DayType, String, Boolean) -> Unit,
    onDelete: () -> Unit,
) {
    val initialStart = existingEntry?.start ?: defaultStart
    val initialEnd = existingEntry?.end ?: defaultEnd

    var startFields by remember(date, existingEntry, defaultStart, use24Hour) {
        mutableStateOf(TimeInput.fieldsFrom(initialStart, use24Hour))
    }
    var endFields by remember(date, existingEntry, defaultEnd, use24Hour) {
        mutableStateOf(TimeInput.fieldsFrom(initialEnd, use24Hour))
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
                if (existingEntry == null) {
                    Text(
                        "Horario default: ${Formatters.formatTime(defaultStart, use24Hour)} – ${Formatters.formatTime(defaultEnd, use24Hour)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary,
                    )
                }
                if (!isOfficialHoliday) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(checked = manual, onCheckedChange = { manual = it })
                        Text("Marcar como festivo manual")
                    }
                }
                TimeInputRow(
                    label = if (use24Hour) "Entrada (24 h)" else "Entrada",
                    use24Hour = use24Hour,
                    state = startFields,
                    onHourChange = { startFields = startFields.copy(hour = it) },
                    onMinuteChange = { startFields = startFields.copy(minute = it) },
                    onAmPmChange = { startFields = startFields.copy(amPm = it) },
                )
                TimeInputRow(
                    label = if (use24Hour) "Salida (24 h)" else "Salida",
                    use24Hour = use24Hour,
                    state = endFields,
                    onHourChange = { endFields = endFields.copy(hour = it) },
                    onMinuteChange = { endFields = endFields.copy(minute = it) },
                    onAmPmChange = { endFields = endFields.copy(amPm = it) },
                )
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
                if (!use24Hour) {
                    Text(
                        "En formato 12 h elige AM o PM en entrada y salida (ej. 8 AM – 5 PM).",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.65f),
                    )
                }
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
                val start = TimeInput.toLocalTime(startFields, use24Hour, defaultStart)
                val end = TimeInput.toLocalTime(endFields, use24Hour, defaultEnd)
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
