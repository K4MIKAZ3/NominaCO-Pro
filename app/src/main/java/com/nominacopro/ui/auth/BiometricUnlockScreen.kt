package com.nominacopro.ui.auth

import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Fingerprint
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity

@Composable
fun BiometricUnlockScreen(
    onUnlocked: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val context = LocalContext.current
    val activity = context as? FragmentActivity

    fun showPrompt() {
        if (activity == null) {
            onUnlocked()
            return
        }
        val executor = ContextCompat.getMainExecutor(context)
        val prompt = BiometricPrompt(
            activity,
            executor,
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    onUnlocked()
                }
            },
        )
        val info = BiometricPrompt.PromptInfo.Builder()
            .setTitle("Nominapp")
            .setSubtitle("Desbloqueo local con huella o Face ID")
            .setNegativeButtonText("Cancelar")
            .build()
        prompt.authenticate(info)
    }

    LaunchedEffect(Unit) {
        val canAuth = BiometricManager.from(context)
            .canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG)
        if (canAuth == BiometricManager.BIOMETRIC_SUCCESS) {
            showPrompt()
        }
    }

    Column(
        modifier.fillMaxSize().padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Icon(
            Icons.Default.Fingerprint,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(bottom = 16.dp),
        )
        Text("Nominapp", style = MaterialTheme.typography.headlineMedium)
        Text(
            "Usa tu huella o Face ID para continuar",
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
            modifier = Modifier.padding(top = 8.dp, bottom = 24.dp),
        )
        Button(onClick = { showPrompt() }, modifier = Modifier.fillMaxWidth()) {
            Text("Desbloquear")
        }
    }
}

@Composable
fun BiometricGate(
    enabled: Boolean,
    content: @Composable () -> Unit,
) {
    var unlocked by rememberSaveable { mutableStateOf(!enabled) }
    if (!enabled || unlocked) {
        content()
    } else {
        BiometricUnlockScreen(onUnlocked = { unlocked = true })
    }
}

fun promptLocalBiometric(context: android.content.Context, onSuccess: () -> Unit) {
    val activity = context as? FragmentActivity ?: run {
        onSuccess()
        return
    }
    val executor = ContextCompat.getMainExecutor(context)
    val prompt = BiometricPrompt(
        activity,
        executor,
        object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                onSuccess()
            }
        },
    )
    prompt.authenticate(
        BiometricPrompt.PromptInfo.Builder()
            .setTitle("Nominapp")
            .setSubtitle("Confirma tu huella o Face ID")
            .setNegativeButtonText("Cancelar")
            .build(),
    )
}
