package com.nominacopro.domain.auth

object PasswordRules {

    private val SPECIAL_CHAR_REGEX = Regex("[^A-Za-z0-9]")

    fun validate(password: String): String? {
        if (password.length < 6) {
            return "La contraseña debe tener al menos 6 caracteres."
        }
        if (!password.any { it.isLowerCase() }) {
            return "Incluye al menos una letra minúscula."
        }
        if (!password.any { it.isUpperCase() }) {
            return "Incluye al menos una letra mayúscula."
        }
        if (!password.any { it.isDigit() }) {
            return "Incluye al menos un número."
        }
        if (!SPECIAL_CHAR_REGEX.containsMatchIn(password)) {
            return "Incluye al menos un carácter especial (ej. ! @ #)."
        }
        return null
    }

    fun isValid(password: String): Boolean = validate(password) == null
}
