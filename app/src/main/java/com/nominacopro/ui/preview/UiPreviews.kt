package com.nominacopro.ui.preview

import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import com.nominacopro.data.CalendarMark
import com.nominacopro.domain.model.ManualDeduction
import com.nominacopro.domain.model.MonthSummary
import com.nominacopro.domain.model.MonthlyPayroll
import com.nominacopro.domain.model.PayrollLine
import com.nominacopro.domain.model.WorkDayEntry
import com.nominacopro.domain.model.AppPreferences
import com.nominacopro.domain.model.DayType
import com.nominacopro.domain.model.EmployeeProfile
import com.nominacopro.domain.model.HourBreakdown
import com.nominacopro.ui.components.DashboardCard
import com.nominacopro.ui.screens.CalendarScreen
import com.nominacopro.ui.screens.PayrollScreen
import com.nominacopro.ui.screens.SettingsScreen
import com.nominacopro.ui.theme.NominaTheme
import java.time.LocalDate
import java.time.LocalTime
import java.time.YearMonth

private val sampleProfile = EmployeeProfile(
    name = "María López",
    documentId = "1234567890",
    jobTitle = "Analista",
    monthlySalary = 2_800_000,
    dailyHours = 8,
)

private val samplePayroll = MonthlyPayroll(
    year = 2026,
    month = 6,
    workedDays = 18,
    restDays = 8,
    breakdown = HourBreakdown(normalDiurna = 120.0, nocturnaOrdinaria = 6.5),
    earnings = listOf(
        PayrollLine("Salario base proporcional", 2_800_000),
        PayrollLine("Subsidio de transporte", 124_548),
    ),
    legalDeductions = listOf(
        PayrollLine("Aporte salud (4%)", 116_982, isDeduction = true),
        PayrollLine("Aporte pensión (4%)", 116_982, isDeduction = true),
    ),
    manualDeductions = listOf(
        PayrollLine("Préstamo empleador", 120_000, isDeduction = true),
    ),
    grossTotal = 2_924_548,
    netTotal = 2_570_584,
)

private val sampleDashboard = listOf(
    MonthSummary(YearMonth.of(2026, 4), 2_900_000, 464_000, 150_000, 2_286_000),
    MonthSummary(YearMonth.of(2026, 5), 3_100_000, 496_000, 200_000, 2_404_000),
    MonthSummary(YearMonth.of(2026, 6), 2_924_548, 233_964, 120_000, 2_570_584),
)

@Preview(name = "Calendario + Dashboard", showBackground = true, backgroundColor = 0xFF0D0F14)
@Composable
private fun PreviewCalendar() {
    NominaTheme {
        CalendarScreen(
            dashboard = sampleDashboard,
            yearMonth = YearMonth.of(2026, 6),
            marks = mapOf(
                LocalDate.of(2026, 6, 2) to CalendarMark(true, false, false, false),
                LocalDate.of(2026, 6, 7) to CalendarMark(false, false, false, true),
            ),
            payroll = samplePayroll,
            onPrev = {},
            onNext = {},
            onToday = {},
            onDayClick = {},
        )
    }
}

@Preview(name = "Nómina + PDF + Días", showBackground = true, backgroundColor = 0xFF0D0F14, heightDp = 900)
@Composable
private fun PreviewPayroll() {
    NominaTheme {
        PayrollScreen(
            payroll = samplePayroll,
            workDays = listOf(
                WorkDayEntry(LocalDate.of(2026, 6, 2), LocalTime.of(8, 0), LocalTime.of(16, 30)),
                WorkDayEntry(LocalDate.of(2026, 6, 7), LocalTime.of(10, 0), LocalTime.of(18, 0), DayType.FESTIVO_DOMINICAL),
            ),
            manualDeductions = listOf(
                ManualDeduction(
                    id = 1,
                    yearMonth = YearMonth.of(2026, 6),
                    label = "Préstamo empleador",
                    amount = 120_000,
                ),
            ),
            use24Hour = true,
            profileMissing = false,
            onAddDeduction = {},
            onRemoveDeduction = {},
            onExportPayrollPdf = {},
            onExportWorkDaysPdf = {},
        )
    }
}

@Preview(name = "Ajustes", showBackground = true, backgroundColor = 0xFF0D0F14, heightDp = 800)
@Composable
private fun PreviewSettings() {
    NominaTheme {
        SettingsScreen(
            preferences = AppPreferences(),
            manualHolidays = emptySet(),
            accountEmail = "usuario@ejemplo.com",
            onSavePreferences = {},
            onRemoveHoliday = {},
            onRequestNotificationPermission = {},
            onSignOut = {},
        )
    }
}

@Preview(name = "Dashboard card", showBackground = true, backgroundColor = 0xFF0D0F14)
@Composable
private fun PreviewDashboardCard() {
    NominaTheme {
        DashboardCard(sampleDashboard)
    }
}
