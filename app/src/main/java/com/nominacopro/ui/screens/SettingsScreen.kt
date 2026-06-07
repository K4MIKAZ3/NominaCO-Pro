package com.nominacopro.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.Card
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.ui.Formatters
import java.time.LocalDate

@Composable
fun SettingsScreen(
    manualHolidays: Set<LocalDate>,
    onRemoveHoliday: (LocalDate) -> Unit,
    modifier: Modifier = Modifier,
) {
    LazyColumn(modifier.fillMaxSize().padding(16.dp)) {
        item {
            Text("Ajustes legales", style = MaterialTheme.typography.titleLarge)
            Text(
                "Parámetros Colombia 2026 integrados en el motor de cálculo.",
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                modifier = Modifier.padding(vertical = 8.dp),
            )
        }
        item {
            Card(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
                Column(Modifier.padding(16.dp)) {
                    LegalRow("SMMLV 2026", Formatters.money(ColombiaLaborLaw2026.SMMLV))
                    LegalRow("Auxilio transporte", Formatters.money(ColombiaLaborLaw2026.SUBSIDIO_TRANSPORTE))
                    LegalRow("Jornada máx. (ene–jun)", "44 h/semana")
                    LegalRow("Jornada máx. (jul–dic)", "42 h/semana")
                    LegalRow("Nocturno", "19:00 – 06:00 (+35%)")
                    LegalRow("Recargo dom./fest. (2026 H1)", "+80%")
                    LegalRow("Recargo dom./fest. (2026 H2)", "+90%")
                    LegalRow("Salud / Pensión empleado", "4% + 4%")
                }
            }
        }
        item {
            Text("Festivos manuales", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(top = 8.dp))
            Text(
                "Marca días festivo desde el calendario. Cuentan como descanso remunerado (Art. 177 CST).",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
            )
        }
        if (manualHolidays.isEmpty()) {
            item { Text("No hay festivos manuales.", modifier = Modifier.padding(8.dp)) }
        } else {
            items(manualHolidays.sortedDescending().toList()) { date ->
                Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                    androidx.compose.foundation.layout.Row(
                        Modifier.fillMaxWidth().padding(horizontal = 12.dp),
                        horizontalArrangement = androidx.compose.foundation.layout.Arrangement.SpaceBetween,
                        verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
                    ) {
                        Text("${date.dayOfMonth}/${date.monthValue}/${date.year}")
                        IconButton(onClick = { onRemoveHoliday(date) }) {
                            Icon(Icons.Default.Delete, contentDescription = "Eliminar")
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun LegalRow(label: String, value: String) {
    androidx.compose.foundation.layout.Row(
        Modifier.fillMaxWidth().padding(vertical = 3.dp),
        horizontalArrangement = androidx.compose.foundation.layout.Arrangement.SpaceBetween,
    ) {
        Text(label, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f))
        Text(value, color = MaterialTheme.colorScheme.primary)
    }
}
