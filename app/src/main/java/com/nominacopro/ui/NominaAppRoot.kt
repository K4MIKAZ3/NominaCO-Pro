package com.nominacopro.ui

import android.Manifest
import android.content.Intent
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.TextButton
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.viewmodel.compose.viewModel
import com.nominacopro.NominaApp
import com.nominacopro.data.auth.AuthUiState
import com.nominacopro.data.auth.SupabaseProvider
import com.nominacopro.data.sync.BackupActivationStrategy
import com.nominacopro.data.update.ApkInstaller
import com.nominacopro.domain.auth.PasswordRules
import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.domain.model.AppPreferences
import com.nominacopro.domain.model.PayrollEntryType
import com.nominacopro.domain.payperiod.PayPeriodType
import com.nominacopro.notifications.ReminderScheduler
import com.nominacopro.ui.auth.AuthViewModel
import com.nominacopro.ui.auth.BiometricGate
import com.nominacopro.ui.auth.promptLocalBiometric
import com.nominacopro.ui.components.BackupActivationDialog
import com.nominacopro.ui.components.InstallPermissionDialog
import com.nominacopro.ui.components.NominaBottomBar
import com.nominacopro.ui.components.UpdateAvailableDialog
import com.nominacopro.ui.navigation.NominaTab
import com.nominacopro.ui.screens.CalendarScreen
import com.nominacopro.ui.screens.DayEditorDialog
import com.nominacopro.ui.screens.ExpenseEntryDialog
import com.nominacopro.ui.screens.ExpensesScreen
import com.nominacopro.ui.screens.LoginScreen
import com.nominacopro.ui.screens.PayrollEntryDialog
import com.nominacopro.ui.screens.PayrollScreen
import com.nominacopro.ui.screens.ProfileScreen
import com.nominacopro.ui.screens.RegisterScreen
import com.nominacopro.ui.screens.SettingsScreen
import com.nominacopro.ui.theme.NominaTheme
import com.nominacopro.util.NetworkMonitor
import android.widget.Toast
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import java.io.File
import java.time.LocalDate
import java.time.LocalTime
import java.time.YearMonth

private enum class AuthOverlay {
    None,
    Login,
    Register,
}

private data class AccountInfo(
    val email: String,
    val userId: String,
    val isOffline: Boolean,
)

private fun canUseMainApp(authState: AuthUiState, offlineModeEnabled: Boolean): Boolean =
    when (authState) {
        is AuthUiState.NotConfigured,
        is AuthUiState.Authenticated,
        is AuthUiState.OfflineCached,
        -> true
        else -> offlineModeEnabled
    }

