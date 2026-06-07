package com.nominacopro.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "profile")
data class ProfileEntity(
    @PrimaryKey val id: Int = 1,
    val name: String,
    val documentId: String,
    val jobTitle: String,
    val monthlySalary: Long,
    val dailyHours: Int,
)

@Entity(tableName = "work_days")
data class WorkDayEntity(
    @PrimaryKey val dateIso: String,
    val startTime: String,
    val endTime: String,
    val dayType: String,
    val notes: String = "",
)

@Entity(tableName = "manual_holidays")
data class ManualHolidayEntity(
    @PrimaryKey val dateIso: String,
    val label: String = "",
)

@Entity(tableName = "manual_deductions")
data class ManualDeductionEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val cloudId: String? = null,
    val yearMonth: String,
    val label: String,
    val amount: Long,
)
