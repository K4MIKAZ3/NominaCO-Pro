package com.nominacopro.data.notifications

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.inboxDataStore: DataStore<Preferences> by preferencesDataStore(name = "notification_inbox")

class NotificationInboxStore(context: Context) {

    private val dataStore = context.applicationContext.inboxDataStore

    private object Keys {
        val READ_IDS = stringSetPreferencesKey("read_ids")
    }

    fun observeReadIds(): Flow<Set<String>> = dataStore.data.map { prefs ->
        prefs[Keys.READ_IDS].orEmpty()
    }

    suspend fun markRead(id: String) {
        dataStore.edit { prefs ->
            prefs[Keys.READ_IDS] = prefs[Keys.READ_IDS].orEmpty() + id
        }
    }

    suspend fun markAllRead(ids: Collection<String>) {
        if (ids.isEmpty()) return
        dataStore.edit { prefs ->
            prefs[Keys.READ_IDS] = prefs[Keys.READ_IDS].orEmpty() + ids
        }
    }
}
