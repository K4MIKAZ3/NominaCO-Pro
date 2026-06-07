package com.nominacopro.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.nominacopro.data.local.entity.ManualHolidayEntity
import com.nominacopro.data.local.entity.ProfileEntity
import com.nominacopro.data.local.entity.WorkDayEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ProfileDao {
    @Query("SELECT * FROM profile WHERE id = 1 LIMIT 1")
    fun observe(): Flow<ProfileEntity?>

    @Query("SELECT * FROM profile WHERE id = 1 LIMIT 1")
    suspend fun get(): ProfileEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(profile: ProfileEntity)
}

@Dao
interface WorkDayDao {
    @Query("SELECT * FROM work_days WHERE dateIso LIKE :yearMonth || '%' ORDER BY dateIso")
    fun observeMonth(yearMonth: String): Flow<List<WorkDayEntity>>

    @Query("SELECT * FROM work_days WHERE dateIso = :dateIso LIMIT 1")
    suspend fun get(dateIso: String): WorkDayEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: WorkDayEntity)

    @Query("DELETE FROM work_days WHERE dateIso = :dateIso")
    suspend fun delete(dateIso: String)
}

@Dao
interface ManualHolidayDao {
    @Query("SELECT * FROM manual_holidays ORDER BY dateIso DESC")
    fun observeAll(): Flow<List<ManualHolidayEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: ManualHolidayEntity)

    @Query("DELETE FROM manual_holidays WHERE dateIso = :dateIso")
    suspend fun delete(dateIso: String)
}
