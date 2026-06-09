package com.nominacopro.ui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.nominacopro.data.update.AppUpdateManifest

@Composable
fun UpdateAvailableDialog(
    manifest: AppUpdateManifest,
    downloading: Boolean,
    downloadProgress: Float,
    onDismiss: () -> Unit,
    onUpdate: () -> Unit,
) {
    AlertDialog(
        onDismissRequest = {
            if (!downloading) onDismiss()
        },
        properties = androidx.compose.ui.window.DialogProperties(
            dismissOnBackPress = !downloading,
            dismissOnClickOutside = !downloading,
        ),
        title = { Text("Actualización disponible") },
        text = {
            Column {
                Text(
                    "Versión ${manifest.versionName} disponible.",
                    style = MaterialTheme.typography.bodyMedium,
                )
                if (manifest.releaseNotes.isNotBlank()) {
                    Spacer(Modifier.height(8.dp))
                    Text(
                        manifest.releaseNotes,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                    )
                }
                if (downloading) {
                    Spacer(Modifier.height(12.dp))
                    LinearProgressIndicator(
                        progress = { downloadProgress.coerceIn(0f, 1f) },
                        modifier = Modifier.fillMaxWidth(),
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        "Descargando… ${(downloadProgress * 100).toInt()}%",
                        style = MaterialTheme.typography.bodySmall,
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        "Puedes ir a Ajustes del sistema; la descarga continúa en segundo plano.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                    )
                }
            }
        },
        confirmButton = {
            TextButton(
                onClick = onUpdate,
                enabled = !downloading,
            ) {
                Text(if (downloading) "Descargando…" else "Actualizar")
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                enabled = !downloading,
            ) {
                Text("Ahora no")
            }
        },
    )
}

@Composable
fun InstallPermissionDialog(
    onDismiss: () -> Unit,
    onOpenSettings: () -> Unit,
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Permiso de instalación") },
        text = {
            Text(
                "Para instalar la actualización, permite que Nominapp instale aplicaciones desconocidas en los ajustes del sistema.",
            )
        },
        confirmButton = {
            TextButton(onClick = onOpenSettings) {
                Text("Abrir ajustes")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancelar")
            }
        },
    )
}

@Composable
fun BackupActivationDialog(
    hasRemoteData: Boolean,
    busy: Boolean,
    onDismiss: () -> Unit,
    onPushLocal: () -> Unit,
    onPullRemote: () -> Unit,
) {
    AlertDialog(
        onDismissRequest = { if (!busy) onDismiss() },
        title = { Text("Activar respaldo en la nube") },
        text = {
            Text(
                if (hasRemoteData) {
                    "Ya hay datos en tu cuenta en la nube. ¿Qué deseas hacer con los datos de este dispositivo?"
                } else {
                    "¿Subir los datos de este dispositivo a tu cuenta en la nube?"
                },
            )
        },
        confirmButton = {
            if (hasRemoteData) {
                TextButton(onClick = onPullRemote, enabled = !busy) {
                    Text("Usar datos de la nube")
                }
            } else {
                TextButton(onClick = onPushLocal, enabled = !busy) {
                    Text("Subir datos")
                }
            }
        },
        dismissButton = {
            if (hasRemoteData) {
                TextButton(onClick = onPushLocal, enabled = !busy) {
                    Text("Mantener datos locales")
                }
            } else {
                TextButton(onClick = onDismiss, enabled = !busy) {
                    Text("Ahora no")
                }
            }
        },
    )
}
