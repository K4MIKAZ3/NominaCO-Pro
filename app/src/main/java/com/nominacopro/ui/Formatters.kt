package com.nominacopro.ui

import java.text.NumberFormat
import java.time.LocalDate
import java.time.LocalTime
import java.time.Month
import java.time.format.DateTimeFormatter
import java.time.format.TextStyle
import java.util.Locale

object Formatters {
    val locale: Locale = Locale("es", "CO")
    private val cop = NumberFormat.getCurrencyInstance(locale)

    fun money(value: Long): String = cop.format(value)

    fun monthName(month: Int): String =
        Month.of(month).getDisplayName(TextStyle.SHORT, locale).replaceFirstChar { it.titlecase(locale) }

    fun monthNameFull(month: Int): String =
        Month.of(month).getDisplayName(TextStyle.FULL, locale).replaceFirstChar { it.titlecase(locale) }

    fun formatTime(time: LocalTime, use24Hour: Boolean): String {
        val pattern = if (use24Hour) "HH:mm" else "h:mm a"
        return time.format(DateTimeFormatter.ofPattern(pattern, locale))
    }

    fun hours(value: Double): String =
        if (value % 1.0 == 0.0) value.toInt().toString() else String.format(locale, "%.1f", value)

    fun shortDate(date: LocalDate): String =
        date.format(DateTimeFormatter.ofPattern("d MMM", locale))
}
