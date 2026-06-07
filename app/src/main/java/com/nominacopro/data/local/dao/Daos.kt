package com.nominacopro.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.nominacopro.data.local.entity.ManualDeductionEntity
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

    @Query("DELETE FROM profile")
    suspend fun deleteAll()
}

@Dao
interface WorkDayDao {
    @Query("SELECT * FROM work_days WHERE dateIso LIKE :yearMonth || '%' ORDER BY dateIso")
    fun observeMonth(yearMonth: String): Flow<List<WorkDayEntity>>

    @Query("SELECT * FROM work_days ORDER BY dateIso")
    fun observeAll(): Flow<List<WorkDayEntity>>

    @Query("SELECT * FROM work_days WHERE dateIso >= :startIso AND dateIso <= :endIso ORDER BY dateIso")
    fun observeRange(startIso: String, endIso: String): Flow<List<WorkDayEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: WorkDayEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(entities: List<WorkDayEntity>)

    @Query("DELETE FROM work_days WHERE dateIso = :dateIso")
    suspend fun delete(dateIso: String)

    @Query("DELETE FROM work_days")
    suspend fun deleteAll()
}

@Dao
interface ManualHolidayDao {
    @Query("SELECT * FROM manual_holidays ORDER BY dateIso DESC")
    fun observeAll(): Flow<List<ManualHolidayEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: ManualHolidayEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(entities: List<ManualHolidayEntity>)

    @Query("DELETE FROM manual_holidays WHERE dateIso = :dateIso")
    suspend fun delete(dateIso: String)

    @Query("DELETE FROM manual_holidays")
    suspend fun deleteAll()
}

@Dao
interface ManualDeductionDao {
    @Query("SELECT * FROM manual_deductions WHERE yearMonth = :yearMonth ORDER BY id")
    fun observeMonth(yearMonth: String): Flow<List<ManualDeductionEntity>>

    @Query("SELECT * FROM manual_deductions WHERE effectiveDateIso >= :startIso AND effectiveDateIso <= :endIso ORDER BY effectiveDateIso, id")
    fun observeRange(startIso: String, endIso: String): Flow<List<ManualDeductionEntity>>

    @Query("SELECT * FROM manual_deductions ORDER BY yearMonth DESC, id")
    fun observeAll(): Flow<List<ManualDeductionEntity>>

    @Query("SELECT * FROM manual_deductions WHERE id = :id LIMIT 1")
    suspend fun getById(id: Long): ManualDeductionEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: ManualDeductionEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(entities: List<ManualDeductionEntity>)

    @Query("DELETE FROM manual_deductions WHERE id = :id")
    suspend fun delete(id: Long)

    @Query("DELETE FROM manual_deductions")
    suspend fun deleteAll()
}
