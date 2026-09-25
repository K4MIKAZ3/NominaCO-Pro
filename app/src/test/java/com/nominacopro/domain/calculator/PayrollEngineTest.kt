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
    fun fullWeekMonToFri_includesRemuneratedSunday() {
        val entries = (1..5).map { day ->
            WorkDayEntry(
                LocalDate.of(2026, 6, day),
                LocalTime.of(8, 0),
                LocalTime.of(16, 0),
            )
        }
        val payroll = PayrollEngine.liquidateMonth(profile, 2026, 6, entries, emptySet())

        assertEquals(5, payroll.workedDays)
        assertEquals(1, payroll.remuneratedRestDays)
        assertEquals(100_000L, payroll.earnings.first { it.code == "DRD" }.amount)
    }

    @Test
    fun applyManualEntries_bonusIncreasesGrossAndNet() {
        val base = PayrollEngine.liquidateMonth(
            profile, 2026, 6,
            listOf(WorkDayEntry(LocalDate.of(2026, 6, 3), LocalTime.of(8, 0), LocalTime.of(16, 0))),
            emptySet(),
        )
        val withBonus = PayrollEngine.applyManualEntries(
            base,
            listOf(
                ManualDeduction(
                    yearMonth = YearMonth.of(2026, 6),
                    effectiveDate = LocalDate.of(2026, 6, 10),
                    label = "Bono productividad",
                    amount = 200_000,
                    entryType = com.nominacopro.domain.model.PayrollEntryType.BONUS,
                ),
            ),
        )

        assertEquals(base.grossTotal + 200_000, withBonus.grossTotal)
        assertTrue(withBonus.netTotal > base.netTotal)
        assertEquals(1, withBonus.manualBonuses.size)
    }

    @Test
    fun hourlyRate_usesSmmlvReferenceMonth() {
        val rate = ColombiaLaborLaw2026.hourlyRate(ColombiaLaborLaw2026.SMMLV, 8)
        assertTrue(rate > 0)
    }

    @Test
    fun legalDeductions_excludeTransportSubsidyFromIbc() {
        val minProfile = profile.copy(monthlySalary = ColombiaLaborLaw2026.SMMLV)
        val entries = listOf(
            WorkDayEntry(LocalDate.of(2026, 6, 2), LocalTime.of(8, 0), LocalTime.of(16, 0)),
            WorkDayEntry(LocalDate.of(2026, 6, 3), LocalTime.of(8, 0), LocalTime.of(16, 0)),
        )
        val payroll = PayrollEngine.liquidateMonth(minProfile, 2026, 6, entries, emptySet())

        val transport = payroll.earnings.first { it.code == "ST" }.amount
        assertTrue(transport > 0)

        val ibc = ColombiaLaborLaw2026.contributionBase(payroll.earnings)
        assertEquals(payroll.grossTotal - transport, ibc)

        val salud = payroll.legalDeductions.first { it.code == "SAL" }.amount
        val pension = payroll.legalDeductions.first { it.code == "PEN" }.amount
        assertEquals((ibc * ColombiaLaborLaw2026.DESCUENTO_SALUD).toLong(), salud)
        assertEquals((ibc * ColombiaLaborLaw2026.DESCUENTO_PENSION).toLong(), pension)

        // Antes se cotizaba el auxilio: ahora el neto es mayor que con IBC = gross.
        val wrongNet = payroll.grossTotal -
            (payroll.grossTotal * ColombiaLaborLaw2026.DESCUENTO_SALUD).toLong() -
            (payroll.grossTotal * ColombiaLaborLaw2026.DESCUENTO_PENSION).toLong()
        assertTrue(payroll.netTotal > wrongNet)
    }

    @Test
    fun applyManualEntries_bonusEntersIbcButTransportStillExcluded() {
        val minProfile = profile.copy(monthlySalary = ColombiaLaborLaw2026.SMMLV)
        val base = PayrollEngine.liquidateMonth(
            minProfile,
            2026,
            6,
            listOf(WorkDayEntry(LocalDate.of(2026, 6, 2), LocalTime.of(8, 0), LocalTime.of(16, 0))),
            emptySet(),
        )
        val transport = base.earnings.first { it.code == "ST" }.amount
        val withBonus = PayrollEngine.applyManualEntries(
            base,
            listOf(
                ManualDeduction(
                    yearMonth = YearMonth.of(2026, 6),
                    effectiveDate = LocalDate.of(2026, 6, 10),
                    label = "Bono",
                    amount = 100_000,
                    entryType = com.nominacopro.domain.model.PayrollEntryType.BONUS,
                ),
            ),
        )

        val ibc = ColombiaLaborLaw2026.contributionBase(withBonus.earnings)
        assertEquals(withBonus.grossTotal - transport, ibc)
        val salud = withBonus.legalDeductions.first { it.code == "SAL" }.amount
        assertEquals((ibc * ColombiaLaborLaw2026.DESCUENTO_SALUD).toLong(), salud)
    }
}
