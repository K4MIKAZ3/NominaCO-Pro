package com.nominacopro.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val Bg = Color(0xFF0D0F14)
private val Surface = Color(0xFF151820)
private val Accent = Color(0xFF4ADE80)
private val Accent2 = Color(0xFF22D3EE)
private val Accent3 = Color(0xFFF59E0B)

private val DarkColors = darkColorScheme(
    primary = Accent,
    secondary = Accent2,
    tertiary = Accent3,
    background = Bg,
    surface = Surface,
    onBackground = Color(0xFFE8EAF0),
    onSurface = Color(0xFFE8EAF0),
)

@Composable
fun NominaTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColors,
        content = content,
    )
}
