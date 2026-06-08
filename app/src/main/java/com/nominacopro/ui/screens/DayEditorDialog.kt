package com.nominacopro.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material3.Surface
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.Card
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.domain.calculator.HourCalculator
import com.nominacopro.domain.model.DayType
import com.nominacopro.domain.model.WorkDayEntry
import com.nominacopro.ui.Formatters
import com.nominacopro.ui.TimeInput
import com.nominacopro.ui.TimeInputRow
import com.nominacopro.ui.theme.NominaDesign
import java.time.LocalDate
import java.time.LocalTime

@Composable
fun DayEditorDialog(
    date: LocalDate,
    existingEntry: WorkDayEntry?,
    defaultStart: LocalTime,
    defaultEnd: LocalTime,
    dailyHours: Int,
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

    val previewStart = TimeInput.toLocalTime(startFields, use24Hour, defaultStart)
    val previewEnd = TimeInput.toLocalTime(endFields, use24Hour, defaultEnd)
    val previewBreakdown = HourCalculator.calculate(
        WorkDayEntry(date, previewStart, previewEnd),
        dailyHours = dailyHours,
        isRestDay = isRestDay,
    )
    val overnightHint = !previewEnd.isAfter(previewStart)
    val scrollState = rememberScrollState()
    val maxDialogHeight = (LocalConfiguration.current.screenHeightDp * 0.72f).dp

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false),
    ) {
        Surface(
            modifier = Modifier
                .widthIn(max = 420.dp)
                .padding(horizontal = 20.dp)
                .heightIn(max = maxDialogHeight),
            shape = MaterialTheme.shapes.large,
            color = MaterialTheme.colorScheme.surface,
        ) {
            BoxWithConstraints(Modifier.fillMaxWidth()) {
                val buttonBarHeight = 56.dp
                Column {
                    Column(
                        modifier = Modifier
                            .heightIn(max = maxHeight - buttonBarHeight)
                            .verticalScroll(scrollState)
                            .padding(horizontal = 20.dp, vertical = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                    Text(
                        "Día ${date.dayOfMonth}/${date.monthValue}/${date.year}",
                        style = MaterialTheme.typography.titleLarge,
                        color = MaterialTheme.colorScheme.onSurface,
                    )
                    when {
                        isOfficialHoliday -> Text(
                            "Festivo oficial Colombia 2026",
                            color = NominaDesign.TextSecondary,
                        )
                        isSunday -> Text(
                            "Domingo — recargo dominical si trabajas",
                            color = NominaDesign.TextSecondary,
                        )
                        manual -> Text(
                            "Festivo manual — descanso remunerado",
                            color = NominaDesign.TextSecondary,
                        )
                    }
                    if (existingEntry == null) {
                        Text(
                            "Horario default: ${Formatters.formatTime(defaultStart, use24Hour)} – ${Formatters.formatTime(defaultEnd, use24Hour)}",
                            style = MaterialTheme.typography.bodySmall,
                            color = NominaDesign.Green,
                        )
                    }
                    if (!isOfficialHoliday) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Checkbox(checked = manual, onCheckedChange = { manual = it })
                            Text("Marcar como festivo manual", color = NominaDesign.TextSecondary)
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
                    Card(Modifier.fillMaxWidth()) {
                        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("Vista previa", fontWeight = FontWeight.SemiBold)
                            Text("Horas netas: ${Formatters.hours(previewBreakdown.totalHours)} h")
                            if (previewBreakdown.extraDiurna > 0) {
                                Text("Extra diurna: ${Formatters.hours(previewBreakdown.extraDiurna)} h")
                            }
                            if (previewBreakdown.extraNocturna > 0) {
                                Text("Extra nocturna: ${Formatters.hours(previewBreakdown.extraNocturna)} h")
                            }
                            if (overnightHint && previewBreakdown.totalHours > dailyHours) {
                                Text(
                                    "Turno cruza medianoche (válido si trabajaste de noche).",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = NominaDesign.Green,
                                )
                            }
                        }
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
                        color = NominaDesign.TextSecondary,
                    )
                    if (!use24Hour) {
                        Text(
                            "En formato 12 h elige AM o PM en entrada y salida (ej. 8 AM – 5 PM).",
                            style = MaterialTheme.typography.bodySmall,
                            color = NominaDesign.TextSecondary,
                        )
                    }
                    if (isRestDay) {
                        Text(
                            "Recargos dominical/festivo según Ley 2466/2025.",
                            style = MaterialTheme.typography.bodySmall,
                            color = NominaDesign.Green,
                        )
                    }
                }
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(buttonBarHeight)
                        .padding(horizontal = 12.dp),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    if (existingEntry != null) {
                        TextButton(onClick = onDelete) { Text("Borrar") }
                    }
                    TextButton(onClick = onDismiss) { Text("Cancelar") }
                    Button(
                        modifier = Modifier.padding(start = 4.dp),
                        onClick = {
                            val start = TimeInput.toLocalTime(startFields, use24Hour, defaultStart)
                            val end = TimeInput.toLocalTime(endFields, use24Hour, defaultEnd)
                            val manualSet = if (manual) setOf(date) else emptySet()
                            val type = if (ColombiaLaborLaw2026.isRestDay(date, manualSet)) {
                                DayType.FESTIVO_DOMINICAL
                            } else {
                                DayType.NORMAL
                            }
                            onSave(start, end, type, notes, manual)
                        },
                    ) { Text("Guardar") }
                }
                }
            }
        }
    }
}