@Composable
fun NominaAppRoot(app: NominaApp) {
    val context = LocalContext.current
    val preferences by app.repository.observePreferences()
        .collectAsState(initial = AppPreferences())
    val authVm: AuthViewModel = viewModel(factory = AuthViewModel.Factory(app.authRepository))
    val vm: MainViewModel = viewModel(factory = MainViewModel.Factory(app.repository, app))
    val appUpdate by vm.appUpdate.collectAsState()
    val authState by authVm.authState.collectAsState()
    val rootScope = rememberCoroutineScope()
    val lifecycleOwner = LocalLifecycleOwner.current

    var authOverlay by rememberSaveable { mutableStateOf(AuthOverlay.None) }
    var showStartupRegister by rememberSaveable { mutableStateOf(false) }
    var authBusy by remember { mutableStateOf(false) }
    var authMessage by remember { mutableStateOf<String?>(null) }
    var authIsError by remember { mutableStateOf(true) }

    var backupPromptUserId by remember { mutableStateOf<String?>(null) }
    var backupHasRemote by remember { mutableStateOf(false) }
    var backupBusy by remember { mutableStateOf(false) }

    var manualUpdateCheckBusy by remember { mutableStateOf(false) }

    DisposableEffect(lifecycleOwner, vm) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
                vm.resumePendingApkInstall()
                vm.checkForUpdates()
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    val accountInfo = when (val state = authState) {
        is AuthUiState.Authenticated -> AccountInfo(state.email, state.userId, isOffline = false)
        is AuthUiState.OfflineCached -> AccountInfo(state.email, state.userId, isOffline = true)
        else -> null
    }

    LaunchedEffect(accountInfo?.userId, preferences.cloudBackupEnabled) {
        accountInfo?.userId?.let { userId ->
            app.repository.cloudSync.setActiveUser(userId)
            app.repository.cloudSync.setAutoSyncEnabled(preferences.cloudBackupEnabled)
        } ?: app.repository.cloudSync.setActiveUser(null)
    }

    LaunchedEffect(accountInfo?.userId) {
        accountInfo?.userId?.let {
            val prefs = app.repository.preferencesStore.observe().first()
            if (prefs.reminderEnabled) {
                ReminderScheduler.schedule(app, prefs.reminderHour, prefs.reminderMinute)
            } else {
                ReminderScheduler.cancel(app)
            }
        }
    }

    fun finishBackupActivation(userId: String, strategy: BackupActivationStrategy) {
        backupBusy = true
        rootScope.launch {
            try {
                app.repository.cloudSync.activateBackup(userId, strategy)
                app.repository.preferencesStore.update { it.copy(cloudBackupEnabled = true) }
                backupPromptUserId = null
            } catch (_: Exception) {
                // SyncUiState already shows the error in Settings.
            } finally {
                backupBusy = false
            }
        }
    }

    fun enterOfflineMode() {
        rootScope.launch {
            app.repository.preferencesStore.update { it.copy(offlineModeEnabled = true) }
        }
    }

    fun onAuthSuccess() {
        authOverlay = AuthOverlay.None
        showStartupRegister = false
        authMessage = null
        rootScope.launch {
            app.repository.preferencesStore.update { it.copy(offlineModeEnabled = false) }
            val prefs = app.repository.preferencesStore.observe().first()
            val userId = app.authRepository.cachedAccount()?.userId ?: return@launch
            if (prefs.cloudBackupEnabled) return@launch
            backupHasRemote = app.repository.cloudSync.remoteBackupExists(userId)
            backupPromptUserId = userId
        }
    }

    NominaTheme(darkTheme = preferences.darkModeEnabled) {
        val inMainApp = authState !is AuthUiState.Loading &&
            canUseMainApp(authState, preferences.offlineModeEnabled)

        SideEffect { vm.setMainAppActive(inMainApp) }

        when {
            authState is AuthUiState.Loading -> {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            }
            !inMainApp && showStartupRegister -> {
                RegisterScreen(
                    isLoading = authBusy,
                    message = authMessage,
                    isError = authIsError,
                    showOfflineButton = SupabaseProvider.isConfigured,
                    onRegister = { email, password, confirm ->
                        PasswordRules.validate(password)?.let { validationError ->
                            authMessage = validationError
                            authIsError = true
                            return@RegisterScreen
                        }
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
                            if (ok) onAuthSuccess()
                        }
                    },
                    onBackToLogin = {
                        showStartupRegister = false
                        authMessage = null
                    },
                    onContinueOffline = ::enterOfflineMode,
                )
            }
            !inMainApp -> {
                LoginScreen(
                    isLoading = authBusy,
                    errorMessage = authMessage,
                    showOfflineButton = SupabaseProvider.isConfigured,
                    onLogin = { email, password ->
                        authBusy = true
                        authMessage = null
                        authVm.signIn(email, password) { ok, msg ->
                            authBusy = false
                            if (ok) {
                                onAuthSuccess()
                            } else {
                                authMessage = msg
                                authIsError = true
                            }
                        }
                    },
                    onGoToRegister = {
                        showStartupRegister = true
                        authMessage = null
                    },
                    onContinueOffline = ::enterOfflineMode,
                    onRequestPasswordReset = { email, onResult ->
                        authVm.requestPasswordReset(email, onResult)
                    },
                )
            }
            else -> {
                MainNominaScaffold(
                    app = app,
                    vm = vm,
                    accountEmail = accountInfo?.email,
                    accountUserId = accountInfo?.userId,
                    isOfflineAccount = accountInfo?.isOffline == true,
                    authConfigured = SupabaseProvider.isConfigured,
                    cloudBackupEnabled = preferences.cloudBackupEnabled,
                    manualUpdateCheckBusy = manualUpdateCheckBusy,
                    onOpenLogin = { authOverlay = AuthOverlay.Login },
                    onOpenRegister = { authOverlay = AuthOverlay.Register },
                    onSignOut = accountInfo?.let {
                        {
                            app.repository.cloudSync.setActiveUser(null)
                            rootScope.launch {
                                app.repository.preferencesStore.update { prefs ->
                                    prefs.copy(
                                        cloudBackupEnabled = false,
                                        offlineModeEnabled = false,
                                    )
                                }
                            }
                            authVm.signOut()
                        }
                    },
                    onDeleteAccount = accountInfo?.let {
                        { _, onResult ->
                            authVm.deleteAccount { ok, msg ->
                                if (ok) {
                                    rootScope.launch {
                                        app.repository.cloudSync.clearLocalUserData()
                                        app.repository.preferencesStore.update { prefs ->
                                            prefs.copy(cloudBackupEnabled = false)
                                        }
                                    }
                                }
                                onResult(ok, msg)
                            }
                        }
                    },
                    onCheckForUpdate = {
                        if (manualUpdateCheckBusy) return@MainNominaScaffold
                        manualUpdateCheckBusy = true
                        vm.checkForUpdates(force = true) { update ->
                            manualUpdateCheckBusy = false
                            if (!NetworkMonitor.isOnline(context)) {
                                Toast.makeText(
                                    context,
                                    "Sin conexión. Conéctate para buscar actualizaciones.",
                                    Toast.LENGTH_SHORT,
                                ).show()
                            } else {
                                Toast.makeText(
                                    context,
                                    if (update != null) {
                                        "Nueva versión ${update.versionName} disponible."
                                    } else {
                                        "Ya tienes la última versión instalada."
                                    },
                                    Toast.LENGTH_SHORT,
                                ).show()
                            }
                        }
                    },
                )
            }
        }

        if (inMainApp && authOverlay == AuthOverlay.Login) {
            InAppAuthOverlay(onClose = { authOverlay = AuthOverlay.None }) {
                LoginScreen(
                isLoading = authBusy,
                errorMessage = authMessage,
                showOfflineButton = false,
                onLogin = { email, password ->
                    authBusy = true
                    authMessage = null
                    authVm.signIn(email, password) { ok, msg ->
                        authBusy = false
                        if (ok) {
                            onAuthSuccess()
                        } else {
                            authMessage = msg
                            authIsError = true
                        }
                    }
                },
                onGoToRegister = {
                    authOverlay = AuthOverlay.Register
                    authMessage = null
                },
                onContinueOffline = { authOverlay = AuthOverlay.None },
                onRequestPasswordReset = { email, onResult ->
                    authVm.requestPasswordReset(email, onResult)
                },
                )
            }
        }

        if (inMainApp && authOverlay == AuthOverlay.Register) {
            InAppAuthOverlay(onClose = { authOverlay = AuthOverlay.Login }) {
                RegisterScreen(
                isLoading = authBusy,
                message = authMessage,
                isError = authIsError,
                showOfflineButton = false,
                onRegister = { email, password, confirm ->
                    PasswordRules.validate(password)?.let { validationError ->
                        authMessage = validationError
                        authIsError = true
                        return@RegisterScreen
                    }
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
                        if (ok) onAuthSuccess()
                    }
                },
                onBackToLogin = {
                    authOverlay = AuthOverlay.Login
                    authMessage = null
                },
                )
            }
        }

        backupPromptUserId?.let { userId ->
            BackupActivationDialog(
                hasRemoteData = backupHasRemote,
                busy = backupBusy,
                onDismiss = { backupPromptUserId = null },
                onPushLocal = { finishBackupActivation(userId, BackupActivationStrategy.PushLocal) },
                onPullRemote = { finishBackupActivation(userId, BackupActivationStrategy.PullRemote) },
            )
        }

        if (appUpdate.manifest != null && (!appUpdate.awaitingInstallPermission || appUpdate.downloading)) {
            UpdateAvailableDialog(
                manifest = appUpdate.manifest!!,
                downloading = appUpdate.downloading,
                downloadProgress = appUpdate.progress,
                onDismiss = { vm.dismissPendingUpdate() },
                onUpdate = { vm.startUpdateDownload() },
            )
        }

        if (appUpdate.awaitingInstallPermission) {
            InstallPermissionDialog(
                onDismiss = { vm.dismissInstallPermissionPrompt() },
                onOpenSettings = {
                    ApkInstaller.openInstallPermissionSettings(context)
                },
            )
        }
    }
}

