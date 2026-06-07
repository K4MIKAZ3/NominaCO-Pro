package com.nominacopro.data.sync

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class RemoteProfile(
    @SerialName("user_id") val userId: String,
    val name: String = "",
    @SerialName("document_id") val documentId: String = "",
    @SerialName("job_title") val jobTitle: String = "",
    @SerialName("monthly_salary") val monthlySalary: Long = 0,
    @SerialName("daily_hours") val dailyHours: Int = 8,
    @SerialName("contract_type") val contractType: String = "INDEFINIDO",
    @SerialName("pay_period_type") val payPeriodType: String = "BIWEEKLY",
    @SerialName("pending_vacation_days") val pendingVacationDays: Int = 0,
)

@Serializable
data class RemoteWorkDay(
    @SerialName("user_id") val userId: String,
    @SerialName("date_iso") val dateIso: String,
    @SerialName("start_time") val startTime: String,
    @SerialName("end_time") val endTime: String,
    @SerialName("day_type") val dayType: String,
    val notes: String = "",
)

@Serializable
data class RemoteManualHoliday(
    @SerialName("user_id") val userId: String,
    @SerialName("date_iso") val dateIso: String,
    val label: String = "",
)

@Serializable
data class RemoteManualDeduction(
    val id: String,
    @SerialName("user_id") val userId: String,
    @SerialName("year_month") val yearMonth: String,
    val label: String,
    val amount: Long,
    @SerialName("effective_date_iso") val effectiveDateIso: String? = null,
    @SerialName("entry_type") val entryType: String = "DEDUCTION",
)

@Serializable
data class RemoteAppPreferences(
    @SerialName("user_id") val userId: String,
    @SerialName("default_start_hour") val defaultStartHour: Int = 8,
    @SerialName("default_start_minute") val defaultStartMinute: Int = 0,
    @SerialName("default_end_hour") val defaultEndHour: Int = 16,
    @SerialName("default_end_minute") val defaultEndMinute: Int = 30,
    @SerialName("use_24h_format") val use24HourFormat: Boolean = true,
    @SerialName("reminder_enabled") val reminderEnabled: Boolean = false,
    @SerialName("reminder_hour") val reminderHour: Int = 18,
    @SerialName("reminder_minute") val reminderMinute: Int = 0,
)
