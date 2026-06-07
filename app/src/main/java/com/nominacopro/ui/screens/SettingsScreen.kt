package com.nominacopro.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.Card
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.nominacopro.R
import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.domain.model.AppPreferences
import com.nominacopro.ui.Formatters
import java.time.LocalDate

@Composable
fun SettingsScreen(
    preferences: AppPreferences,
    manualHolidays: Set<LocalDate>,
    accountEmail: String? = null,
    onSavePreferences: (AppPreferences) -> Unit,
    onRemoveHoliday: (LocalDate) -> Unit,
    onRequestNotificationPermission: () -> Unit,
    onSignOut: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    var startH by rememberSaveable(preferences) { mutableStateOf(preferences.defaultStartHour.toString().padStart(2, '0')) }
    var startM by rememberSaveable(preferences) { mutableStateOf(preferences.defaultStartMinute.toString().padStart(2, '0')) }
    var endH by rememberSaveable(preferences) { mutableStateOf(preferences.defaultEndHour.toString().padStart(2, '0')) }
    var endM by rememberSaveable(preferences) { mutableStateOf(preferences.defaultEndMinute.toString().padStart(2, '0')) }
    var reminderH by rememberSaveable(preferences) { mutableStateOf(preferences.reminderHour.toString().padStart(2, '0')) }
    var reminderM by rememberSaveable(preferences) { mutableStateOf(preferences.reminderMinute.toString().padStart(2, '0')) }

    fun buildPrefs(
        use24: Boolean = preferences.use24HourFormat,
        reminderEnabled: Boolean = preferences.reminderEnabled,
    ) = AppPreferences(
        defaultStartHour = startH.toIntOrNull()?.coerceIn(0, 23) ?: 8,
        defaultStartMinute = startM.toIntOrNull()?.coerceIn(0, 59) ?: 0,
        defaultEndHour = endH.toIntOrNull()?.coerceIn(0, 23) ?: 16,
        defaultEndMinute = endM.toIntOrNull()?.coerceIn(0, 59) ?: 30,
        use24HourFormat = use24,
        reminderEnabled = reminderEnabled,
        reminderHour = reminderH.toIntOrNull()?.coerceIn(0, 23) ?: 18,
        reminderMinute = reminderM.toIntOrNull()?.coerceIn(0, 59) ?: 0,
    )

    LazyColumn(modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        item {
            Text("Preferencias", style = MaterialTheme.typography.titleLarge)
            Text(
                "Horario global, formato de hora y recordatorio diario.",
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
            )
        }

        if (accountEmail != null) {
            item {
                Card(Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Cuenta Supabase", fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold)
                        Text(accountEmail, color = MaterialTheme.colorScheme.primary)
                        onSignOut?.let { signOut ->
                            OutlinedButton(onClick = signOut) {
                                Text(stringResource(R.string.auth_sign_out))
                            }
                        }
                    }
                }
            }
        }

        item {
            Card(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Horario por defecto", fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold)
                    Text(
                        "Al abrir un día nuevo, se prellenan estas horas.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                    )
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
                    TextButton(onClick = { onSavePreferences(buildPrefs()) }) {
                        Text("Guardar horario default")
                    }
                }
            }
        }

        item {
            Card(Modifier.fillMaxWidth()) {
                Row(
                    Modifier.fillMaxWidth().padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Column(Modifier.weight(1f)) {
                        Text("Formato 24 horas")
                        Text(
                            if (preferences.use24HourFormat) "Mostrando 08:00 – 16:30" else "Mostrando 8:00 a. m. – 4:30 p. m.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                        )
                    }
                    Switch(
                        checked = preferences.use24HourFormat,
                        onCheckedChange = { onSavePreferences(buildPrefs(use24 = it)) },
                    )
                }
            }
        }

        item {
            Card(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(
                        Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Column(Modifier.weight(1f)) {
                            Text("Recordatorio diario", fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold)
                            Text(
                                "Te avisa para registrar tu jornada laboral.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                            )
                        }
                        Switch(
                            checked = preferences.reminderEnabled,
                            onCheckedChange = { enabled ->
                                if (enabled) onRequestNotificationPermission()
                                onSavePreferences(buildPrefs(reminderEnabled = enabled))
                            },
                        )
                    }
                    if (preferences.reminderEnabled) {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = reminderH,
                                onValueChange = { reminderH = it.filter(Char::isDigit).take(2) },
                                label = { Text("Hora") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                modifier = Modifier.weight(1f),
                            )
                            OutlinedTextField(
                                value = reminderM,
                                onValueChange = { reminderM = it.filter(Char::isDigit).take(2) },
                                label = { Text("Min") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                modifier = Modifier.weight(1f),
                            )
                        }
                        TextButton(onClick = { onSavePreferences(buildPrefs(reminderEnabled = true)) }) {
                            Text("Guardar hora del recordatorio")
                        }
                    }
                }
            }
        }

        item {
            Text("Parámetros legales 2026", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(top = 8.dp))
        }
        item {
            Card(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp)) {
                    LegalRow("SMMLV 2026", Formatters.money(ColombiaLaborLaw2026.SMMLV))
                    LegalRow("Auxilio transporte", Formatters.money(ColombiaLaborLaw2026.SUBSIDIO_TRANSPORTE))
                    LegalRow("Jornada máx. (ene–jun)", "44 h/semana")
                    LegalRow("Jornada máx. (jul–dic)", "42 h/semana")
                    LegalRow("Nocturno", "19:00 – 06:00 (+35%)")
                    LegalRow("Recargo dom./fest. (2026 H1)", "+80%")
                    LegalRow("Recargo dom./fest. (2026 H2)", "+90%")
                    LegalRow("Salud / Pensión empleado", "4% + 4%")
                }
            }
        }

        item {
            Text("Festivos manuales", style = MaterialTheme.typography.titleMedium)
            Text(
                "Marca días festivo desde el calendario.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
            )
        }
        if (manualHolidays.isEmpty()) {
            item { Text("No hay festivos manuales.", modifier = Modifier.padding(8.dp)) }
        } else {
            items(manualHolidays.sortedDescending().toList()) { date ->
                Card(Modifier.fillMaxWidth()) {
                    Row(
                        Modifier.fillMaxWidth().padding(horizontal = 12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text("${date.dayOfMonth}/${date.monthValue}/${date.year}")
                        IconButton(onClick = { onRemoveHoliday(date) }) {
                            Icon(Icons.Default.Delete, contentDescription = "Eliminar")
                        }
                    }
                }
            }
        }

        item {
            Text(
                stringResource(R.string.credits_title),
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(top = 16.dp),
            )
        }
        item {
            Card(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(
                        stringResource(R.string.credits_app) + " v1.2.0",
                        fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.primary,
                    )
                    Text(stringResource(R.string.credits_developer))
                    Text(
                        stringResource(R.string.credits_github),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.secondary,
                    )
                    Text(
                        stringResource(R.string.credits_legal),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                    )
                    Text(
                        "© 2026 Berrocal · Colombia",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                    )
                }
            }
        }
    }
}

@Composable
private fun LegalRow(label: String, value: String) {
    Row(
        Modifier.fillMaxWidth().padding(vertical = 3.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(label, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f))
        Text(value, color = MaterialTheme.colorScheme.primary)
    }
}
