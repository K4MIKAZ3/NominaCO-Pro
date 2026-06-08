package com.nominacopro.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp

private enum class ForgotPasswordStep {
    EMAIL,
    NEW_PASSWORD,
}

@Composable
fun LoginScreen(
    isLoading: Boolean,
    errorMessage: String?,
    showLocalFallback: Boolean,
    onLogin: (email: String, password: String) -> Unit,
    onGoToRegister: () -> Unit,
    onContinueLocal: () -> Unit,
    onVerifyEmailForReset: (email: String, onResult: (Boolean, String?) -> Unit) -> Unit,
    onCompletePasswordReset: (email: String, otp: String, newPassword: String, onResult: (Boolean, String?) -> Unit) -> Unit,
) {
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var showForgotDialog by rememberSaveable { mutableStateOf(false) }
    var forgotEmail by rememberSaveable { mutableStateOf("") }
    var forgotStep by rememberSaveable { mutableStateOf(ForgotPasswordStep.EMAIL) }
    var forgotOtp by rememberSaveable { mutableStateOf("") }
    var forgotNewPassword by rememberSaveable { mutableStateOf("") }
    var forgotConfirmPassword by rememberSaveable { mutableStateOf("") }
    var forgotMessage by remember { mutableStateOf<String?>(null) }
    var forgotIsError by remember { mutableStateOf(false) }
    var forgotBusy by remember { mutableStateOf(false) }

    fun resetForgotDialog() {
        showForgotDialog = false
        forgotStep = ForgotPasswordStep.EMAIL
        forgotOtp = ""
        forgotNewPassword = ""
        forgotConfirmPassword = ""
        forgotMessage = null
        forgotIsError = false
        forgotBusy = false
    }

    if (showForgotDialog) {
        AlertDialog(
            onDismissRequest = { if (!forgotBusy) resetForgotDialog() },
            title = { Text("Recuperar contraseña") },
            text = {
                Column {
                    when (forgotStep) {
                        ForgotPasswordStep.EMAIL -> {
                            Text(
                                "Ingresa el correo de tu cuenta. Te enviaremos un código de recuperación.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                            )
                            Spacer(Modifier.height(12.dp))
                            OutlinedTextField(
                                value = forgotEmail,
                                onValueChange = { forgotEmail = it },
                                label = { Text("Correo") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true,
                            )
                        }
                        ForgotPasswordStep.NEW_PASSWORD -> {
                            Text(
                                "Revisa tu correo: copia el código de 6 dígitos del mensaje de recuperación. Luego elige tu nueva contraseña (mínimo 6 caracteres).",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                            )
                            Spacer(Modifier.height(12.dp))
                            OutlinedTextField(
                                value = forgotOtp,
                                onValueChange = { value ->
                                    forgotOtp = value.filter { it.isDigit() }.take(6)
                                },
                                label = { Text("Código del correo") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true,
                            )
                            Spacer(Modifier.height(8.dp))
                            OutlinedTextField(
                                value = forgotNewPassword,
                                onValueChange = { forgotNewPassword = it },
                                label = { Text("Nueva contraseña") },
                                visualTransformation = PasswordVisualTransformation(),
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true,
                            )
                            Spacer(Modifier.height(8.dp))
                            OutlinedTextField(
                                value = forgotConfirmPassword,
                                onValueChange = { forgotConfirmPassword = it },
                                label = { Text("Confirmar contraseña") },
                                visualTransformation = PasswordVisualTransformation(),
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true,
                            )
                        }
                    }
                    forgotMessage?.let {
                        Text(
                            it,
                            color = if (forgotIsError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary,
                            style = MaterialTheme.typography.bodySmall,
                            modifier = Modifier.padding(top = 8.dp),
                        )
                    }
                }
            },
            confirmButton = {
                when (forgotStep) {
                    ForgotPasswordStep.EMAIL -> {
                        TextButton(
                            onClick = {
                                forgotBusy = true
                                forgotMessage = null
                                onVerifyEmailForReset(forgotEmail) { ok, msg ->
                                    forgotBusy = false
                                    if (ok) {
                                        forgotStep = ForgotPasswordStep.NEW_PASSWORD
                                        forgotMessage = "Correo de recuperación enviado."
                                        forgotIsError = false
                                    } else {
                                        forgotMessage = msg
                                        forgotIsError = true
                                    }
                                }
                            },
                            enabled = forgotEmail.isNotBlank() && !forgotBusy,
                        ) { Text("Continuar") }
                    }
                    ForgotPasswordStep.NEW_PASSWORD -> {
                        TextButton(
                            onClick = {
                                when {
                                    forgotOtp.length != 6 -> {
                                        forgotMessage = "Ingresa el código de 6 dígitos del correo"
                                        forgotIsError = true
                                    }
                                    forgotNewPassword.length < 6 -> {
                                        forgotMessage = "La contraseña debe tener al menos 6 caracteres"
                                        forgotIsError = true
                                    }
                                    forgotNewPassword != forgotConfirmPassword -> {
                                        forgotMessage = "Las contraseñas no coinciden"
                                        forgotIsError = true
                                    }
                                    else -> {
                                        forgotBusy = true
                                        forgotMessage = null
                                        onCompletePasswordReset(
                                            forgotEmail,
                                            forgotOtp,
                                            forgotNewPassword,
                                        ) { ok, msg ->
                                            forgotBusy = false
                                            forgotMessage = msg
                                            forgotIsError = !ok
                                            if (ok) resetForgotDialog()
                                        }
                                    }
                                }
                            },
                            enabled = !forgotBusy &&
                                forgotOtp.length == 6 &&
                                forgotNewPassword.length >= 6 &&
                                forgotConfirmPassword.isNotBlank(),
                        ) { Text("Restablecer contraseña") }
                    }
                }
            },
            dismissButton = {
                when (forgotStep) {
                    ForgotPasswordStep.EMAIL -> {
                        TextButton(onClick = { resetForgotDialog() }, enabled = !forgotBusy) {
                            Text("Cancelar")
                        }
                    }
                    ForgotPasswordStep.NEW_PASSWORD -> {
                        TextButton(
                            onClick = {
                                forgotStep = ForgotPasswordStep.EMAIL
                                forgotOtp = ""
                                forgotNewPassword = ""
                                forgotConfirmPassword = ""
                                forgotMessage = null
                                forgotIsError = false
                            },
                            enabled = !forgotBusy,
                        ) { Text("Atrás") }
                    }
                }
            },
        )
    }

    Column(
        Modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        com.nominacopro.ui.components.NominaLogoMark(size = 56)
        Text("NominaApp", style = MaterialTheme.typography.headlineMedium, modifier = Modifier.padding(top = 12.dp))
        Text(
            "Inicia sesión para respaldar tu cuenta",
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
            modifier = Modifier.padding(top = 8.dp, bottom = 24.dp),
        )

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Correo") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Contraseña") },
            visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )

        TextButton(
            onClick = {
                forgotEmail = email
                forgotStep = ForgotPasswordStep.EMAIL
                forgotOtp = ""
                forgotNewPassword = ""
                forgotConfirmPassword = ""
                forgotMessage = null
                forgotIsError = false
                showForgotDialog = true
            },
            modifier = Modifier.align(Alignment.End),
        ) { Text("Olvidé mi contraseña") }

        errorMessage?.let {
            Text(
                it,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(top = 12.dp),
            )
        }

        Spacer(Modifier.height(24.dp))

        if (isLoading) {
            CircularProgressIndicator()
        } else {
            Button(
                onClick = { onLogin(email, password) },
                modifier = Modifier.fillMaxWidth(),
                enabled = email.isNotBlank() && password.length >= 6,
            ) { Text("Iniciar sesión") }

            TextButton(onClick = onGoToRegister, modifier = Modifier.padding(top = 8.dp)) {
                Text("Crear cuenta")
            }

            if (showLocalFallback) {
                OutlinedButton(
                    onClick = onContinueLocal,
                    modifier = Modifier.fillMaxWidth().padding(top = 16.dp),
                ) { Text("Continuar sin cuenta (solo local)") }
            }
        }
    }
}

@Composable
fun RegisterScreen(
    isLoading: Boolean,
    message: String?,
    isError: Boolean,
    onRegister: (email: String, password: String, confirm: String) -> Unit,
    onBackToLogin: () -> Unit,
) {
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var confirm by rememberSaveable { mutableStateOf("") }

    Column(
        Modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text("Crear cuenta", style = MaterialTheme.typography.headlineMedium)
        Text(
            "Regístrate con tu correo",
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
            modifier = Modifier.padding(top = 8.dp, bottom = 24.dp),
        )

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Correo") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Contraseña (mín. 6)") },
            visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(
            value = confirm,
            onValueChange = { confirm = it },
            label = { Text("Confirmar contraseña") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )

        message?.let {
            Text(
                it,
                color = if (isError) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(top = 12.dp),
            )
        }

        Spacer(Modifier.height(24.dp))

        if (isLoading) {
            CircularProgressIndicator()
        } else {
            Button(
                onClick = { onRegister(email, password, confirm) },
                modifier = Modifier.fillMaxWidth(),
                enabled = email.isNotBlank() && password.length >= 6 && password == confirm,
            ) { Text("Registrarme") }

            TextButton(onClick = onBackToLogin, modifier = Modifier.padding(top = 8.dp)) {
                Text("Ya tengo cuenta")
            }
        }
    }
}
