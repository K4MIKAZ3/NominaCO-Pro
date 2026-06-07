package com.nominacopro.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.domain.model.ManualDeduction
import com.nominacopro.domain.model.MonthlyPayroll
import com.nominacopro.domain.model.PayrollEntryType
import com.nominacopro.domain.model.PayrollLine
import com.nominacopro.domain.model.PeriodPayrollSummary
import com.nominacopro.domain.model.SemesterSettlement
import com.nominacopro.domain.model.WorkDayEntry
import com.nominacopro.domain.model.YearSettlementReport
import com.nominacopro.domain.payperiod.PayPeriod
import com.nominacopro.domain.payperiod.PayPeriodType
import com.nominacopro.ui.Formatters

@Composable
fun PayrollScreen(
    payroll: MonthlyPayroll?,
    periodSummary: PeriodPayrollSummary?,
    payPeriodType: PayPeriodType,
    payPeriods: List<PayPeriod>,
    selectedPeriodIndex: Int,
    onSelectPeriod: (Int) -> Unit,
    periodManualEntries: List<ManualDeduction>,
    workDays: List<WorkDayEntry>,
    periodWorkDays: List<WorkDayEntry>,
    manualDeductions: List<ManualDeduction>,
    yearSettlement: YearSettlementReport?,
    pendingVacationDays: Int,
    onPendingVacationDaysChange: (Int) -> Unit,
    use24Hour: Boolean,
    profileMissing: Boolean,
    onAddDeduction: () -> Unit,
    onAddAdvance: () -> Unit,
    onAddBonus: () -> Unit,
    onRemoveManualEntry: (Long) -> Unit,
    onExportPayrollPdf: () -> Unit,
    onExportWorkDaysPdf: () -> Unit,
    modifier: Modifier = Modifier,
) {
    if (profileMissing) {
        EmptyMessage("Configura tu perfil para ver la liquidación.", modifier)
        return
    }
    if (payroll == null) {
        EmptyMessage("Sin datos de nómina para este mes.", modifier)
        return
    }

    val showSubPeriods = payPeriodType.hasSubPeriods
    val advances = periodManualEntries.filter { it.entryType == PayrollEntryType.ADVANCE }
    val monthAdvances = if (showSubPeriods) advances else manualDeductions.filter { it.entryType == PayrollEntryType.ADVANCE }
    val monthBonuses = if (showSubPeriods) {
        periodManualEntries.filter { it.entryType == PayrollEntryType.BONUS }
    } else {
        manualDeductions.filter { it.entryType == PayrollEntryType.BONUS }
    }

    var periodExpanded by rememberSaveable { mutableStateOf(false) }
    var monthExpanded by rememberSaveable { mutableStateOf(!showSubPeriods) }
    var daysExpanded by rememberSaveable { mutableStateOf(false) }
    var settlementExpanded by rememberSaveable { mutableStateOf(false) }

    val vacationDaysInput = if (pendingVacationDays > 0) pendingVacationDays.toString() else ""

    LazyColumn(modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Text(
                "Liquidación ${Formatters.monthNameFull(payroll.month)} ${payroll.year}",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
            )
            if (!showSubPeriods) {
                Text(
                    "Período mensual · mes completo",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                )
            }
        }

        if (showSubPeriods && payPeriods.isNotEmpty()) {
            item {
                Text("Subperíodo", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                Row(
                    Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    payPeriods.forEach { period ->
                        FilterChip(
                            selected = period.indexInMonth == selectedPeriodIndex,
                            onClick = { onSelectPeriod(period.indexInMonth) },
                            label = { Text(period.label) },
                        )
                    }
                }
            }
        }

        if (showSubPeriods && periodSummary != null) {
            item {
                CollapsibleSection(
                    title = "Resumen del subperíodo",
                    subtitle = "${Formatters.money(periodSummary.pendingBalance)} pendiente · toca para detalle",
                    expanded = periodExpanded,
                    onToggle = { periodExpanded = !periodExpanded },
                ) {
                    PeriodSummaryContent(periodSummary)
                }
            }
        }

        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilledTonalButton(onClick = onExportPayrollPdf, modifier = Modifier.weight(1f)) {
                    Icon(Icons.Default.PictureAsPdf, null, modifier = Modifier.padding(end = 4.dp))
                    Text("PDF nómina")
                }
                OutlinedButton(onClick = onExportWorkDaysPdf, modifier = Modifier.weight(1f)) {
                    Text("PDF días")
                }
            }
        }

        item {
            CollapsibleSection(
                title = if (showSubPeriods) "Detalle del mes" else "Liquidación del mes",
                subtitle = buildString {
                    append("${payroll.workedDays} días")
                    if (payroll.remuneratedRestDays > 0) append(" + ${payroll.remuneratedRestDays} descanso")
                    append(" · neto ${Formatters.money(payroll.netTotal)}")
                },
                expanded = monthExpanded,
                onToggle = { monthExpanded = !monthExpanded },
            ) {
                MonthDetailContent(
                    payroll = payroll,
                    advances = monthAdvances,
                    bonuses = monthBonuses,
                    manualDeductions = manualDeductions,
                    onAddAdvance = onAddAdvance,
                    onAddBonus = onAddBonus,
                    onAddDeduction = onAddDeduction,
                    onRemoveManualEntry = onRemoveManualEntry,
                )
            }
        }

        item {
            val daysToShow = if (showSubPeriods && periodWorkDays.isNotEmpty()) periodWorkDays else workDays
            CollapsibleSection(
                title = if (showSubPeriods) "Días del subperíodo" else "Días del mes",
                subtitle = "${daysToShow.size} jornada(s) registrada(s)",
                expanded = daysExpanded,
                onToggle = { daysExpanded = !daysExpanded },
            ) {
                if (daysToShow.isEmpty()) {
                    Text(
                        "No hay jornadas en este período.",
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                    )
                } else {
                    daysToShow.sortedBy { it.date }.forEach { entry ->
                        Card(
                            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                        ) {
                            Column(Modifier.padding(12.dp)) {
                                Text(
                                    "${entry.date.dayOfMonth}/${entry.date.monthValue}/${entry.date.year}",
                                    fontWeight = FontWeight.SemiBold,
                                )
                                Text(
                                    "${Formatters.formatTime(entry.start, use24Hour)} – ${Formatters.formatTime(entry.end, use24Hour)}",
                                    color = MaterialTheme.colorScheme.primary,
                                )
                            }
                        }
                    }
                }
            }
        }

        yearSettlement?.let { report ->
            item {
                CollapsibleSection(
                    title = "Prima, cesantías y liquidación ${report.year}",
                    subtitle = "Prima año ${Formatters.money(report.firstSemester.primaAmount + report.secondSemester.primaAmount)} · toca para detalle",
                    expanded = settlementExpanded,
                    onToggle = { settlementExpanded = !settlementExpanded },
                ) {
                    SettlementContent(
                        report = report,
                        vacationDaysInput = vacationDaysInput,
                        onVacationDaysChange = onPendingVacationDaysChange,
                    )
                }
            }
        }

        item {
            Text(
                "Base legal: CST · Ley 2466/2025 · prima/cesantías sobre 360 días · uso personal",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
            )
        }
    }
}

