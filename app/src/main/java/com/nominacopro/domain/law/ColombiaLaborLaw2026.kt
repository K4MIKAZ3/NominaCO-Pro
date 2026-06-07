package com.nominacopro.domain.law

import java.time.LocalDate

/**
 * Parámetros legales Colombia — vigencia 2026.
 * Fuentes: Ley 2466/2025, Ley 2101/2021, Decreto SMMLV 2026.
 */
object ColombiaLaborLaw2026 {

    const val SMMLV = 1_750_905L
    const val SUBSIDIO_TRANSPORTE = 249_095L
    const val UVT = 52_374L
    const val TOPE_SUBSIDIO_TRANSPORTE = SMMLV * 2
    const val DESCUENTO_SALUD = 0.04
    const val DESCUENTO_PENSION = 0.04
    const val DIAS_MES_REFERENCIA = 30

    /** Jornada máxima semanal: 44 h hasta 14-jul-2026, luego 42 h (Ley 2101). */
    fun weeklyHoursLimit(date: LocalDate): Int =
        if (date.isBefore(LocalDate.of(2026, 7, 15))) 44 else 42

    /** Recargo dominical/festivo progresivo — Ley 2466 art. 14. */
    fun dominicalFactor(date: LocalDate): Double = when {
        date.isBefore(LocalDate.of(2025, 7, 1)) -> 1.75
        date.isBefore(LocalDate.of(2026, 7, 1)) -> 1.80  // +80%
        date.isBefore(LocalDate.of(2027, 7, 1)) -> 1.90  // +90%
        else -> 2.00  // +100%
    }

    /** Recargos como multiplicadores sobre hora ordinaria. */
    object Factors {
        const val NORMAL = 1.0
        const val NOCTURNA = 1.35           // +35%, 19:00–06:00 (Ley 2466)
        const val EXTRA_DIURNA = 1.25       // +25%
        const val EXTRA_NOCTURNA = 1.75     // +75%
    }

    fun extraDominicalDiurnaFactor(date: LocalDate): Double =
        Factors.EXTRA_DIURNA + (dominicalFactor(date) - 1.0)

    fun extraDominicalNocturnaFactor(date: LocalDate): Double =
        Factors.EXTRA_NOCTURNA + (dominicalFactor(date) - 1.0)

    /** Festivos oficiales Colombia 2026 (calendario Ley Emiliana / decreto). */
    val OFFICIAL_HOLIDAYS_2026: Set<LocalDate> = setOf(
        LocalDate.of(2026, 1, 1),
        LocalDate.of(2026, 1, 12),
        LocalDate.of(2026, 3, 23),
        LocalDate.of(2026, 4, 2),
        LocalDate.of(2026, 4, 3),
        LocalDate.of(2026, 5, 1),
        LocalDate.of(2026, 5, 18),
        LocalDate.of(2026, 6, 8),
        LocalDate.of(2026, 6, 15),
        LocalDate.of(2026, 6, 29),
        LocalDate.of(2026, 7, 20),
        LocalDate.of(2026, 8, 7),
        LocalDate.of(2026, 8, 17),
        LocalDate.of(2026, 10, 12),
        LocalDate.of(2026, 11, 2),
        LocalDate.of(2026, 11, 16),
        LocalDate.of(2026, 12, 8),
        LocalDate.of(2026, 12, 25),
    )

    fun isOfficialHoliday(date: LocalDate): Boolean =
        OFFICIAL_HOLIDAYS_2026.contains(date)

    fun isSunday(date: LocalDate): Boolean =
        date.dayOfWeek.value == 7

    fun isRestDay(date: LocalDate, manualHolidays: Set<LocalDate>): Boolean =
        isSunday(date) || isOfficialHoliday(date) || manualHolidays.contains(date)

    /** Valor día = salario mensual ÷ 30 (días mes referencia). */
    fun dailyRate(monthlySalary: Long): Double =
        monthlySalary.toDouble() / DIAS_MES_REFERENCIA

    /** Valor hora = valor día ÷ horas de jornada diaria. */
    fun hourlyRate(monthlySalary: Long, dailyHours: Int): Double =
        dailyRate(monthlySalary) / dailyHours

    /** Salario base = valor día × días efectivamente laborados. */
    fun proportionalBaseSalary(monthlySalary: Long, workedDays: Int): Long {
        if (workedDays <= 0) return 0L
        return (dailyRate(monthlySalary) * workedDays).toLong().coerceAtMost(monthlySalary)
    }

    /** Auxilio transporte proporcional: auxilio mensual ÷ 30 × días laborados. */
    fun transportSubsidyForDays(workedDays: Int): Long {
        if (workedDays <= 0) return 0L
        return (SUBSIDIO_TRANSPORTE.toDouble() * workedDays / DIAS_MES_REFERENCIA).toLong()
    }

    fun qualifiesTransport(salary: Long): Boolean = salary <= TOPE_SUBSIDIO_TRANSPORTE
}
