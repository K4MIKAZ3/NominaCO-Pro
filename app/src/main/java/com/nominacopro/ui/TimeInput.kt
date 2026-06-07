package com.nominacopro.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.FilterChip
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import java.time.LocalTime

enum class AmPm { AM, PM }

data class TimeFieldState(
    val hour: String,
    val minute: String,
    val amPm: AmPm = AmPm.AM,
)

object TimeInput {
    fun fieldsFrom(time: LocalTime, use24Hour: Boolean): TimeFieldState =
        if (use24Hour) {
            TimeFieldState(
                hour = time.hour.toString().padStart(2, '0'),
                minute = time.minute.toString().padStart(2, '0'),
            )
        } else {
            val displayHour = when (val h = time.hour % 12) {
                0 -> 12
                else -> h
            }
            TimeFieldState(
                hour = displayHour.toString(),
                minute = time.minute.toString().padStart(2, '0'),
                amPm = if (time.hour < 12) AmPm.AM else AmPm.PM,
            )
        }

    fun toLocalTime(state: TimeFieldState, use24Hour: Boolean, fallback: LocalTime): LocalTime {
        val minute = state.minute.toIntOrNull()?.coerceIn(0, 59) ?: fallback.minute
        if (use24Hour) {
            val hour = state.hour.toIntOrNull()?.coerceIn(0, 23) ?: fallback.hour
            return LocalTime.of(hour, minute)
        }
        val hour12 = state.hour.toIntOrNull()?.coerceIn(1, 12) ?: run {
            val fb = fieldsFrom(fallback, use24Hour = false)
            fb.hour.toIntOrNull() ?: 12
        }
        val hour24 = when (state.amPm) {
            AmPm.AM -> if (hour12 == 12) 0 else hour12
            AmPm.PM -> if (hour12 == 12) 12 else hour12 + 12
        }
        return LocalTime.of(hour24, minute)
    }
}

@Composable
fun TimeInputRow(
    label: String,
    use24Hour: Boolean,
    state: TimeFieldState,
    onHourChange: (String) -> Unit,
    onMinuteChange: (String) -> Unit,
    onAmPmChange: (AmPm) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(label)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
            OutlinedTextField(
                value = state.hour,
                onValueChange = { onHourChange(it.filter(Char::isDigit).take(if (use24Hour) 2 else 2)) },
                label = { Text(if (use24Hour) "Hora (0–23)" else "Hora (1–12)") },
                modifier = Modifier.weight(1f),
            )
            OutlinedTextField(
                value = state.minute,
                onValueChange = { onMinuteChange(it.filter(Char::isDigit).take(2)) },
                label = { Text("Min") },
                modifier = Modifier.weight(1f),
            )
        }
        if (!use24Hour) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(
                    selected = state.amPm == AmPm.AM,
                    onClick = { onAmPmChange(AmPm.AM) },
                    label = { Text("AM") },
                )
                FilterChip(
                    selected = state.amPm == AmPm.PM,
                    onClick = { onAmPmChange(AmPm.PM) },
                    label = { Text("PM") },
                )
            }
        }
    }
}
