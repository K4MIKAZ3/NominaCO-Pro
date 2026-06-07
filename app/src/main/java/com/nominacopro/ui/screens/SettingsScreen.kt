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
import androidx.compose.material.icons.filled.Logout
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.nominacopro.R
import com.nominacopro.data.sync.SyncUiState
import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.domain.model.AppPreferences
import com.nominacopro.ui.Formatters
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

    var startH by rememberSaveable(preferences) { mutableStateOf(preferences.defaultStartHour.toString().padStart(2, '0')) }
    var startM by rememberSaveable(preferences) { mutableStateOf(preferences.defaultStartMinute.toString().padStart(2, '0')) }
    var endH by rememberSaveable(preferences) { mutableStateOf(preferences.defaultEndHour.toString().padStart(2, '0')) }
    var endM by rememberSaveable(preferences) { mutableStateOf(preferences.defaultEndMinute.toString().padStart(2, '0')) }
    var reminderH by rememberSaveable(preferences) { mutableStateOf(preferences.reminderHour.toString().padStart(2, '0')) }
    var reminderM by rememberSaveable(preferences) { mutableStateOf(preferences.reminderMinute.toString().padStart(2, '0')) }
    var editingSchedule by rememberSaveable { mutableStateOf(false) }
    var editingReminder by rememberSaveable { mutableStateOf(false) }
    var showSignOutDialog by rememberSaveable { mutableStateOf(false) }

    fun buildPrefs(
        use24: Boolean = preferences.use24HourFormat,
        reminderEnabled: Boolean = preferences.reminderEnabled,
        darkMode: Boolean = preferences.darkModeEnabled,
        biometric: Boolean = preferences.biometricEnabled,
    ) = AppPreferences(
        defaultStartHour = startH.toIntOrNull()?.coerceIn(0, 23) ?: 8,
        defaultStartMinute = startM.toIntOrNull()?.coerceIn(0, 59) ?: 0,
        defaultEndHour = endH.toIntOrNull()?.coerceIn(0, 23) ?: 16,
        defaultEndMinute = endM.toIntOrNull()?.coerceIn(0, 59) ?: 30,
        use24HourFormat = use24,
        reminderEnabled = reminderEnabled,
        reminderHour = reminderH.toIntOrNull()?.coerceIn(0, 23) ?: 18,
        reminderMinute = reminderM.toIntOrNull()?.coerceIn(0, 59) ?: 0,
        darkModeEnabled = darkMode,
        biometricEnabled = biometric,
    )

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
            Modifier.fillMaxSize().padding(padding).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            item {
                Text("Preferencias", style = MaterialTheme.typography.titleLarge)
                Text(
                    "Apariencia, horario, recordatorio y seguridad local.",
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                )
            }

            if (accountEmail != null || onSyncNow != null) {
                item {
                    Card(Modifier.fillMaxWidth()) {
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
                    Card(Modifier.fillMaxWidth()) {
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
                                Icon(
                                    Icons.Filled.Logout,
                                    contentDescription = null,
                                    modifier = Modifier.padding(end = 8.dp),
                                )
                                Text(stringResource(R.string.auth_sign_out))
                            }
                        }
                    }
                }
            }

            item {
                Card(Modifier.fillMaxWidth()) {
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
                                onCheckedChange = { onSavePreferences(buildPrefs(use24 = it)) },
                            )
                        }
                    }
                }
            }

            item {
                Card(Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Horario por defecto", fontWeight = FontWeight.SemiBold)
                        if (!editingSchedule) {
                            Text(scheduleSummary(), color = MaterialTheme.colorScheme.primary)
                            OutlinedButton(onClick = {
                                startH = preferences.defaultStartHour.toString().padStart(2, '0')
                                startM = preferences.defaultStartMinute.toString().padStart(2, '0')
                                endH = preferences.defaultEndHour.toString().padStart(2, '0')
                                endM = preferences.defaultEndMinute.toString().padStart(2, '0')
                                editingSchedule = true
                            }) { Text("Editar") }
                        } else {
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                OutlinedTextField(value = startH, onValueChange = { startH = it.filter(Char::isDigit).take(2) }, label = { Text("Entrada h") }, modifier = Modifier.weight(1f))
                                OutlinedTextField(value = startM, onValueChange = { startM = it.filter(Char::isDigit).take(2) }, label = { Text("m") }, modifier = Modifier.weight(1f))
                            }
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                OutlinedTextField(value = endH, onValueChange = { endH = it.filter(Char::isDigit).take(2) }, label = { Text("Salida h") }, modifier = Modifier.weight(1f))
                                OutlinedTextField(value = endM, onValueChange = { endM = it.filter(Char::isDigit).take(2) }, label = { Text("m") }, modifier = Modifier.weight(1f))
                            }
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
                Card(Modifier.fillMaxWidth()) {
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
                                    reminderH = preferences.reminderHour.toString().padStart(2, '0')
                                    reminderM = preferences.reminderMinute.toString().padStart(2, '0')
                                    editingReminder = true
                                }) { Text("Editar") }
                            }
                        } else {
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                OutlinedTextField(value = reminderH, onValueChange = { reminderH = it.filter(Char::isDigit).take(2) }, label = { Text("Hora") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.weight(1f))
                                OutlinedTextField(value = reminderM, onValueChange = { reminderM = it.filter(Char::isDigit).take(2) }, label = { Text("Min") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.weight(1f))
                            }
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

            item { Text("Festivos manuales", style = MaterialTheme.typography.titleMedium) }
            if (manualHolidays.isEmpty()) {
                item { Text("No hay festivos manuales.", modifier = Modifier.padding(8.dp)) }
            } else {
                items(manualHolidays.sortedDescending().toList()) { date ->
                    Card(Modifier.fillMaxWidth()) {
                        Row(Modifier.fillMaxWidth().padding(horizontal = 12.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Text("${date.dayOfMonth}/${date.monthValue}/${date.year}")
                            IconButton(onClick = { onRemoveHoliday(date) }) {
                                Icon(Icons.Default.Delete, contentDescription = "Eliminar")
                            }
                        }
                    }
                }
            }

            item { Text(stringResource(R.string.credits_title), style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(top = 16.dp)) }
            item {
                Card(Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(stringResource(R.string.credits_app) + " v1.4.1", fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.primary)
                        Text(stringResource(R.string.credits_developer))
                        Text(stringResource(R.string.credits_github), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.secondary)
                        Text(stringResource(R.string.credits_legal), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                        Text("© 2026 Angel Berrocal · Colombia", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                    }
                }
            }
        }
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
