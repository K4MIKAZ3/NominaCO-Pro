package com.nominacopro.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenu
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.nominacopro.domain.law.ColombiaLaborLaw2026
import com.nominacopro.domain.model.ContractType
import com.nominacopro.domain.model.EmployeeProfile
import com.nominacopro.ui.Formatters
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    profile: EmployeeProfile?,
    onSave: (EmployeeProfile) -> Unit,
    modifier: Modifier = Modifier,
) {
    val snackbar = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    var isEditing by rememberSaveable { mutableStateOf(profile == null) }

    var name by rememberSaveable { mutableStateOf(profile?.name ?: "") }
    var doc by rememberSaveable { mutableStateOf(profile?.documentId ?: "") }
    var job by rememberSaveable { mutableStateOf(profile?.jobTitle ?: "") }
    var salary by rememberSaveable { mutableStateOf(profile?.monthlySalary?.toString() ?: "") }
    var hours by rememberSaveable { mutableStateOf(profile?.dailyHours?.toString() ?: "8") }
    var contractType by rememberSaveable { mutableStateOf(profile?.contractType ?: ContractType.INDEFINIDO) }
    var contractExpanded by remember { mutableStateOf(false) }

    LaunchedEffect(profile) {
        if (profile != null && !isEditing) {
            name = profile.name
            doc = profile.documentId
            job = profile.jobTitle
            salary = profile.monthlySalary.toString()
            hours = profile.dailyHours.toString()
            contractType = profile.contractType
        }
    }

    fun loadFromProfile(p: EmployeeProfile) {
        name = p.name
        doc = p.documentId
        job = p.jobTitle
        salary = p.monthlySalary.toString()
        hours = p.dailyHours.toString()
        contractType = p.contractType
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbar) },
        modifier = modifier,
    ) { padding ->
        Column(
            Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
        ) {
            Text("Mi perfil laboral", style = MaterialTheme.typography.titleLarge)
            Text(
                "SMMLV 2026: ${Formatters.money(ColombiaLaborLaw2026.SMMLV)}",
                modifier = Modifier.padding(vertical = 8.dp),
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
            )

            if (!isEditing && profile != null) {
                Card(Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(profile.name, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.primary)
                        Text(profile.jobTitle)
                        Text("Cédula: ${profile.documentId.ifBlank { "—" }}")
                        Text("Salario: ${Formatters.money(profile.monthlySalary)}")
                        Text("Jornada: ${profile.dailyHours} h/día")
                        Text("Contrato: ${profile.contractType.label}")
                        OutlinedButton(
                            onClick = {
                                loadFromProfile(profile)
                                isEditing = true
                            },
                            modifier = Modifier.padding(top = 8.dp),
                        ) { Text("Editar") }
                    }
                }
            } else {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Nombre") },
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                )
                OutlinedTextField(
                    value = doc,
                    onValueChange = { doc = it },
                    label = { Text("Cédula") },
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                )
                OutlinedTextField(
                    value = job,
                    onValueChange = { job = it },
                    label = { Text("Cargo") },
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                )
                OutlinedTextField(
                    value = salary,
                    onValueChange = { salary = it.filter(Char::isDigit) },
                    label = { Text("Salario mensual") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                )
                OutlinedTextField(
                    value = hours,
                    onValueChange = { hours = it.filter(Char::isDigit) },
                    label = { Text("Horas diarias (jornada)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                )
                ExposedDropdownMenuBox(
                    expanded = contractExpanded,
                    onExpandedChange = { contractExpanded = it },
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                ) {
                    OutlinedTextField(
                        value = contractType.label,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Tipo de contrato") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = contractExpanded) },
                        modifier = Modifier.menuAnchor().fillMaxWidth(),
                    )
                    ExposedDropdownMenu(
                        expanded = contractExpanded,
                        onDismissRequest = { contractExpanded = false },
                    ) {
                        ContractType.entries.forEach { type ->
                            DropdownMenuItem(
                                text = { Text(type.label) },
                                onClick = {
                                    contractType = type
                                    contractExpanded = false
                                },
                            )
                        }
                    }
                }
                Button(
                    onClick = {
                        val s = salary.toLongOrNull() ?: 0L
                        val h = hours.toIntOrNull() ?: 8
                        if (name.isNotBlank() && s > 0) {
                            onSave(
                                EmployeeProfile(
                                    name = name.trim(),
                                    documentId = doc.trim(),
                                    jobTitle = job.trim(),
                                    monthlySalary = s,
                                    dailyHours = h,
                                    contractType = contractType,
                                ),
                            )
                            isEditing = false
                            scope.launch { snackbar.showSnackbar("Cambios guardados") }
                        }
                    },
                    modifier = Modifier.padding(top = 16.dp),
                ) { Text("Guardar perfil") }
                if (profile != null) {
                    OutlinedButton(
                        onClick = {
                            loadFromProfile(profile)
                            isEditing = false
                        },
                        modifier = Modifier.padding(top = 8.dp),
                    ) { Text("Cancelar") }
                }
            }
        }
    }
}