@Composable
private fun CollapsibleSection(
    title: String,
    subtitle: String,
    expanded: Boolean,
    onToggle: () -> Unit,
    content: @Composable () -> Unit,
) {
    Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
        Column(Modifier.padding(16.dp)) {
            Row(
                Modifier
                    .fillMaxWidth()
                    .clickable(onClick = onToggle),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(Modifier.weight(1f)) {
                    Text(title, fontWeight = FontWeight.SemiBold)
                    Text(
                        subtitle,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.65f),
                    )
                }
                Icon(
                    if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = if (expanded) "Contraer" else "Expandir",
                )
            }
            AnimatedVisibility(visible = expanded) {
                Column(Modifier.padding(top = 12.dp)) {
                    content()
                }
            }
        }
    }
}

@Composable
private fun PeriodSummaryContent(summary: PeriodPayrollSummary) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(
            "${summary.periodStart.dayOfMonth}/${summary.periodStart.monthValue} – ${summary.periodEnd.dayOfMonth}/${summary.periodEnd.monthValue}",
            color = MaterialTheme.colorScheme.primary,
        )
        RowAmount("Días trabajados", summary.workedDays.toLong(), false)
        RowAmount("Devengado bruto", summary.grossTotal, false)
        RowAmount("Descuentos legales", summary.legalDeductions, true)
        if (summary.manualDeductions > 0) RowAmount("Egresos / préstamos", summary.manualDeductions, true)
        if (summary.bonuses > 0) RowAmount("Bonos", summary.bonuses, false)
        RowAmount("Neto del subperíodo", summary.netTotal, false, bold = true)
        HorizontalDivider(Modifier.padding(vertical = 4.dp))
        RowAmount("Avances recibidos", summary.advances, true)
        RowAmount("Saldo pendiente por cobrar", summary.pendingBalance, false, bold = true)
    }
}

