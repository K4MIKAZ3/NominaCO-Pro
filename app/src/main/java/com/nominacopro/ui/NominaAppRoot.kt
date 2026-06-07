package com.nominacopro.ui

import android.Manifest
import android.content.Intent
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import com.nominacopro.NominaApp
import com.nominacopro.data.auth.AuthUiState
import com.nominacopro.domain.model.AppPreferences
import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.notifications.ReminderScheduler
import com.nominacopro.ui.auth.AuthViewModel
import com.nominacopro.ui.auth.BiometricGate
import com.nominacopro.ui.auth.promptLocalBiometric
import com.nominacopro.ui.navigation.NominaTab
import com.nominacopro.ui.screens.CalendarScreen
import com.nominacopro.ui.screens.DayEditorDialog
import com.nominacopro.ui.screens.LoginScreen
import com.nominacopro.domain.model.PayrollEntryType
import com.nominacopro.domain.payperiod.PayPeriodType
import com.nominacopro.ui.screens.PayrollEntryDialog
import com.nominacopro.ui.screens.PayrollScreen
import com.nominacopro.ui.screens.ProfileScreen
import com.nominacopro.ui.screens.RegisterScreen
import com.nominacopro.ui.screens.SettingsScreen
import com.nominacopro.ui.theme.NominaTheme
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.first
import java.io.File
import java.time.LocalDate
import java.time.LocalTime

@Composable
fun NominaAppRoot(app: NominaApp) {
    val preferences by app.repository.observePreferences()
        .collectAsState(initial = AppPreferences())
    val authVm: AuthViewModel = viewModel(factory = AuthViewModel.Factory(app.authRepository))
    val authState by authVm.authState.collectAsState()
    var showRegister by rememberSaveable { mutableStateOf(false) }
    var localBypass by rememberSaveable { mutableStateOf(false) }
    var authBusy by remember { mutableStateOf(false) }
    var authMessage by remember { mutableStateOf<String?>(null) }
    var authIsError by remember { mutableStateOf(true) }

    NominaTheme(darkTheme = preferences.darkModeEnabled) {
        when {
            authState is AuthUiState.NotConfigured || localBypass -> {
                MainNominaScaffold(
                    app = app,
                    accountEmail = null,
                    onSignOut = null,
                )
            }
            authState is AuthUiState.Loading -> {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            }
            authState is AuthUiState.Authenticated -> {
                val user = authState as AuthUiState.Authenticated
                LaunchedEffect(user.userId) {
                    app.repository.cloudSync.setActiveUser(user.userId)
                    app.repository.cloudSync.onUserAuthenticated(user.userId)
                    val prefs = app.repository.preferencesStore.observe().first()
                    if (prefs.reminderEnabled) {
                        ReminderScheduler.schedule(app, prefs.reminderHour, prefs.reminderMinute)
                    } else {
                        ReminderScheduler.cancel(app)
                    }
                }
                MainNominaScaffold(
                    app = app,
                    accountEmail = user.email,
                    accountUserId = user.userId,
                    onSignOut = {
                        app.repository.cloudSync.setActiveUser(null)
                        authVm.signOut()
                    },
                )
            }
            else -> {
                if (showRegister) {
                    RegisterScreen(
                        isLoading = authBusy,
                        message = authMessage,
                        isError = authIsError,
                        onRegister = { email, password, confirm ->
                            if (password != confirm) {
                                authMessage = "Las contraseñas no coinciden"
                                authIsError = true
                                return@RegisterScreen
                            }
                            authBusy = true
                            authMessage = null
                            authVm.signUp(email, password) { ok, msg ->
                                authBusy = false
                                authMessage = msg
                                authIsError = !ok
                                if (ok) showRegister = false
                            }
                        },
                        onBackToLogin = {
                            showRegister = false
                            authMessage = null
                        },
                    )
                } else {
                    val errorFromState = (authState as? AuthUiState.Error)?.message
                    LoginScreen(
                        isLoading = authBusy || authState is AuthUiState.Loading,
                        errorMessage = authMessage ?: errorFromState,
                        showLocalFallback = false,
                        onLogin = { email, password ->
                            authBusy = true
                            authMessage = null
                            authVm.signIn(email, password) { ok, msg ->
                                authBusy = false
                                if (!ok) {
                                    authMessage = msg
                                    authIsError = true
                                }
                            }
                        },
                        onGoToRegister = {
                            showRegister = true
                            authMessage = null
                        },
                        onContinueLocal = { localBypass = true },
                        onForgotPassword = { email, onResult ->
                            authVm.resetPassword(email, onResult)
                        },
                    )
                }
            }
        }
    }
}

