package com.nominacopro.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.nominacopro.data.preferences.AppPreferencesStore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        if (intent?.action != Intent.ACTION_BOOT_COMPLETED) return
        val pending = goAsync()
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val prefs = AppPreferencesStore(context).observe().first()
                if (prefs.reminderEnabled) {
                    ReminderScheduler.schedule(context, prefs.reminderHour, prefs.reminderMinute)
                }
            } finally {
                pending.finish()
            }
        }
    }
}
