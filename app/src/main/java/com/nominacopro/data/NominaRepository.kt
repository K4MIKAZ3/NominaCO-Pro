package com.nominacopro.data

import android.content.Context
import androidx.room.Room
import com.nominacopro.data.local.NominaDatabase
import com.nominacopro.data.local.entity.ManualHolidayEntity
import com.nominacopro.data.local.entity.ProfileEntity
import com.nominacopro.data.local.entity.WorkDayEntity
import com.nominacopro.domain.calculator.PayrollEngine
import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.domain.model.DayType
import com.nominacopro.domain.model.EmployeeProfile
import com.nominacopro.domain.model.MonthlyPayroll
import com.nominacopro.domain.model.WorkDayEntry
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import java.time.LocalDate
import java.time.LocalTime
import java.time.YearMonth
import java.time.format.DateTimeFormatter

class NominaRepository(context: Context) {

    private val db = Room.databaseBuilder(
        context.applicationContext,
        NominaDatabase::class.java,
        "nomina_co_pro.db",
    ).build()

    private val profileDao = db.profileDao()
    private val workDayDao = db.workDayDao()
    private val holidayDao = db.manualHolidayDao()

    private val iso = DateTimeFormatter.ISO_LOCAL_DATE

    fun observeProfile() = profileDao.observe().map { it?.toDomain() }

    suspend fun saveProfile(profile: EmployeeProfile) {
        profileDao.upsert(
            ProfileEntity(
                name = profile.name,
                documentId = profile.documentId,
                jobTitle = profile.jobTitle,
                monthlySalary = profile.monthlySalary,
                dailyHours = profile.dailyHours,
            ),
        )
    }

    fun observeWorkDays(year: Int, month: Int): Flow<List<WorkDayEntry>> {
        val prefix = YearMonth.of(year, month).toString()
        return workDayDao.observeMonth(prefix).map { list -> list.map { it.toDomain() } }
    }

    suspend fun saveWorkDay(entry: WorkDayEntry) {
        workDayDao.upsert(entry.toEntity())
    }

    suspend fun deleteWorkDay(date: LocalDate) {
        workDayDao.delete(date.format(iso))
    }

    fun observeManualHolidays(): Flow<Set<LocalDate>> =
        holidayDao.observeAll().map { list -> list.map { LocalDate.parse(it.dateIso, iso) }.toSet() }

    suspend fun toggleManualHoliday(date: LocalDate, enabled: Boolean) {
        val isoDate = date.format(iso)
        if (enabled) holidayDao.upsert(ManualHolidayEntity(isoDate))
        else holidayDao.delete(isoDate)
    }

    fun observeMonthlyPayroll(year: Int, month: Int): Flow<MonthlyPayroll?> =
        combine(
            observeProfile(),
            observeWorkDays(year, month),
            observeManualHolidays(),
        ) { profile, entries, manual ->
            profile?.let { PayrollEngine.liquidateMonth(it, year, month, entries, manual) }
        }

    fun observeCalendarMarks(year: Int, month: Int): Flow<Map<LocalDate, CalendarMark>> =
        combine(observeWorkDays(year, month), observeManualHolidays()) { entries, manual ->
            val ym = YearMonth.of(year, month)
            buildMap {
                for (d in 1..ym.lengthOfMonth()) {
                    val date = LocalDate.of(year, month, d)
                    val worked = entries.any { it.date == date }
                    val official = ColombiaLaborLaw2026.isOfficialHoliday(date)
                    val manualH = manual.contains(date)
                    val sunday = ColombiaLaborLaw2026.isSunday(date)
                    if (worked || official || manualH || sunday) {
                        put(date, CalendarMark(worked, official, manualH, sunday))
                    }
                }
            }
        }
}

data class CalendarMark(
    val worked: Boolean,
    val officialHoliday: Boolean,
    val manualHoliday: Boolean,
    val sunday: Boolean,
)

private fun ProfileEntity.toDomain() = EmployeeProfile(
    name = name,
    documentId = documentId,
    jobTitle = jobTitle,
    monthlySalary = monthlySalary,
    dailyHours = dailyHours,
)

private fun WorkDayEntity.toDomain() = WorkDayEntry(
    date = LocalDate.parse(dateIso, DateTimeFormatter.ISO_LOCAL_DATE),
    start = LocalTime.parse(startTime),
    end = LocalTime.parse(endTime),
    dayType = DayType.valueOf(dayType),
    notes = notes,
)

private fun WorkDayEntry.toEntity() = WorkDayEntity(
    dateIso = date.format(DateTimeFormatter.ISO_LOCAL_DATE),
    startTime = start.toString(),
    endTime = end.toString(),
    dayType = dayType.name,
    notes = notes,
)