@Composable
private fun InAppAuthOverlay(
    onClose: () -> Unit,
    content: @Composable () -> Unit,
) {
    Surface(modifier = Modifier.fillMaxSize()) {
        Box(Modifier.fillMaxSize()) {
            TextButton(
                onClick = onClose,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .padding(16.dp),
            ) {
                Text("Cerrar")
            }
            content()
        }
    }
}

@Composable
private fun MainNominaScaffold(
    app: NominaApp,
    vm: MainViewModel,
    accountEmail: String?,
    accountUserId: String? = null,
    isOfflineAccount: Boolean = false,
    authConfigured: Boolean = false,
    cloudBackupEnabled: Boolean = false,
    manualUpdateCheckBusy: Boolean = false,
    onOpenLogin: () -> Unit,
    onOpenRegister: () -> Unit,
    onSignOut: (() -> Unit)?,
    onDeleteAccount: ((reason: String, onResult: (Boolean, String?) -> Unit) -> Unit)? = null,
    onCheckForUpdate: () -> Unit,
) {
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
    val expenseYearMonth by vm.expenseYearMonth.collectAsState()
    val expenses by vm.expenses.collectAsState()
    val expensePayroll by vm.expensePayroll.collectAsState()

    var tab by remember { mutableStateOf(NominaTab.Calendar) }
    var selectedDay by remember { mutableStateOf<LocalDate?>(null) }
    var showProfile by rememberSaveable { mutableStateOf(false) }
    var showExpenseDialog by remember { mutableStateOf(false) }
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
        Box(Modifier.fillMaxSize()) {
            Scaffold(
                snackbarHost = { SnackbarHost(snackbar) },
                bottomBar = {
                    NominaBottomBar(selected = tab, onSelect = { tab = it })
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
                            employeeName = profile?.name,
                            employeeJobTitle = profile?.jobTitle,
                            employeeDocumentId = profile?.documentId,
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
                NominaTab.Expenses -> ExpensesScreen(
                    yearMonth = expenseYearMonth,
                    expenses = expenses,
                    payroll = expensePayroll,
                    profileMissing = profile == null,
                    onPrev = vm::prevExpenseMonth,
                    onNext = vm::nextExpenseMonth,
                    onToday = vm::goExpenseToday,
                    onAdd = { showExpenseDialog = true },
                    onRemove = vm::removeExpense,
                    modifier = Modifier.padding(padding),
                )
                NominaTab.Settings -> SettingsScreen(
                    preferences = preferences,
                    manualHolidays = manual,
                    profile = profile,
                    onOpenProfile = { showProfile = true },
                    accountEmail = accountEmail,
                    isOfflineAccount = isOfflineAccount,
                    authConfigured = authConfigured,
                    cloudBackupEnabled = cloudBackupEnabled,
                    syncState = syncState,
                    manualUpdateCheckBusy = manualUpdateCheckBusy,
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
                    onOpenLogin = onOpenLogin,
                    onOpenRegister = onOpenRegister,
                    onCheckForUpdate = onCheckForUpdate,
                    onSavePreferences = vm::savePreferences,
                    onRemoveHoliday = vm::removeManualHoliday,
                    onRequestNotificationPermission = ::requestNotificationPermission,
                    onRequestBiometricEnable = { onSuccess ->
                        promptLocalBiometric(context, onSuccess)
                    },
                    onSignOut = onSignOut,
                    onDeleteAccount = onDeleteAccount,
                    modifier = Modifier.padding(padding),
                )
            }
            }

            if (showProfile) {
                Surface(Modifier.fillMaxSize()) {
                    ProfileScreen(
                        profile = profile,
                        onSave = vm::saveProfile,
                        onBack = { showProfile = false },
                    )
                }
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

    if (showExpenseDialog) {
        ExpenseEntryDialog(
            defaultDate = expenseYearMonth.atDay(
                LocalDate.now().let { now ->
                    if (YearMonth.from(now) == expenseYearMonth) now.dayOfMonth
                    else 1
                },
            ),
            onDismiss = { showExpenseDialog = false },
            onSave = { label, amount, category, date, isFixed ->
                vm.addExpense(label, amount, category, date, isFixed)
                showExpenseDialog = false
                scope.launch {
                    snackbar.showSnackbar(
                        if (isFixed) "Gasto fijo registrado" else "Gasto registrado",
                    )
                }
            },
        )
    }
}
