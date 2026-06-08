package com.nominacopro.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nominacopro.R
import com.nominacopro.ui.components.NominaTopBar
import com.nominacopro.data.sync.SyncUiState
import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.domain.model.AppPreferences
import com.nominacopro.ui.Formatters
import com.nominacopro.ui.TimeFieldState
import com.nominacopro.ui.TimeInput
import com.nominacopro.ui.TimeInputRow
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.LocalTime

@Composable
fun SettingsScreen(
    preferences: AppPreferences,
    manualHolidays: Set<LocalDate>,
    accountEmail: String? = null,
    syncState: SyncUiState? = null,
    onSyncNow: (() -> Unit)? = null,
    onSavePreferences: (AppPreferences) -> Unit,
    onRemoveHoliday: (LocalDate) -> Unit,
    onRequestNotificationPermission: () -> Unit,
    onRequestBiometricEnable: ((onSuccess: () -> Unit) -> Unit)? = null,
    onSignOut: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
) {
    val snackbar = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    val defaultStartTime = LocalTime.of(preferences.defaultStartHour, preferences.defaultStartMinute)
    val defaultEndTime = LocalTime.of(preferences.defaultEndHour, preferences.defaultEndMinute)
    val defaultReminderTime = LocalTime.of(preferences.reminderHour, preferences.reminderMinute)

    var scheduleStartFields by remember(preferences, preferences.use24HourFormat) {
        mutableStateOf(TimeInput.fieldsFrom(defaultStartTime, preferences.use24HourFormat))
    }
    var scheduleEndFields by remember(preferences, preferences.use24HourFormat) {
        mutableStateOf(TimeInput.fieldsFrom(defaultEndTime, preferences.use24HourFormat))
    }
    var reminderFields by remember(preferences, preferences.use24HourFormat) {
        mutableStateOf(TimeInput.fieldsFrom(defaultReminderTime, preferences.use24HourFormat))
    }
    var editingSchedule by rememberSaveable { mutableStateOf(false) }
    var editingReminder by rememberSaveable { mutableStateOf(false) }
    var showSignOutDialog by rememberSaveable { mutableStateOf(false) }
    var showDonationDialog by rememberSaveable { mutableStateOf(false) }

    fun buildPrefs(
        use24: Boolean = preferences.use24HourFormat,
        reminderEnabled: Boolean = preferences.reminderEnabled,
        darkMode: Boolean = preferences.darkModeEnabled,
        biometric: Boolean = preferences.biometricEnabled,
    ): AppPreferences {
        val start = TimeInput.toLocalTime(scheduleStartFields, use24, defaultStartTime)
        val end = TimeInput.toLocalTime(scheduleEndFields, use24, defaultEndTime)
        val reminder = TimeInput.toLocalTime(reminderFields, use24, defaultReminderTime)
        return AppPreferences(
            defaultStartHour = start.hour,
            defaultStartMinute = start.minute,
            defaultEndHour = end.hour,
            defaultEndMinute = end.minute,
            use24HourFormat = use24,
            reminderEnabled = reminderEnabled,
            reminderHour = reminder.hour,
            reminderMinute = reminder.minute,
            darkModeEnabled = darkMode,
            biometricEnabled = biometric,
        )
    }

    fun scheduleSummary() = "${Formatters.formatTime(
        LocalTime.of(preferences.defaultStartHour, preferences.defaultStartMinute),
        preferences.use24HourFormat,
    )} – ${Formatters.formatTime(
        LocalTime.of(preferences.defaultEndHour, preferences.defaultEndMinute),
        preferences.use24HourFormat,
    )}"

    fun reminderSummary() = if (preferences.reminderEnabled) {
        Formatters.formatTime(LocalTime.of(preferences.reminderHour, preferences.reminderMinute), preferences.use24HourFormat)
    } else {
        "Desactivado"
    }

    Scaffold(snackbarHost = { SnackbarHost(snackbar) }, modifier = modifier) { padding ->
        LazyColumn(
            Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(start = 0.dp, end = 0.dp, bottom = 16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            item { NominaTopBar(title = "Ajustes") }
            item {
                Text(
                    "Apariencia, horario, recordatorio y seguridad local.",
                    modifier = Modifier.padding(horizontal = 16.dp),
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                )
            }

            if (accountEmail != null || onSyncNow != null) {
                item {
                    Card(Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
                        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text("Cuenta Supabase", fontWeight = FontWeight.SemiBold)
                            accountEmail?.let { email ->
                                Text(email, color = MaterialTheme.colorScheme.primary)
                            }
                            when (syncState) {
                                SyncUiState.Syncing -> Row(
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                ) {
                                    CircularProgressIndicator(strokeWidth = 2.dp, modifier = Modifier.padding(4.dp))
                                    Text("Sincronizando…", style = MaterialTheme.typography.bodySmall)
                                }
                                is SyncUiState.Success -> Text(syncState.message, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                                is SyncUiState.Error -> Text(syncState.message, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.error)
                                else -> Unit
                            }
                            onSyncNow?.let { sync ->
                                OutlinedButton(onClick = sync, enabled = syncState != SyncUiState.Syncing) {
                                    Text(stringResource(R.string.sync_now))
                                }
                            }
                        }
                    }
                }
            }

            onSignOut?.let {
                item {
                    Card(Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
                        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text("Sesión", fontWeight = FontWeight.SemiBold)
                            Text(
                                "Cierra la cuenta sincronizada en este dispositivo.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                            )
                            OutlinedButton(
                                onClick = { showSignOutDialog = true },
                                modifier = Modifier.fillMaxWidth(),
                            ) {
                                Text(stringResource(R.string.auth_sign_out))
                            }
                        }
                    }
                }
            }

            item {
                Card(Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Apariencia y acceso", fontWeight = FontWeight.SemiBold)
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text("Modo nocturno")
                                Text("Tema oscuro de la app", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                            }
                            Switch(
                                checked = preferences.darkModeEnabled,
                                onCheckedChange = { onSavePreferences(buildPrefs(darkMode = it)) },
                            )
                        }
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text("Desbloqueo biométrico")
                                Text("Huella o Face ID solo en este dispositivo", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                            }
                            Switch(
                                checked = preferences.biometricEnabled,
                                onCheckedChange = { enabled ->
                                    if (enabled) {
                                        onRequestBiometricEnable?.invoke {
                                            onSavePreferences(buildPrefs(biometric = true))
                                        } ?: onSavePreferences(buildPrefs(biometric = true))
                                    } else {
                                        onSavePreferences(buildPrefs(biometric = false))
                                    }
                                },
                            )
                        }
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text("Formato 24 horas")
                            }
                            Switch(
                                checked = preferences.use24HourFormat,
                                onCheckedChange = { use24 ->
                                    val start = LocalTime.of(preferences.defaultStartHour, preferences.defaultStartMinute)
                                    val end = LocalTime.of(preferences.defaultEndHour, preferences.defaultEndMinute)
                                    val reminder = LocalTime.of(preferences.reminderHour, preferences.reminderMinute)
                                    scheduleStartFields = TimeInput.fieldsFrom(start, use24)
                                    scheduleEndFields = TimeInput.fieldsFrom(end, use24)
                                    reminderFields = TimeInput.fieldsFrom(reminder, use24)
                                    onSavePreferences(buildPrefs(use24 = use24))
                                },
                            )
                        }
                    }
                }
            }

            item {
                Card(Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Horario por defecto", fontWeight = FontWeight.SemiBold)
                        if (!editingSchedule) {
                            Text(scheduleSummary(), color = MaterialTheme.colorScheme.primary)
                            OutlinedButton(onClick = {
                                scheduleStartFields = TimeInput.fieldsFrom(defaultStartTime, preferences.use24HourFormat)
                                scheduleEndFields = TimeInput.fieldsFrom(defaultEndTime, preferences.use24HourFormat)
                                editingSchedule = true
                            }) { Text("Editar") }
                        } else {
                            TimeInputRow(
                                label = if (preferences.use24HourFormat) "Entrada (24 h)" else "Entrada",
                                use24Hour = preferences.use24HourFormat,
                                state = scheduleStartFields,
                                onHourChange = { scheduleStartFields = scheduleStartFields.copy(hour = it) },
                                onMinuteChange = { scheduleStartFields = scheduleStartFields.copy(minute = it) },
                                onAmPmChange = { scheduleStartFields = scheduleStartFields.copy(amPm = it) },
                            )
                            TimeInputRow(
                                label = if (preferences.use24HourFormat) "Salida (24 h)" else "Salida",
                                use24Hour = preferences.use24HourFormat,
                                state = scheduleEndFields,
                                onHourChange = { scheduleEndFields = scheduleEndFields.copy(hour = it) },
                                onMinuteChange = { scheduleEndFields = scheduleEndFields.copy(minute = it) },
                                onAmPmChange = { scheduleEndFields = scheduleEndFields.copy(amPm = it) },
                            )
                            Button(onClick = {
                                onSavePreferences(buildPrefs())
                                editingSchedule = false
                                scope.launch { snackbar.showSnackbar("Horario guardado") }
                            }) { Text("Guardar horario") }
                            TextButton(onClick = { editingSchedule = false }) { Text("Cancelar") }
                        }
                    }
                }
            }

            item {
                Card(Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text("Recordatorio diario", fontWeight = FontWeight.SemiBold)
                                Text("Aviso para registrar tu jornada", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                            }
                            Switch(
                                checked = preferences.reminderEnabled,
                                onCheckedChange = { enabled ->
                                    if (enabled) onRequestNotificationPermission()
                                    onSavePreferences(buildPrefs(reminderEnabled = enabled))
                                },
                            )
                        }
                        if (!editingReminder) {
                            Text("Hora: ${reminderSummary()}", color = MaterialTheme.colorScheme.primary)
                            if (preferences.reminderEnabled) {
                                OutlinedButton(onClick = {
                                    reminderFields = TimeInput.fieldsFrom(defaultReminderTime, preferences.use24HourFormat)
                                    editingReminder = true
                                }) { Text("Editar") }
                            }
                        } else {
                            TimeInputRow(
                                label = if (preferences.use24HourFormat) "Hora recordatorio (24 h)" else "Hora recordatorio",
                                use24Hour = preferences.use24HourFormat,
                                state = reminderFields,
                                onHourChange = { reminderFields = reminderFields.copy(hour = it) },
                                onMinuteChange = { reminderFields = reminderFields.copy(minute = it) },
                                onAmPmChange = { reminderFields = reminderFields.copy(amPm = it) },
                            )
                            Button(onClick = {
                                onSavePreferences(buildPrefs(reminderEnabled = true))
                                editingReminder = false
                                scope.launch { snackbar.showSnackbar("Recordatorio guardado") }
                            }) { Text("Guardar recordatorio") }
                            TextButton(onClick = { editingReminder = false }) { Text("Cancelar") }
                        }
                    }
                }
            }

            item { Text("Parámetros legales 2026", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(top = 8.dp)) }
            item {
                Card(Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
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

            item { Text("Festivos manuales", style = MaterialTheme.typography.titleMedium) }
            if (manualHolidays.isEmpty()) {
                item { Text("No hay festivos manuales.", modifier = Modifier.padding(8.dp)) }
            } else {
                items(manualHolidays.sortedDescending().toList()) { date ->
                    Card(Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
                        Row(Modifier.fillMaxWidth().padding(horizontal = 12.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
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
                    stringResource(R.string.donation_title),
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(top = 16.dp, start = 16.dp, end = 16.dp),
                )
            }
            item {
                Card(Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text(
                            stringResource(R.string.donation_summary),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                        )
                        OutlinedButton(
                            onClick = { showDonationDialog = true },
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Text(stringResource(R.string.donation_button))
                        }
                    }
                }
            }

            item { Text(stringResource(R.string.credits_title), style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(top = 8.dp, start = 16.dp, end = 16.dp)) }
            item {
                Card(Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(stringResource(R.string.credits_app) + " v1.6.1", fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.primary)
                        Text(stringResource(R.string.credits_developer))
                        Text(stringResource(R.string.credits_contact), color = MaterialTheme.colorScheme.primary)
                        Text(stringResource(R.string.credits_legal), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                        Text("© 2026 Nominapp · Colombia", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                    }
                }
            }
        }
    }

    if (showDonationDialog) {
        DonationDialog(onDismiss = { showDonationDialog = false })
    }

    if (showSignOutDialog) {
        AlertDialog(
            onDismissRequest = { showSignOutDialog = false },
            title = { Text(stringResource(R.string.auth_sign_out_confirm_title)) },
            text = { Text(stringResource(R.string.auth_sign_out_confirm_message)) },
            confirmButton = {
                TextButton(
                    onClick = {
                        showSignOutDialog = false
                        onSignOut?.invoke()
                    },
                ) {
                    Text(stringResource(R.string.auth_sign_out_confirm_yes))
                }
            },
            dismissButton = {
                TextButton(onClick = { showSignOutDialog = false }) {
                    Text(stringResource(R.string.auth_sign_out_confirm_no))
                }
            },
        )
    }
}

@Composable
private fun LegalRow(label: String, value: String) {
    Row(Modifier.fillMaxWidth().padding(vertical = 3.dp), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f))
        Text(value, color = MaterialTheme.colorScheme.primary)
    }
}
