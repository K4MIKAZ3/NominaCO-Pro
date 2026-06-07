package com.nominacopro.ui

import android.Manifest
import android.content.Intent
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import com.nominacopro.NominaApp
import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.ui.navigation.NominaTab
import com.nominacopro.ui.screens.CalendarScreen
import com.nominacopro.ui.screens.DayEditorDialog
import com.nominacopro.ui.screens.ManualDeductionDialog
import com.nominacopro.ui.screens.PayrollScreen
import com.nominacopro.ui.screens.ProfileScreen
import com.nominacopro.ui.screens.SettingsScreen
import com.nominacopro.ui.theme.NominaTheme
import kotlinx.coroutines.launch
import java.io.File
import java.time.LocalDate
import java.time.LocalTime

@Composable
fun NominaAppRoot(app: NominaApp) {
    val vm: MainViewModel = viewModel(factory = MainViewModel.Factory(app.repository, app))
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val snackbar = remember { SnackbarHostState() }

    val yearMonth by vm.yearMonth.collectAsState()
    val profile by vm.profile.collectAsState()
    val payroll by vm.payroll.collectAsState()
    val marks by vm.calendarMarks.collectAsState()
    val manual by vm.manualHolidays.collectAsState()
    val workDays by vm.workDaysByDate.collectAsState()
    val workDaysList by vm.workDaysList.collectAsState()
    val manualDeductions by vm.manualDeductions.collectAsState()
    val preferences by vm.preferences.collectAsState()
    val dashboard by vm.dashboard.collectAsState()

    var tab by remember { mutableStateOf(NominaTab.Calendar) }
    var selectedDay by remember { mutableStateOf<LocalDate?>(null) }
    var showDeductionDialog by remember { mutableStateOf(false) }

    val notificationPermission = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) { granted ->
        if (!granted) {
            scope.launch { snackbar.showSnackbar("Activa notificaciones para recibir el recordatorio.") }
            vm.updatePreferences { it.copy(reminderEnabled = false) }
        }
    }

    fun requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            notificationPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    fun sharePdf(file: File) {
        context.startActivity(Intent.createChooser(vm.sharePdf(file), "Compartir PDF"))
    }

    NominaTheme {
        Scaffold(
            snackbarHost = { SnackbarHost(snackbar) },
            bottomBar = {
                NavigationBar {
                    NominaTab.entries.forEach { item ->
                        NavigationBarItem(
                            selected = tab == item,
                            onClick = { tab = item },
                            icon = { Icon(item.icon, contentDescription = item.label) },
                            label = { Text(item.label) },
                        )
                    }
                }
            },
        ) { padding ->
            when (tab) {
                NominaTab.Calendar -> CalendarScreen(
                    dashboard = dashboard,
                    yearMonth = yearMonth,
                    marks = marks,
                    payroll = payroll,
                    onPrev = vm::prevMonth,
                    onNext = vm::nextMonth,
                    onToday = vm::goToday,
                    onDayClick = { selectedDay = it },
                    modifier = Modifier.padding(padding),
                )
                NominaTab.Payroll -> PayrollScreen(
                    payroll = payroll,
                    workDays = workDaysList,
                    manualDeductions = manualDeductions,
                    use24Hour = preferences.use24HourFormat,
                    profileMissing = profile == null,
                    onAddDeduction = { showDeductionDialog = true },
                    onRemoveDeduction = vm::removeManualDeduction,
                    onExportPayrollPdf = {
                        vm.exportPayrollPdf { file ->
                            sharePdf(file)
                            scope.launch { snackbar.showSnackbar("PDF de nómina generado") }
                        }
                    },
                    onExportWorkDaysPdf = {
                        vm.exportWorkDaysPdf { file ->
                            sharePdf(file)
                            scope.launch { snackbar.showSnackbar("PDF de días laborados generado") }
                        }
                    },
                    modifier = Modifier.padding(padding),
                )
                NominaTab.Profile -> ProfileScreen(
                    profile = profile,
                    onSave = vm::saveProfile,
                    modifier = Modifier.padding(padding),
                )
                NominaTab.Settings -> SettingsScreen(
                    preferences = preferences,
                    manualHolidays = manual,
                    onSavePreferences = vm::updatePreferences,
                    onRemoveHoliday = vm::removeManualHoliday,
                    onRequestNotificationPermission = ::requestNotificationPermission,
                    modifier = Modifier.padding(padding),
                )
            }
        }

        selectedDay?.let { date ->
            DayEditorDialog(
                date = date,
                existingEntry = workDays[date],
                defaultStart = LocalTime.of(preferences.defaultStartHour, preferences.defaultStartMinute),
                defaultEnd = LocalTime.of(preferences.defaultEndHour, preferences.defaultEndMinute),
                use24Hour = preferences.use24HourFormat,
                isManualHoliday = manual.contains(date),
                isOfficialHoliday = ColombiaLaborLaw2026.isOfficialHoliday(date),
                onDismiss = { selectedDay = null },
                onSave = { start, end, type, notes, manualFlag ->
                    vm.saveWorkDay(date, start, end, type, notes, manualFlag)
                    selectedDay = null
                },
                onDelete = {
                    vm.deleteWorkDay(date)
                    selectedDay = null
                },
            )
        }

        if (showDeductionDialog) {
            ManualDeductionDialog(
                onDismiss = { showDeductionDialog = false },
                onSave = { label, amount ->
                    vm.addManualDeduction(label, amount)
                    showDeductionDialog = false
                },
            )
        }
    }
}