@Composable
private fun MainNominaScaffold(
    app: NominaApp,
    accountEmail: String?,
    accountUserId: String? = null,
    onSignOut: (() -> Unit)?,
) {
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
    val periodSummary by vm.periodSummary.collectAsState()
    val payPeriods by vm.payPeriods.collectAsState()
    val showPayrollSubPeriods by vm.showPayrollSubPeriods.collectAsState()
    val selectedPeriodIndex by vm.selectedPeriodIndex.collectAsState()
    val periodManualEntries by vm.periodManualEntries.collectAsState()
    val periodWorkDays by vm.periodWorkDays.collectAsState()
    val yearSettlement by vm.yearSettlement.collectAsState()
    val preferences by vm.preferences.collectAsState()
    val dashboard by vm.dashboard.collectAsState()
    val syncState by vm.syncState.collectAsState()

    var tab by remember { mutableStateOf(NominaTab.Calendar) }
    var selectedDay by remember { mutableStateOf<LocalDate?>(null) }
    var showDeductionDialog by remember { mutableStateOf(false) }
    var showAdvanceDialog by remember { mutableStateOf(false) }
    var showBonusDialog by remember { mutableStateOf(false) }

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

    BiometricGate(enabled = preferences.biometricEnabled) {
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
            NominaTab.Payroll -> {
                val payPeriodType = profile?.payPeriodType ?: PayPeriodType.MONTHLY
                key(payPeriodType) {
                    PayrollScreen(
                        payroll = payroll,
                        periodSummary = if (showPayrollSubPeriods) periodSummary else null,
                        payPeriodType = payPeriodType,
                        payPeriods = if (showPayrollSubPeriods) payPeriods else emptyList(),
                        selectedPeriodIndex = selectedPeriodIndex,
                        onSelectPeriod = vm::selectPayPeriod,
                        periodManualEntries = if (showPayrollSubPeriods) periodManualEntries else emptyList(),
                        workDays = workDaysList,
                        periodWorkDays = if (showPayrollSubPeriods) periodWorkDays else emptyList(),
                        manualDeductions = manualDeductions,
                        yearSettlement = yearSettlement,
                        pendingVacationDays = profile?.pendingVacationDays ?: 0,
                        onPendingVacationDaysChange = vm::updatePendingVacationDays,
                        use24Hour = preferences.use24HourFormat,
                        profileMissing = profile == null,
                        onAddDeduction = { showDeductionDialog = true },
                        onAddAdvance = { showAdvanceDialog = true },
                        onAddBonus = { showBonusDialog = true },
                        onRemoveManualEntry = vm::removeManualDeduction,
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
                }
            }
            NominaTab.Profile -> ProfileScreen(
                profile = profile,
                onSave = vm::saveProfile,
                modifier = Modifier.padding(padding),
            )
            NominaTab.Settings -> SettingsScreen(
                preferences = preferences,
                manualHolidays = manual,
                accountEmail = accountEmail,
                syncState = syncState,
                onSyncNow = accountUserId?.let { userId ->
                    {
                        vm.syncNow(userId) { error ->
                            scope.launch {
                                snackbar.showSnackbar(
                                    error ?: "Sincronización completada",
                                )
                            }
                        }
                    }
                },
                onSavePreferences = vm::savePreferences,
                onRemoveHoliday = vm::removeManualHoliday,
                onRequestNotificationPermission = ::requestNotificationPermission,
                onRequestBiometricEnable = { onSuccess ->
                    promptLocalBiometric(context, onSuccess)
                },
                onSignOut = onSignOut,
                modifier = Modifier.padding(padding),
            )
        }
    }
    }

    selectedDay?.let { date ->
        DayEditorDialog(
            date = date,
            existingEntry = workDays[date],
            defaultStart = LocalTime.of(preferences.defaultStartHour, preferences.defaultStartMinute),
            defaultEnd = LocalTime.of(preferences.defaultEndHour, preferences.defaultEndMinute),
            dailyHours = profile?.dailyHours ?: 8,
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
        PayrollEntryDialog(
            entryType = PayrollEntryType.DEDUCTION,
            onDismiss = { showDeductionDialog = false },
            onSave = { label, amount ->
                vm.addManualDeduction(label, amount)
                showDeductionDialog = false
            },
        )
    }

    if (showAdvanceDialog) {
        PayrollEntryDialog(
            entryType = PayrollEntryType.ADVANCE,
            onDismiss = { showAdvanceDialog = false },
            onSave = { label, amount ->
                vm.addAdvance(label, amount)
                showAdvanceDialog = false
            },
        )
    }

    if (showBonusDialog) {
        PayrollEntryDialog(
            entryType = PayrollEntryType.BONUS,
            onDismiss = { showBonusDialog = false },
            onSave = { label, amount ->
                vm.addBonus(label, amount)
                showBonusDialog = false
            },
        )
    }
}
