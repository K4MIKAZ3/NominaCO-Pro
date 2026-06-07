package com.nominacopro.ui.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.domain.model.EmployeeProfile
import com.nominacopro.ui.Formatters

@Composable
fun ProfileScreen(
    profile: EmployeeProfile?,
    onSave: (EmployeeProfile) -> Unit,
    modifier: Modifier = Modifier,
) {
    var name by rememberSaveable { mutableStateOf(profile?.name ?: "") }
    var doc by rememberSaveable { mutableStateOf(profile?.documentId ?: "") }
    var job by rememberSaveable { mutableStateOf(profile?.jobTitle ?: "") }
    var salary by rememberSaveable { mutableStateOf(profile?.monthlySalary?.toString() ?: "") }
    var hours by rememberSaveable { mutableStateOf(profile?.dailyHours?.toString() ?: "8") }

    Column(modifier.fillMaxSize().padding(16.dp)) {
        Text("Mi perfil laboral", style = androidx.compose.material3.MaterialTheme.typography.titleLarge)
        Text(
            "SMMLV 2026: ${Formatters.money(ColombiaLaborLaw2026.SMMLV)}",
            modifier = Modifier.padding(vertical = 8.dp),
            color = androidx.compose.material3.MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
        )
        OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Nombre") }, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp))
        OutlinedTextField(value = doc, onValueChange = { doc = it }, label = { Text("Cédula") }, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp))
        OutlinedTextField(value = job, onValueChange = { job = it }, label = { Text("Cargo") }, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp))
        OutlinedTextField(
            value = salary, onValueChange = { salary = it.filter { c -> c.isDigit() } },
            label = { Text("Salario mensual") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        )
        OutlinedTextField(
            value = hours, onValueChange = { hours = it.filter { c -> c.isDigit() } },
            label = { Text("Horas diarias (jornada)") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        )
        Button(
            onClick = {
                val s = salary.toLongOrNull() ?: 0L
                val h = hours.toIntOrNull() ?: 8
                if (name.isNotBlank() && s > 0) {
                    onSave(EmployeeProfile(name.trim(), doc.trim(), job.trim(), s, h))
                }
            },
            modifier = Modifier.padding(top = 16.dp),
        ) { Text("Guardar perfil") }
    }
}
