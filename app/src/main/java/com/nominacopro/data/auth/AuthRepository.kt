package com.nominacopro.data.auth

import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.providers.builtin.Email
import io.github.jan.supabase.auth.status.SessionStatus
import io.github.jan.supabase.auth.user.UserInfo
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
                is SessionStatus.Authenticated -> status.session.user.toAuthenticated()
                SessionStatus.NotAuthenticated -> AuthUiState.Unauthenticated
                SessionStatus.LoadingFromStorage -> AuthUiState.Loading
                is SessionStatus.RefreshFailure -> AuthUiState.Unauthenticated
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
        if (SupabaseProvider.isConfigured && supabase != null) {
            supabase.auth.signOut()
        }
    }

    private fun requireClient() =
        supabase ?: error("Supabase no configurado. Añade SUPABASE_URL y SUPABASE_ANON_KEY.")

    private fun UserInfo.toAuthenticated() = AuthUiState.Authenticated(
        email = email ?: "Usuario",
        userId = id,
    )

    private fun parseError(e: Exception): String {
        val msg = e.message?.substringBefore("\nURL:")?.trim() ?: "Error de autenticación"
        _state.value = AuthUiState.Error(msg)
        return msg
    }
}
