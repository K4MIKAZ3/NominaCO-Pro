package com.nominacopro.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val Bg = NominaDesign.Bg
private val Surface = NominaDesign.Surface
private val Accent = NominaDesign.Green
private val Accent2 = NominaDesign.Cyan
private val Accent3 = NominaDesign.Amber

private val DarkColors = darkColorScheme(
    primary = Accent,
    secondary = Accent2,
    tertiary = Accent3,
    background = Bg,
    surface = Surface,
    surfaceVariant = NominaDesign.SurfaceElevated,
    onBackground = NominaDesign.TextPrimary,
    onSurface = NominaDesign.TextPrimary,
    outline = Color(0xFF2A3142),
)

private val LightColors = lightColorScheme(
    primary = Color(0xFF15803D),
    secondary = Color(0xFF0891B2),
    tertiary = Color(0xFFD97706),
    background = Color(0xFFF4F6FA),
    surface = Color(0xFFFFFFFF),
    onBackground = Color(0xFF1A1D24),
    onSurface = Color(0xFF1A1D24),
)

private val NominaShapes = Shapes(
    extraSmall = RoundedCornerShape(8.dp),
    small = RoundedCornerShape(12.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(20.dp),
    extraLarge = RoundedCornerShape(24.dp),
)

private val NominaTypography = Typography(
    headlineLarge = TextStyle(fontWeight = FontWeight.Bold, fontSize = 28.sp),
    headlineMedium = TextStyle(fontWeight = FontWeight.Bold, fontSize = 24.sp),
    titleLarge = TextStyle(fontWeight = FontWeight.Bold, fontSize = 20.sp),
    titleMedium = TextStyle(fontWeight = FontWeight.SemiBold, fontSize = 16.sp),
)

@Composable
fun NominaTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        shapes = NominaShapes,
        typography = NominaTypography,
        content = content,
    )
}
