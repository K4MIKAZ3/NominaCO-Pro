package com.nominacopro.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Settings
import androidx.compose.ui.graphics.vector.ImageVector

enum class NominaTab(val route: String, val label: String, val icon: ImageVector) {
    Calendar("calendar", "Calendario", Icons.Default.CalendarMonth),
    Payroll("payroll", "Nómina", Icons.Default.AccountBalance),
    Profile("profile", "Perfil", Icons.Default.Person),
    Settings("settings", "Ajustes", Icons.Default.Settings),
}
