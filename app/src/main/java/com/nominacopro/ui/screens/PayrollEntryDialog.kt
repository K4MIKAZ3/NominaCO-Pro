package com.nominacopro.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.nominacopro.domain.model.PayrollEntryType

@Composable
fun PayrollEntryDialog(
    entryType: PayrollEntryType,
    onDismiss: () -> Unit,
    onSave: (label: String, amount: Long) -> Unit,
) {
    var label by remember { mutableStateOf("") }
    var amount by remember { mutableStateOf("") }

    val title = when (entryType) {
        PayrollEntryType.ADVANCE -> "Registrar avance recibido"
        PayrollEntryType.DEDUCTION -> "Agregar egreso / préstamo"
        PayrollEntryType.BONUS -> "Agregar bono"
    }
    val hint = when (entryType) {
        PayrollEntryType.ADVANCE -> "Dinero que ya te pagó el patrón en este período."
        PayrollEntryType.DEDUCTION -> "Descuento manual del neto (préstamo, libranza, etc.)"
        PayrollEntryType.BONUS -> "Ingreso adicional (bonificación, incentivo, etc.)."
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(hint)
                OutlinedTextField(
                    value = label,
                    onValueChange = { label = it },
                    label = { Text("Concepto") },
                    modifier = Modifier.fillMaxWidth(),
                )
                OutlinedTextField(
                    value = amount,
                    onValueChange = { amount = it.filter(Char::isDigit) },
                    label = { Text("Valor") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val value = amount.toLongOrNull() ?: 0L
                    if (label.isNotBlank() && value > 0) onSave(label.trim(), value)
                },
            ) { Text("Guardar") }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancelar") }
        },
    )
}
