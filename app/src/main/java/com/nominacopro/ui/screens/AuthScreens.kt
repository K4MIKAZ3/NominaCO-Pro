package com.nominacopro.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Checkbox
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import com.nominacopro.R
import com.nominacopro.domain.auth.PasswordRules
import com.nominacopro.ui.components.PasswordTextField
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.unit.dp
import com.nominacopro.ui.theme.NominaDesign

private enum class ForgotPasswordStep {
    EMAIL,
    SENT,
}

@Composable
fun LoginScreen(
    isLoading: Boolean,
    errorMessage: String?,
    showOfflineButton: Boolean = false,
    onLogin: (email: String, password: String) -> Unit,
    onGoToRegister: () -> Unit,
    onContinueOffline: () -> Unit,
    onRequestPasswordReset: (email: String, onResult: (Boolean, String?) -> Unit) -> Unit,
) {
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var showForgotDialog by rememberSaveable { mutableStateOf(false) }
    var forgotEmail by rememberSaveable { mutableStateOf("") }
    var forgotStep by rememberSaveable { mutableStateOf(ForgotPasswordStep.EMAIL) }
    var forgotMessage by remember { mutableStateOf<String?>(null) }
    var forgotIsError by remember { mutableStateOf(false) }
    var forgotBusy by remember { mutableStateOf(false) }

    fun resetForgotDialog() {
        showForgotDialog = false
        forgotStep = ForgotPasswordStep.EMAIL
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
                                stringResource(R.string.auth_forgot_password_intro),
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
                        ForgotPasswordStep.SENT -> {
                            Text(
                                stringResource(R.string.auth_forgot_password_sent),
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.primary,
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
                                onRequestPasswordReset(forgotEmail) { ok, msg ->
                                    forgotBusy = false
                                    if (ok) {
                                        forgotStep = ForgotPasswordStep.SENT
                                        forgotMessage = null
                                        forgotIsError = false
                                    } else {
                                        forgotMessage = msg
                                        forgotIsError = true
                                    }
                                }
                            },
                            enabled = forgotEmail.isNotBlank() && !forgotBusy,
                        ) { Text(stringResource(R.string.auth_forgot_password_send)) }
                    }
                    ForgotPasswordStep.SENT -> {
                        TextButton(
                            onClick = { resetForgotDialog() },
                            enabled = !forgotBusy,
                        ) { Text(stringResource(R.string.auth_forgot_password_done)) }
                    }
                }
            },
            dismissButton = {
                if (forgotStep == ForgotPasswordStep.EMAIL) {
                    TextButton(onClick = { resetForgotDialog() }, enabled = !forgotBusy) {
                        Text("Cancelar")
                    }
                }
            },
        )
    }

    Box(Modifier.fillMaxSize()) {
        if (showOfflineButton) {
            OutlinedButton(
                onClick = onContinueOffline,
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(16.dp),
            ) {
                Text(stringResource(R.string.auth_offline_mode))
            }
        }

        Column(
            Modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            com.nominacopro.ui.components.NominaLogoMark(size = 56)
            Text(
                "Nominapp",
                style = MaterialTheme.typography.headlineMedium,
                color = if (MaterialTheme.colorScheme.background.luminance() < 0.5f) {
                    NominaDesign.Green
                } else {
                    MaterialTheme.colorScheme.onSurface
                },
                modifier = Modifier.padding(top = 12.dp),
            )
            Text(
                stringResource(R.string.auth_login_subtitle),
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
            }
        }
    }
}

@Composable
fun RegisterScreen(
    isLoading: Boolean,
    message: String?,
    isError: Boolean,
    showOfflineButton: Boolean = false,
    onRegister: (email: String, password: String, confirm: String) -> Unit,
    onBackToLogin: () -> Unit,
    onContinueOffline: () -> Unit = {},
) {
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var confirm by rememberSaveable { mutableStateOf("") }
    var acceptedTerms by rememberSaveable { mutableStateOf(false) }
    val context = LocalContext.current
    val termsUrl = stringResource(R.string.auth_terms_url)

    Box(Modifier.fillMaxSize()) {
        if (showOfflineButton) {
            OutlinedButton(
                onClick = onContinueOffline,
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(16.dp),
            ) {
                Text(stringResource(R.string.auth_offline_mode))
            }
        }

        Column(
            Modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
        Text("Crear cuenta", style = MaterialTheme.typography.headlineMedium)
        Text(
            "Regístrate con tu correo",
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
            modifier = Modifier.padding(top = 8.dp, bottom = 8.dp),
        )
        Text(
            stringResource(R.string.auth_password_requirements_hint),
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
            style = MaterialTheme.typography.bodySmall,
            modifier = Modifier.padding(bottom = 24.dp),
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
        PasswordTextField(
            value = password,
            onValueChange = { password = it },
            label = "Contraseña",
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(12.dp))
        PasswordTextField(
            value = confirm,
            onValueChange = { confirm = it },
            label = "Confirmar contraseña",
            modifier = Modifier.fillMaxWidth(),
        )

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Checkbox(
                checked = acceptedTerms,
                onCheckedChange = { acceptedTerms = it },
            )
            Column(Modifier.weight(1f)) {
                Text(
                    stringResource(R.string.auth_terms_accept_label),
                    style = MaterialTheme.typography.bodySmall,
                )
                TextButton(
                    onClick = {
                        context.startActivity(
                            Intent(Intent.ACTION_VIEW, Uri.parse(termsUrl)),
                        )
                    },
                    contentPadding = PaddingValues(0.dp),
                    modifier = Modifier.padding(top = 2.dp),
                ) {
                    Text(
                        stringResource(R.string.auth_terms_open),
                        style = MaterialTheme.typography.bodySmall,
                    )
                }
            }
        }

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
                enabled = acceptedTerms &&
                    email.isNotBlank() &&
                    PasswordRules.isValid(password) &&
                    password == confirm,
            ) { Text("Registrarme") }

            TextButton(onClick = onBackToLogin, modifier = Modifier.padding(top = 8.dp)) {
                Text("Ya tengo cuenta")
            }
        }
        }
    }
}
