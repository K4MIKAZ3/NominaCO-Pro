package com.nominacopro.ui.components

import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable

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
