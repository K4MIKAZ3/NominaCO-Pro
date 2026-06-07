package com.nominacopro.domain.payperiod

import java.time.DayOfWeek
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.TextStyle
import java.util.Locale

enum class PayPeriodType(val label: String) {
    MONTHLY("Mensual"),
    WEEKLY("Semanal"),
    BIWEEKLY("Quincenal"),
    VENTEEN("Ventena (21 días)"),
    ;

    val hasSubPeriods: Boolean get() = this != MONTHLY

    companion object {
        fun fromStored(value: String?): PayPeriodType =
            entries.find { it.name == value } ?: BIWEEKLY
    }
}

data class PayPeriod(
    val start: LocalDate,
    val end: LocalDate,
    val label: String,
    val indexInMonth: Int = 0,
) {
    val dayCount: Int =
        java.time.temporal.ChronoUnit.DAYS.between(start, end).toInt() + 1
}

object PayPeriodCalculator {
    private val locale = Locale("es", "CO")

    fun periodsInMonth(type: PayPeriodType, yearMonth: YearMonth): List<PayPeriod> =
        when (type) {
            PayPeriodType.MONTHLY -> emptyList()
            PayPeriodType.WEEKLY -> weeklyPeriods(yearMonth)
            PayPeriodType.BIWEEKLY -> biweeklyPeriods(yearMonth)
            PayPeriodType.VENTEEN -> venteenPeriods(yearMonth)
        }

    fun defaultPeriodIndex(type: PayPeriodType, yearMonth: YearMonth, today: LocalDate = LocalDate.now()): Int {
        if (!type.hasSubPeriods) return 0
        val periods = periodsInMonth(type, yearMonth)
        if (periods.isEmpty()) return 0
        if (yearMonth != YearMonth.from(today)) return 0
        return periods.indexOfFirst { today in it.start..it.end }.coerceAtLeast(0)
    }

    private fun biweeklyPeriods(ym: YearMonth): List<PayPeriod> {
        val monthLabel = ym.month.getDisplayName(TextStyle.SHORT, locale)
        val lastDay = ym.lengthOfMonth()
        return buildList {
            add(period(ym.atDay(1), ym.atDay(minOf(15, lastDay)), "1–${minOf(15, lastDay)} $monthLabel", 0))
            if (lastDay >= 16) {
                add(period(ym.atDay(16), ym.atEndOfMonth(), "16–$lastDay $monthLabel", 1))
            }
        }
    }

    private fun weeklyPeriods(ym: YearMonth): List<PayPeriod> {
        val monthStart = ym.atDay(1)
        val monthEnd = ym.atEndOfMonth()
        val monthLabel = ym.month.getDisplayName(TextStyle.SHORT, locale)
        var weekStart = monthStart.with(java.time.temporal.TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
        val periods = mutableListOf<PayPeriod>()
        while (weekStart <= monthEnd) {
            val weekEnd = weekStart.plusDays(6)
            val overlapStart = maxOf(weekStart, monthStart)
            val overlapEnd = minOf(weekEnd, monthEnd)
            if (overlapStart <= overlapEnd) {
                periods.add(
                    period(
                        weekStart,
                        weekEnd,
                        "Sem ${periods.size + 1} · ${overlapStart.dayOfMonth}–${overlapEnd.dayOfMonth} $monthLabel",
                        periods.size,
                    ),
                )
            }
            weekStart = weekStart.plusWeeks(1)
        }
        return periods
    }

    private fun venteenPeriods(ym: YearMonth): List<PayPeriod> {
        val monthStart = ym.atDay(1)
        val monthEnd = ym.atEndOfMonth()
        val monthLabel = ym.month.getDisplayName(TextStyle.SHORT, locale)
        var periodStart = LocalDate.of(ym.year, 1, 1)
        val periods = mutableListOf<PayPeriod>()
        var ventenaIndex = 1
        while (periodStart <= monthEnd && periodStart.year == ym.year) {
            val periodEnd = periodStart.plusDays(20)
            if (periodEnd >= monthStart && periodStart <= monthEnd) {
                val overlapStart = maxOf(periodStart, monthStart)
                val overlapEnd = minOf(periodEnd, monthEnd)
                periods.add(
                    period(
                        periodStart,
                        periodEnd,
                        "Ventena $ventenaIndex · ${overlapStart.dayOfMonth}–${overlapEnd.dayOfMonth} $monthLabel",
                        periods.size,
                    ),
                )
                ventenaIndex++
            }
            periodStart = periodStart.plusDays(21)
        }
        return periods
    }

    private fun period(start: LocalDate, end: LocalDate, label: String, index: Int) =
        PayPeriod(start = start, end = end, label = label, indexInMonth = index)
}
