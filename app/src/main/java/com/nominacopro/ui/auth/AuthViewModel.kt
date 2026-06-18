package com.nominacopro.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.nominacopro.data.auth.AuthRepository
import com.nominacopro.data.auth.AuthUiState
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class AuthViewModel(private val repository: AuthRepository) : ViewModel() {

    val authState: StateFlow<AuthUiState> = repository.state.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5_000),
        AuthUiState.Loading,
    )

    init {
        viewModelScope.launch { repository.observeSession() }
    }

    fun signIn(email: String, password: String, onResult: (Boolean, String?) -> Unit) {
        viewModelScope.launch {
            val error = repository.signIn(email, password)
            if (error == null) onResult(true, null) else onResult(false, error)
        }
    }

    fun signUp(email: String, password: String, onResult: (Boolean, String?) -> Unit) {
        viewModelScope.launch {
            val error = repository.signUp(email, password)
            if (error == null) {
                onResult(true, "Cuenta creada. Revisa tu correo si requiere confirmación.")
            } else {
                onResult(false, error)
            }
        }
    }

    fun signOut() {
        viewModelScope.launch { repository.signOut() }
    }

    fun deleteAccount(onResult: (Boolean, String?) -> Unit) {
        viewModelScope.launch {
            val error = repository.deleteAccount()
            if (error == null) {
                onResult(true, null)
            } else {
                onResult(false, error)
            }
        }
    }

    fun requestPasswordReset(email: String, onResult: (Boolean, String?) -> Unit) {
        viewModelScope.launch {
            val verifyError = repository.verifyEmailRegistered(email)
            if (verifyError != null) {
                onResult(false, verifyError)
                return@launch
            }
            val sendError = repository.sendPasswordResetEmail(email)
            if (sendError == null) {
                onResult(true, null)
            } else {
                onResult(false, sendError)
            }
        }
    }

    class Factory(private val repository: AuthRepository) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T =
            AuthViewModel(repository) as T
    }
}