@Composable
private fun MonthDetailContent(
    payroll: MonthlyPayroll,
    advances: List<ManualDeduction>,
    bonuses: List<ManualDeduction>,
    manualDeductions: List<ManualDeduction>,
    onAddAdvance: () -> Unit,
    onAddBonus: () -> Unit,
    onAddDeduction: () -> Unit,
    onRemoveManualEntry: (Long) -> Unit,
) {
    Text(
        buildString {
            append("${payroll.workedDays} días laborados")
            if (payroll.remuneratedRestDays > 0) {
                append(" + ${payroll.remuneratedRestDays} descanso remunerado")
            }
            append(" · Valor día ${Formatters.money(payroll.dailyRate)}")
        },
        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
        modifier = Modifier.padding(bottom = 8.dp),
    )
    payroll.earnings.filter { it.code != "BON" }.forEach { line -> PayrollRow(line, false) }
    if (bonuses.isNotEmpty()) {
        bonuses.forEach { PayrollRow(PayrollLine(it.label, it.amount, code = "BON"), false) }
    }
    HorizontalDivider(Modifier.padding(vertical = 8.dp))
    payroll.legalDeductions.forEach { line -> PayrollRow(line, true) }

    Row(
        Modifier.fillMaxWidth().padding(top = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text("Avances", fontWeight = FontWeight.SemiBold)
        IconButton(onClick = onAddAdvance) {
            Icon(Icons.Default.Add, contentDescription = "Agregar avance")
        }
    }
    if (advances.isEmpty()) {
        Text("Sin avances registrados.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
    } else {
        advances.forEach { ManualEntryRow(it, onRemoveManualEntry, isCredit = false) }
    }

    Row(
        Modifier.fillMaxWidth().padding(top = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text("Bonos", fontWeight = FontWeight.SemiBold)
        IconButton(onClick = onAddBonus) {
            Icon(Icons.Default.Add, contentDescription = "Agregar bono")
        }
    }
    if (bonuses.isEmpty()) {
        Text("Sin bonos registrados.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
    } else {
        bonuses.forEach { ManualEntryRow(it, onRemoveManualEntry, isCredit = true) }
    }

    Row(
        Modifier.fillMaxWidth().padding(top = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text("Egresos del mes", fontWeight = FontWeight.SemiBold)
        IconButton(onClick = onAddDeduction) {
            Icon(Icons.Default.Add, contentDescription = "Agregar egreso")
        }
    }
    val deductions = manualDeductions.filter { it.entryType == PayrollEntryType.DEDUCTION }
    if (deductions.isEmpty()) {
        Text("Sin egresos manuales.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
    } else {
        deductions.forEach { ManualEntryRow(it, onRemoveManualEntry, isCredit = false) }
    }

    HorizontalDivider(Modifier.padding(vertical = 8.dp))
    RowAmount("NETO MES", payroll.netTotal, false, bold = true)
}

@Composable
private fun SettlementContent(
    report: YearSettlementReport,
    vacationDaysInput: String,
    onVacationDaysChange: (Int) -> Unit,
) {
    var vacationText by remember { mutableStateOf(vacationDaysInput) }
    LaunchedEffect(vacationDaysInput) { vacationText = vacationDaysInput }

    Text(
        "Estimación con jornadas registradas en la app. Pago prima: 1.er semestre antes del ${report.firstSemester.paymentDeadline}; 2.º semestre antes del ${report.secondSemester.paymentDeadline}.",
        style = MaterialTheme.typography.bodySmall,
        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.65f),
        modifier = Modifier.padding(bottom = 8.dp),
    )

    Text("Prima de servicios", fontWeight = FontWeight.SemiBold)
    SemesterRow(report.firstSemester)
    SemesterRow(report.secondSemester)
    RowAmount(
        "Total prima ${report.year}",
        report.firstSemester.primaAmount + report.secondSemester.primaAmount,
        false,
        bold = true,
    )

    HorizontalDivider(Modifier.padding(vertical = 8.dp))
    Text("Prestaciones anuales", fontWeight = FontWeight.SemiBold)
    RowAmount("Cesantías ${report.year}", report.annualCesantias, false)
    RowAmount("Intereses cesantías (12 % anual)", report.annualInteresesCesantias, false)

    HorizontalDivider(Modifier.padding(vertical = 8.dp))
    Text("Estimación liquidación final", fontWeight = FontWeight.SemiBold)
    Text(
        "Al ${report.liquidation.periodEnd.dayOfMonth}/${report.liquidation.periodEnd.monthValue}/${report.liquidation.periodEnd.year}",
        style = MaterialTheme.typography.bodySmall,
        color = MaterialTheme.colorScheme.primary,
    )
    OutlinedTextField(
        value = vacationText,
        onValueChange = {
            vacationText = it.filter(Char::isDigit)
            onVacationDaysChange(vacationText.toIntOrNull()?.coerceAtLeast(0) ?: 0)
        },
        label = { Text("Días de vacaciones pendientes") },
        supportingText = { Text("15 días hábiles/año (CST art. 186). Ingresa los pendientes.") },
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
    )
    RowAmount("Cesantías", report.liquidation.cesantias, false)
    RowAmount("Intereses cesantías", report.liquidation.interesesCesantias, false)
    RowAmount("Prima proporcional (semestre en curso)", report.liquidation.primaProporcional, false)
    RowAmount("Vacaciones pendientes", report.liquidation.vacaciones, false)
    RowAmount("Total estimado liquidación", report.liquidation.total, false, bold = true)
}

@Composable
private fun SemesterRow(semester: SemesterSettlement) {
    Column(Modifier.padding(vertical = 4.dp)) {
        Text(semester.label, fontWeight = FontWeight.Medium)
        Text(
            "${semester.totalDays} días devengados · pago máx. ${semester.paymentDeadline}",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.55f),
        )
        RowAmount("Prima", semester.primaAmount, false)
    }
}

@Composable
private fun ManualEntryRow(entry: ManualDeduction, onRemove: (Long) -> Unit, isCredit: Boolean) {
    Row(
        Modifier.fillMaxWidth().padding(vertical = 2.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f)) {
            Text(entry.label)
            Text(
                entry.entryType.label,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.55f),
            )
        }
        Text(
            (if (isCredit) "+ " else "- ") + Formatters.money(entry.amount),
            color = if (isCredit) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error,
        )
        IconButton(onClick = { onRemove(entry.id) }) {
            Icon(Icons.Default.Delete, contentDescription = "Eliminar")
        }
    }
}

@Composable
private fun PayrollRow(line: PayrollLine, deduction: Boolean, bold: Boolean = false) {
    val label = buildString {
        append(line.code ?: line.label.take(3).uppercase())
        line.hours?.let { h ->
            if (h > 0) append(" · ${Formatters.hours(h)} h")
        }
    }
    Row(
        Modifier.fillMaxWidth().padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Column(Modifier.weight(1f)) {
            Text(label, fontWeight = if (bold) FontWeight.Bold else FontWeight.SemiBold)
            if (line.code != null && line.label != line.code) {
                Text(
                    line.label,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.55f),
                )
            }
        }
        Text(
            (if (deduction) "- " else "") + Formatters.money(line.amount),
            color = if (deduction) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary,
            fontWeight = if (bold) FontWeight.Bold else FontWeight.Normal,
        )
    }
}

@Composable
private fun RowAmount(label: String, amount: Long, deduction: Boolean, bold: Boolean = false) {
    Row(
        Modifier.fillMaxWidth().padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(label, fontWeight = if (bold) FontWeight.Bold else FontWeight.Normal)
        Text(
            (if (deduction) "- " else "") + Formatters.money(amount),
            color = if (deduction) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary,
            fontWeight = if (bold) FontWeight.Bold else FontWeight.Normal,
        )
    }
}

@Composable
private fun EmptyMessage(text: String, modifier: Modifier = Modifier) {
    Column(modifier.fillMaxSize().padding(24.dp)) {
        Text(text, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f))
    }
}
