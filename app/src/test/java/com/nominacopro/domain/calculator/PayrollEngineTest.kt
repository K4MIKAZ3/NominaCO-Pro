package com.nominacopro.domain.calculator

import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.domain.model.EmployeeProfile
import com.nominacopro.domain.model.ManualDeduction
import com.nominacopro.domain.model.WorkDayEntry
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate
import java.time.LocalTime
import java.time.YearMonth

class PayrollEngineTest {

    private val profile = EmployeeProfile(
        name = "Test",
        documentId = "1",
        jobTitle = "Dev",
        monthlySalary = 3_000_000,
        dailyHours = 8,
    )

    @Test
    fun liquidateMonth_appliesLegalDeductions() {
        val date = LocalDate.of(2026, 6, 2)
        val entries = listOf(
            WorkDayEntry(date, LocalTime.of(8, 0), LocalTime.of(16, 30)),
        )
        val payroll = PayrollEngine.liquidateMonth(profile, 2026, 6, entries, emptySet())

        assertEquals(1, payroll.workedDays)
        assertTrue(payroll.legalDeductions.size == 2)
        assertTrue(payroll.netTotal < payroll.grossTotal)
    }

    @Test
    fun proportionalBase_usesWorkedDaysOnly() {
        val entries = (1..15).map { day ->
            WorkDayEntry(
                LocalDate.of(2026, 6, day),
                LocalTime.of(8, 0),
                LocalTime.of(16, 0),
            )
        }
        val payroll = PayrollEngine.liquidateMonth(profile, 2026, 6, entries, emptySet())

        assertEquals(15, payroll.workedDays)
        assertEquals(100_000L, payroll.dailyRate)
        assertEquals(1_500_000L, payroll.earnings.first { it.code == "SBP" }.amount)
    }

    @Test
    fun transportSubsidy_isProportionalToWorkedDays() {
        val entries = listOf(
            WorkDayEntry(LocalDate.of(2026, 6, 2), LocalTime.of(8, 0), LocalTime.of(16, 0)),
            WorkDayEntry(LocalDate.of(2026, 6, 3), LocalTime.of(8, 0), LocalTime.of(16, 0)),
        )
        val payroll = PayrollEngine.liquidateMonth(profile, 2026, 6, entries, emptySet())

        val expected = ColombiaLaborLaw2026.transportSubsidyForDays(2)
        assertEquals(expected, payroll.earnings.first { it.code == "ST" }.amount)
    }

    @Test
    fun hourlyRate_isDailyRateDividedByJornada() {
        val entries = listOf(
            WorkDayEntry(LocalDate.of(2026, 6, 2), LocalTime.of(8, 0), LocalTime.of(16, 0)),
        )
        val payroll = PayrollEngine.liquidateMonth(profile, 2026, 6, entries, emptySet())

        assertEquals(ColombiaLaborLaw2026.hourlyRate(profile.monthlySalary, profile.dailyHours), payroll.hourlyRate, 0.01)
    }

    @Test
    fun applyManualDeductions_reducesNetTotal() {
        val base = PayrollEngine.liquidateMonth(
            profile, 2026, 6,
            listOf(WorkDayEntry(LocalDate.of(2026, 6, 3), LocalTime.of(8, 0), LocalTime.of(16, 0))),
            emptySet(),
        )
        val withLoan = PayrollEngine.applyManualDeductions(
            base,
            listOf(ManualDeduction(yearMonth = YearMonth.of(2026, 6), effectiveDate = LocalDate.of(2026, 6, 3), label = "Préstamo", amount = 100_000)),
        )

        assertEquals(100_000, base.netTotal - withLoan.netTotal)
        assertEquals(1, withLoan.manualDeductions.size)
    }

    @Test
    fun hourlyRate_usesSmmlvReferenceMonth() {
        val rate = ColombiaLaborLaw2026.hourlyRate(ColombiaLaborLaw2026.SMMLV, 8)
        assertTrue(rate > 0)
    }
}
