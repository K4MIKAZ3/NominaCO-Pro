package com.nominacopro.data.auth

import io.github.jan.supabase.gotrue.OtpType
import io.github.jan.supabase.gotrue.SessionStatus
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.providers.builtin.Email
import io.github.jan.supabase.gotrue.user.UserInfo
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.rpc
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

    suspend fun deleteAccount(): String? = try {
        requireClient().postgrest.rpc("delete_own_account")
        signOut()
        null
    } catch (e: Exception) {
        friendlyAuthError(errorMessageOnly(e)).let { msg ->
            when {
                msg.contains("delete_own_account", ignoreCase = true) ||
                    msg.contains("function", ignoreCase = true) && msg.contains("does not exist", ignoreCase = true) ->
                    "Eliminación de cuenta no configurada en el servidor. Contacta a soporte."
                else -> msg.ifBlank { "No se pudo eliminar la cuenta" }
            }
        }
    }

    suspend fun verifyEmailRegistered(email: String): String? {
        val trimmed = email.trim()
        if (!isValidEmail(trimmed)) {
            return "Ingresa un correo válido"
        }
        return null
    }

    suspend fun sendPasswordResetEmail(email: String): String? = try {
        requireClient().auth.resetPasswordForEmail(
            email = email.trim(),
            redirectUrl = "https://nominapp.xyz/restablecer-contrasena",
        )
        null
    } catch (e: Exception) {
        friendlyAuthError(errorMessageOnly(e))
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
        friendlyAuthError(errorMessageOnly(e))
    }

    private fun requireClient() =
        supabase ?: error("Supabase no configurado. Añade SUPABASE_URL y SUPABASE_ANON_KEY.")

    private fun UserInfo.toAuthenticated() = AuthUiState.Authenticated(
        email = email ?: "Usuario",
        userId = id,
    )

    private fun parseError(e: Exception): String {
        val msg = friendlyAuthError(errorMessageOnly(e))
        _state.value = AuthUiState.Error(msg)
        return msg
    }

    private fun errorMessageOnly(e: Exception): String? =
        e.message?.substringBefore("\nURL:")?.trim()

    private fun friendlyAuthError(raw: String?): String {
        val msg = raw?.trim().orEmpty()
        if (msg.isEmpty()) return "Error de autenticación"
        val lower = msg.lowercase()
        return when {
            lower.contains("rate limit") ->
                "Demasiados correos enviados. Espera unos minutos e inténtalo de nuevo."
            lower.contains("invalid login credentials") || lower.contains("invalid credentials") ->
                "Correo o contraseña incorrectos."
            lower.contains("user already registered") || lower.contains("already been registered") ->
                "Ya existe una cuenta con ese correo."
            lower.contains("email not confirmed") ->
                "Confirma tu correo antes de iniciar sesión."
            lower.contains("user not found") || lower.contains("no user") ->
                "No hay cuenta registrada con ese correo."
            lower.contains("otp") && lower.contains("expired") ->
                "El código expiró. Solicita uno nuevo desde recuperar contraseña."
            lower.contains("otp") || lower.contains("token") && lower.contains("invalid") ->
                "Código incorrecto. Revisa el correo e inténtalo de nuevo."
            else -> msg
        }
    }

    private fun isValidEmail(email: String): Boolean =
        EMAIL_REGEX.matches(email)

    private companion object {
        private val EMAIL_REGEX = Regex("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")
    }
}
