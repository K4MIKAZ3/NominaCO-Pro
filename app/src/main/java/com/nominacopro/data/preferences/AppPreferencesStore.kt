package com.nominacopro.data.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.nominacopro.domain.model.AppPreferences
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "app_preferences")

class AppPreferencesStore(private val context: Context) {

    private object Keys {
        val START_H = intPreferencesKey("default_start_hour")
        val START_M = intPreferencesKey("default_start_minute")
        val END_H = intPreferencesKey("default_end_hour")
        val END_M = intPreferencesKey("default_end_minute")
        val USE_24H = booleanPreferencesKey("use_24h_format")
        val REMINDER_ENABLED = booleanPreferencesKey("reminder_enabled")
        val REMINDER_H = intPreferencesKey("reminder_hour")
        val REMINDER_M = intPreferencesKey("reminder_minute")
        val DARK_MODE = booleanPreferencesKey("dark_mode_enabled")
        val BIOMETRIC = booleanPreferencesKey("biometric_enabled")
        val CLOUD_BACKUP = booleanPreferencesKey("cloud_backup_enabled")
        val OFFLINE_MODE = booleanPreferencesKey("offline_mode_enabled")
        val LAST_UPDATE_CHECK_MS = longPreferencesKey("last_update_check_at_ms")
        val DISMISSED_UPDATE_VERSION = intPreferencesKey("dismissed_update_version_code")
    }

    fun observe(): Flow<AppPreferences> = context.dataStore.data.map { prefs ->
        prefs.toAppPreferences()
    }

    suspend fun update(transform: (AppPreferences) -> AppPreferences) {
        context.dataStore.edit { prefs ->
            val updated = transform(prefs.toAppPreferences())
            prefs[Keys.START_H] = updated.defaultStartHour
            prefs[Keys.START_M] = updated.defaultStartMinute
            prefs[Keys.END_H] = updated.defaultEndHour
            prefs[Keys.END_M] = updated.defaultEndMinute
            prefs[Keys.USE_24H] = updated.use24HourFormat
            prefs[Keys.REMINDER_ENABLED] = updated.reminderEnabled
            prefs[Keys.REMINDER_H] = updated.reminderHour
            prefs[Keys.REMINDER_M] = updated.reminderMinute
            prefs[Keys.DARK_MODE] = updated.darkModeEnabled
            prefs[Keys.BIOMETRIC] = updated.biometricEnabled
            prefs[Keys.CLOUD_BACKUP] = updated.cloudBackupEnabled
            prefs[Keys.OFFLINE_MODE] = updated.offlineModeEnabled
            prefs[Keys.LAST_UPDATE_CHECK_MS] = updated.lastUpdateCheckAtMs
            prefs[Keys.DISMISSED_UPDATE_VERSION] = updated.dismissedUpdateVersionCode
        }
    }

    private fun Preferences.toAppPreferences() = AppPreferences(
        defaultStartHour = this[Keys.START_H] ?: 8,
        defaultStartMinute = this[Keys.START_M] ?: 0,
        defaultEndHour = this[Keys.END_H] ?: 16,
        defaultEndMinute = this[Keys.END_M] ?: 30,
        use24HourFormat = this[Keys.USE_24H] ?: true,
        reminderEnabled = this[Keys.REMINDER_ENABLED] ?: false,
        reminderHour = this[Keys.REMINDER_H] ?: 18,
        reminderMinute = this[Keys.REMINDER_M] ?: 0,
        darkModeEnabled = this[Keys.DARK_MODE] ?: true,
        biometricEnabled = this[Keys.BIOMETRIC] ?: false,
        cloudBackupEnabled = this[Keys.CLOUD_BACKUP] ?: false,
        offlineModeEnabled = this[Keys.OFFLINE_MODE] ?: false,
        lastUpdateCheckAtMs = this[Keys.LAST_UPDATE_CHECK_MS] ?: 0L,
        dismissedUpdateVersionCode = this[Keys.DISMISSED_UPDATE_VERSION] ?: 0,
    )
}
