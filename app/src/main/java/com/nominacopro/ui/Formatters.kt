package com.nominacopro.ui

import java.text.NumberFormat
import java.time.Month
import java.time.format.TextStyle
import java.util.Locale

object Formatters {
    private val cop = NumberFormat.getCurrencyInstance(Locale("es", "CO"))
    private val es = Locale("es", "CO")

    fun money(value: Long): String = cop.format(value)

    fun monthName(month: Int): String =
        Month.of(month).getDisplayName(TextStyle.FULL, es).replaceFirstChar { it.titlecase(es) }
}
