package com.nominacopro.domain.calculator

import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.domain.model.DayType
import com.nominacopro.domain.model.HourBreakdown
import com.nominacopro.domain.model.WorkDayEntry
import java.time.LocalDate
import java.time.LocalTime

/**
 * Calcula desglose de horas según CST + Ley 2466/2025.
 * Descuenta 1 h de almuerzo (12:00–13:00) si el turno la cubre.
 */
object HourCalculator {

    private const val LUNCH_START = 12 * 60
    private const val LUNCH_END = 13 * 60
    private const val NIGHT_START = 19 * 60
    private const val NIGHT_END_MIDNIGHT = 24 * 60
    private const val NIGHT_END_MORNING = 6 * 60

    fun calculate(
        entry: WorkDayEntry,
        dailyHours: Int,
        isRestDay: Boolean,
    ): HourBreakdown {
        if (entry.dayType == DayType.FESTIVO_DOMINICAL || entry.dayType == DayType.FESTIVO_NOCTURNO || isRestDay) {
            return calculateRestDay(entry, dailyHours)
        }
        return calculateWeekday(entry, dailyHours)
    }

    private fun calculateWeekday(entry: WorkDayEntry, dailyHours: Int): HourBreakdown {
        val startMin = toMinutes(entry.start)
        var endMin = toMinutes(entry.end)
        if (endMin <= startMin) endMin += 24 * 60

        val lunch = lunchOverlap(startMin, endMin)
        val totalHours = (endMin - startMin - lunch) / 60.0
        val jornada = dailyHours.toDouble()

        val nightHours = nightMinutes(startMin, endMin - lunch) / 60.0
        val dayHours = (totalHours - nightHours).coerceAtLeast(0.0)

        var extraDiurna = (totalHours - jornada).coerceAtLeast(0.0)
        var extraNocturna = 0.0
        var nocturnaOrd = nightHours.coerceAtMost(jornada)
        var normalDiurna = (jornada - nocturnaOrd).coerceAtLeast(0.0)

        if (totalHours > jornada) {
            val over = totalHours - jornada
            extraNocturna = (nightHours - nocturnaOrd).coerceAtMost(over)
            extraDiurna = over - extraNocturna
            normalDiurna = (dayHours - extraDiurna).coerceAtLeast(0.0)
            nocturnaOrd = nightHours - extraNocturna
        } else {
            normalDiurna = dayHours.coerceAtMost(jornada - nocturnaOrd)
        }

        return HourBreakdown(
            normalDiurna = round2(normalDiurna),
            nocturnaOrdinaria = round2(nocturnaOrd),
            extraDiurna = round2(extraDiurna),
            extraNocturna = round2(extraNocturna),
        )
    }

    private fun calculateRestDay(entry: WorkDayEntry, dailyHours: Int): HourBreakdown {
        val startMin = toMinutes(entry.start)
        var endMin = toMinutes(entry.end)
        if (endMin <= startMin) endMin += 24 * 60
        val lunch = lunchOverlap(startMin, endMin)
        val totalHours = (endMin - startMin - lunch) / 60.0
        val nightHours = nightMinutes(startMin, endMin - lunch) / 60.0
        val dayHours = (totalHours - nightHours).coerceAtLeast(0.0)
        val jornada = dailyHours.toDouble()

        val dominicalDiurna = dayHours.coerceAtMost(jornada)
        val dominicalNocturna = nightHours.coerceAtMost(jornada - dominicalDiurna)
        val extraDomDiu = (dayHours - dominicalDiurna).coerceAtLeast(0.0)
        val extraDomNoc = (nightHours - dominicalNocturna).coerceAtLeast(0.0)

        return HourBreakdown(
            dominicalDiurna = round2(dominicalDiurna),
            dominicalNocturna = round2(dominicalNocturna),
            extraDominicalDiurna = round2(extraDomDiu),
            extraDominicalNocturna = round2(extraDomNoc),
        )
    }

    private fun lunchOverlap(start: Int, end: Int): Int {
        val overlapStart = maxOf(start, LUNCH_START)
        val overlapEnd = minOf(end, LUNCH_END)
        return (overlapEnd - overlapStart).coerceAtLeast(0)
    }

    private fun nightMinutes(start: Int, end: Int): Int {
        var total = 0
        val ranges = listOf(
            0 to NIGHT_END_MORNING,
            NIGHT_START to NIGHT_END_MIDNIGHT,
            NIGHT_END_MIDNIGHT to NIGHT_END_MIDNIGHT + NIGHT_END_MORNING,
        )
        for ((a, b) in ranges) {
            val ol = maxOf(start, a)
            val oh = minOf(end, b)
            if (oh > ol) total += oh - ol
        }
        return total
    }

    private fun toMinutes(time: LocalTime): Int = time.hour * 60 + time.minute

    private fun round2(v: Double): Double = kotlin.math.round(v * 100) / 100.0
}
