/** Datos de demostración del panel (sin Supabase aún). */

export const demoCompany = {
  id: "co-demo-1",
  name: "Café Andino SAS",
  nit: "901234567-8",
  city: "Medellín",
  employeesActive: 12,
  payrollOpen: true,
};

export const demoCompanies = [
  demoCompany,
  {
    id: "co-demo-2",
    name: "Logística Pacífico Ltda",
    nit: "800987654-3",
    city: "Cali",
    employeesActive: 28,
    payrollOpen: false,
  },
];

export const demoEmployees = [
  {
    id: "emp-1",
    name: "Ana María Restrepo",
    documentId: "1030587941",
    jobTitle: "Operaria de producción",
    monthlySalary: 1_750_905,
    contractType: "INDEFINIDO",
    status: "Activo",
  },
  {
    id: "emp-2",
    name: "Carlos Duque",
    documentId: "71745211",
    jobTitle: "Supervisor de turno",
    monthlySalary: 2_850_000,
    contractType: "INDEFINIDO",
    status: "Activo",
  },
  {
    id: "emp-3",
    name: "Laura Gómez",
    documentId: "1128456732",
    jobTitle: "Auxiliar administrativa",
    monthlySalary: 2_100_000,
    contractType: "TERMINO_DEFINIDO",
    status: "Activo",
  },
];

export const demoPayrollRuns = [
  {
    id: "pay-2026-03",
    label: "Marzo 2026",
    periodStart: "2026-03-01",
    periodEnd: "2026-03-31",
    status: "Borrador",
    employees: 12,
    grossEstimate: 28_450_000,
  },
  {
    id: "pay-2026-02",
    label: "Febrero 2026",
    periodStart: "2026-02-01",
    periodEnd: "2026-02-28",
    status: "Cerrado",
    employees: 11,
    grossEstimate: 26_120_000,
  },
];

export const demoLegalSnapshots = [
  {
    id: "co-2026-h1",
    range: "1 ene – 30 jun 2026",
    weeklyHours: 44,
    dominical: "80 %",
  },
  {
    id: "co-2026-jul-early",
    range: "1 jul – 14 jul 2026",
    weeklyHours: 44,
    dominical: "90 %",
  },
  {
    id: "co-2026-h2",
    range: "15 jul – 31 dic 2026",
    weeklyHours: 42,
    dominical: "90 %",
  },
];
