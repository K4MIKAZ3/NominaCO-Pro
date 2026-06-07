package com.nominacopro

import android.app.Application
import com.nominacopro.data.NominaRepository

class NominaApp : Application() {
    lateinit var repository: NominaRepository
        private set

    override fun onCreate() {
        super.onCreate()
        repository = NominaRepository(this)
    }
}
