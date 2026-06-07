package com.nominacopro.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nominacopro.domain.model.MonthlyPayroll
import com.nominacopro.ui.Formatters

@Composable
fun PayrollScreen(
    payroll: MonthlyPayroll?,
    profileMissing: Boolean,
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

    LazyColumn(modifier.fillMaxSize().padding(16.dp)) {
        item {
            Text(
                "Liquidación ${Formatters.monthName(payroll.month)} ${payroll.year}",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
            )
            Text(
                "${payroll.workedDays} días trabajados · ${payroll.restDays} descansos remunerados",
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                modifier = Modifier.padding(bottom = 12.dp),
            )
        }
        item {
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
                Column(Modifier.padding(16.dp)) {
                    Text("Devengado", fontWeight = FontWeight.SemiBold)
                    payroll.earnings.forEach { line ->
                        RowAmount(line.label, line.amount, false)
                    }
                    HorizontalDivider(Modifier.padding(vertical = 8.dp))
                    Text("Descuentos", fontWeight = FontWeight.SemiBold)
                    payroll.deductions.forEach { line ->
                        RowAmount(line.label, line.amount, true)
                    }
                    HorizontalDivider(Modifier.padding(vertical = 8.dp))
                    RowAmount("NETO A RECIBIR", payroll.netTotal, false, bold = true)
                }
            }
        }
        item {
            Text(
                "Base legal: Ley 2466/2025 · SMMLV 2026 ${Formatters.money(com.nominacopro.domain.law.ColombiaLaborLaw2026.SMMLV)}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                modifier = Modifier.padding(top = 16.dp),
            )
        }
    }
}

@Composable
private fun RowAmount(label: String, amount: Long, deduction: Boolean, bold: Boolean = false) {
    androidx.compose.foundation.layout.Row(
        Modifier.fillMaxWidth().padding(vertical = 4.dp),
        horizontalArrangement = androidx.compose.foundation.layout.Arrangement.SpaceBetween,
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
