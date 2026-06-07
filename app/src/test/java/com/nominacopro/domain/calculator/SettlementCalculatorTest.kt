package com.nominacopro.domain.calculator

import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.domain.model.EmployeeProfile
import com.nominacopro.domain.model.WorkDayEntry
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate
import java.time.LocalTime

class SettlementCalculatorTest {

    private val profile = EmployeeProfile(
        name = "Test",
        documentId = "1",
        jobTitle = "Op",
        monthlySalary = 3_600_000,
        dailyHours = 8,
    )

    @Test
    fun prima_firstSemester_scalesWithWorkedDays() {
        val entries = (1..30).map { day ->
            WorkDayEntry(
                LocalDate.of(2026, 1, day.coerceAtMost(31)),
                LocalTime.of(8, 0),
                LocalTime.of(16, 0),
            )
        }.filter { it.date.monthValue == 1 }

        val report = SettlementCalculator.calculate(
            profile = profile,
            year = 2026,
            entries = entries,
            manualHolidays = emptySet(),
            asOf = LocalDate.of(2026, 6, 30),
        )

        assertTrue(report.firstSemester.primaAmount > 0)
        val expectedBase = profile.monthlySalary + ColombiaLaborLaw2026.SUBSIDIO_TRANSPORTE
        val days = report.firstSemester.totalDays
        val expected = (expectedBase * days / ColombiaLaborLaw2026.DIAS_ANIO_PRESTACIONES).toLong()
        assertTrue(kotlin.math.abs(report.firstSemester.primaAmount - expected) <= 1)
    }
}
