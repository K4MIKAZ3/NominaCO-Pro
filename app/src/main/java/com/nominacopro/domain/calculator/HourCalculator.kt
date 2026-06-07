package com.nominacopro.domain.calculator

import com.nominacopro.domain.model.DayType
import com.nominacopro.domain.model.HourBreakdown
import com.nominacopro.domain.model.WorkDayEntry
import java.time.LocalTime
import kotlin.math.floorMod
import kotlin.math.min

/**
 * Calcula desglose de horas según CST + Ley 2466/2025.
 * Descuenta 1 h de almuerzo (12:00–13:00) si el turno la cubre.
 * Las horas ordinarias se asignan en orden cronológico; el excedente va a extras.
 */
object HourCalculator {

    private const val LUNCH_START = 12 * 60
    private const val LUNCH_END = 13 * 60
    private const val NIGHT_START = 19 * 60
    private const val NIGHT_END_MORNING = 6 * 60
    private const val MINUTES_PER_DAY = 24 * 60

    fun calculate(
        entry: WorkDayEntry,
        dailyHours: Int,
        isRestDay: Boolean,
    ): HourBreakdown {
        val startMin = toMinutes(entry.start)
        var endMin = toMinutes(entry.end)
        if (endMin <= startMin) endMin += MINUTES_PER_DAY

        val restDay = entry.dayType == DayType.FESTIVO_DOMINICAL ||
            entry.dayType == DayType.FESTIVO_NOCTURNO ||
            isRestDay
        val segments = chronologySegments(startMin, endMin)
        return allocateHours(segments, dailyHours.toDouble(), restDay)
    }

    private fun allocateHours(
        segments: List<Pair<Double, Boolean>>,
        jornada: Double,
        restDay: Boolean,
    ): HourBreakdown {
        var remainingOrdinary = jornada
        var normalDiurna = 0.0
        var nocturnaOrd = 0.0
        var extraDiurna = 0.0
        var extraNocturna = 0.0
        var dominicalDiurna = 0.0
        var dominicalNocturna = 0.0
        var extraDominicalDiurna = 0.0
        var extraDominicalNocturna = 0.0

        for ((hours, isNight) in segments) {
            var left = hours
            val ordinary = min(left, remainingOrdinary.coerceAtLeast(0.0))
            if (ordinary > 0) {
                if (restDay) {
                    if (isNight) dominicalNocturna += ordinary else dominicalDiurna += ordinary
                } else {
                    if (isNight) nocturnaOrd += ordinary else normalDiurna += ordinary
                }
                remainingOrdinary -= ordinary
                left -= ordinary
            }
            if (left > 0) {
                if (restDay) {
                    if (isNight) extraDominicalNocturna += left else extraDominicalDiurna += left
                } else {
                    if (isNight) extraNocturna += left else extraDiurna += left
                }
            }
        }

        return HourBreakdown(
            normalDiurna = round2(normalDiurna),
            nocturnaOrdinaria = round2(nocturnaOrd),
            extraDiurna = round2(extraDiurna),
            extraNocturna = round2(extraNocturna),
            dominicalDiurna = round2(dominicalDiurna),
            dominicalNocturna = round2(dominicalNocturna),
            extraDominicalDiurna = round2(extraDominicalDiurna),
            extraDominicalNocturna = round2(extraDominicalNocturna),
        )
    }

    private fun chronologySegments(startMin: Int, endMin: Int): List<Pair<Double, Boolean>> {
        val result = mutableListOf<Pair<Double, Boolean>>()
        for ((segStart, segEnd) in workedMinuteRanges(startMin, endMin)) {
            val boundaries = mutableSetOf(segStart, segEnd)
            var dayAnchor = (segStart / MINUTES_PER_DAY) * MINUTES_PER_DAY - MINUTES_PER_DAY
            while (dayAnchor <= segEnd) {
                boundaries.add(dayAnchor + NIGHT_END_MORNING)
                boundaries.add(dayAnchor + NIGHT_START)
                boundaries.add(dayAnchor + MINUTES_PER_DAY)
                dayAnchor += MINUTES_PER_DAY
            }
            val sorted = boundaries.filter { it in segStart..segEnd }.sorted()
            for (i in 0 until sorted.size - 1) {
                val from = sorted[i]
                val to = sorted[i + 1]
                if (to > from) {
                    result.add((to - from) / 60.0 to isNightAt(from))
                }
            }
        }
        return result
    }

    private fun workedMinuteRanges(startMin: Int, endMin: Int): List<Pair<Int, Int>> {
        if (endMin <= startMin) return emptyList()
        if (endMin <= LUNCH_START || startMin >= LUNCH_END) {
            return listOf(startMin to endMin)
        }
        val ranges = mutableListOf<Pair<Int, Int>>()
        if (startMin < LUNCH_START) {
            ranges.add(startMin to minOf(LUNCH_START, endMin))
        }
        if (endMin > LUNCH_END) {
            ranges.add(maxOf(LUNCH_END, startMin) to endMin)
        }
        return ranges
    }

    private fun isNightAt(minute: Int): Boolean {
        val m = floorMod(minute, MINUTES_PER_DAY)
        return m < NIGHT_END_MORNING || m >= NIGHT_START
    }

    private fun toMinutes(time: LocalTime): Int = time.hour * 60 + time.minute

    private fun round2(v: Double): Double = kotlin.math.round(v * 100) / 100.0
}
