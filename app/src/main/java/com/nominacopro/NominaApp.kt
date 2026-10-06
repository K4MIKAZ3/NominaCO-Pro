package com.nominacopro

import android.app.Application
import com.nominacopro.data.NominaRepository
import com.nominacopro.data.auth.AuthRepository
import com.nominacopro.data.update.AppUpdateRepository
import com.nominacopro.notifications.ReminderScheduler
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class NominaApp : Application() {
    lateinit var repository: NominaRepository
        private set
    lateinit var authRepository: AuthRepository
        private set
    lateinit var appUpdateRepository: AppUpdateRepository
        private set

    override fun onCreate() {
        super.onCreate()
        repository = NominaRepository(this)
        authRepository = AuthRepository()
        appUpdateRepository = AppUpdateRepository(this)
        CoroutineScope(Dispatchers.IO).launch {
            val prefs = repository.preferencesStore.observe().first()
            if (prefs.reminderEnabled) {
                ReminderScheduler.schedule(this@NominaApp, prefs.reminderHour, prefs.reminderMinute)
            }
        }
    }
}
