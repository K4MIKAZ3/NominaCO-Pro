package com.nominacopro.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.nominacopro.data.local.dao.ManualDeductionDao
import com.nominacopro.data.local.dao.ManualHolidayDao
import com.nominacopro.data.local.dao.ProfileDao
import com.nominacopro.data.local.dao.WorkDayDao
import com.nominacopro.data.local.entity.ManualDeductionEntity
import com.nominacopro.data.local.entity.ManualHolidayEntity
import com.nominacopro.data.local.entity.ProfileEntity
import com.nominacopro.data.local.entity.WorkDayEntity

@Database(
    entities = [
        ProfileEntity::class,
        WorkDayEntity::class,
        ManualHolidayEntity::class,
        ManualDeductionEntity::class,
    ],
    version = 3,
    exportSchema = false,
)
abstract class NominaDatabase : RoomDatabase() {
    abstract fun profileDao(): ProfileDao
    abstract fun workDayDao(): WorkDayDao
    abstract fun manualHolidayDao(): ManualHolidayDao
    abstract fun manualDeductionDao(): ManualDeductionDao
}
