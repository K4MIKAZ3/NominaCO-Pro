package com.nominacopro.data.auth

import io.github.jan.supabase.gotrue.OtpType
import io.github.jan.supabase.gotrue.SessionStatus
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.providers.builtin.Email
import io.github.jan.supabase.gotrue.user.UserInfo
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

sealed interface AuthUiState {
    data object Loading : AuthUiState
    data object NotConfigured : AuthUiState
    data object Unauthenticated : AuthUiState
    data class Authenticated(val email: String, val userId: String) : AuthUiState
    data class Error(val message: String) : AuthUiState
}

class AuthRepository {

    private val supabase = SupabaseProvider.client

    private val _state = MutableStateFlow<AuthUiState>(
        when {
            !SupabaseProvider.isConfigured -> AuthUiState.NotConfigured
            else -> AuthUiState.Loading
        },
    )
    val state: StateFlow<AuthUiState> = _state.asStateFlow()

    suspend fun observeSession() {
        if (!SupabaseProvider.isConfigured || supabase == null) {
            _state.value = AuthUiState.NotConfigured
            return
        }
        supabase.auth.sessionStatus.collect { status ->
            _state.value = when (status) {
                is SessionStatus.Authenticated -> {
                    val user = status.session.user
                    if (user != null) user.toAuthenticated() else AuthUiState.Unauthenticated
                }
                is SessionStatus.NotAuthenticated -> AuthUiState.Unauthenticated
                SessionStatus.LoadingFromStorage -> AuthUiState.Loading
                SessionStatus.NetworkError -> AuthUiState.Unauthenticated
            }
        }
    }

    suspend fun signIn(email: String, password: String): String? = try {
        requireClient().auth.signInWith(Email) {
            this.email = email.trim()
            this.password = password
        }
        null
    } catch (e: Exception) {
        parseError(e)
    }

    suspend fun signUp(email: String, password: String): String? = try {
        requireClient().auth.signUpWith(Email) {
            this.email = email.trim()
            this.password = password
        }
        null
    } catch (e: Exception) {
        parseError(e)
    }

    suspend fun signOut() {
        try {
            if (SupabaseProvider.isConfigured && supabase != null) {
                supabase.auth.signOut()
            }
        } finally {
            _state.value = AuthUiState.Unauthenticated
        }
    }

    suspend fun verifyEmailRegistered(email: String): String? {
        val trimmed = email.trim()
        if (!isValidEmail(trimmed)) {
            return "Ingresa un correo válido"
        }
        return try {
            requireClient().auth.signInWith(Email) {
                this.email = trimmed
                this.password = "__invalid_probe_password__"
            }
            null
        } catch (e: Exception) {
            when (emailExistsFromSignInError(e)) {
                true -> null
                false -> "No hay cuenta registrada con ese correo"
                null -> errorMessageOnly(e) ?: "Error al verificar el correo"
            }
        }
    }

    suspend fun sendPasswordResetEmail(email: String): String? = try {
        requireClient().auth.resetPasswordForEmail(
            email = email.trim(),
            redirectUrl = "https://nominapp.xyz/restablecer-contrasena",
        )
        null
    } catch (e: Exception) {
        errorMessageOnly(e)
    }

    suspend fun resetPasswordWithOtp(email: String, otp: String, newPassword: String): String? = try {
        requireClient().auth.verifyEmailOtp(
            type = OtpType.Email.RECOVERY,
            email = email.trim(),
            token = otp.trim(),
        )
        requireClient().auth.updateUser {
            password = newPassword
        }
        signOut()
        null
    } catch (e: Exception) {
        errorMessageOnly(e)
    }

    private fun requireClient() =
        supabase ?: error("Supabase no configurado. Añade SUPABASE_URL y SUPABASE_ANON_KEY.")

    private fun UserInfo.toAuthenticated() = AuthUiState.Authenticated(
        email = email ?: "Usuario",
        userId = id,
    )

    private fun parseError(e: Exception): String {
        val msg = errorMessageOnly(e) ?: "Error de autenticación"
        _state.value = AuthUiState.Error(msg)
        return msg
    }

    private fun errorMessageOnly(e: Exception): String? =
        e.message?.substringBefore("\nURL:")?.trim()

    private fun isValidEmail(email: String): Boolean =
        EMAIL_REGEX.matches(email)

    private fun emailExistsFromSignInError(e: Exception): Boolean? {
        val msg = errorMessageOnly(e)?.lowercase() ?: return null
        return when {
            msg.contains("invalid login credentials") ||
                msg.contains("invalid credentials") ||
                msg.contains("email not confirmed") -> true
            msg.contains("user not found") ||
                msg.contains("no user") -> false
            else -> null
        }
    }

    private companion object {
        private val EMAIL_REGEX = Regex("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")
    }
}
