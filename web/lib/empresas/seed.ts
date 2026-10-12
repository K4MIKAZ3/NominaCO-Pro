import { nitDv } from "./law";
import type { Assignment, ClockRecord, Company, Employee, EmpresasState } from "./types";

export const DEMO_YEAR = 2026;
export const DEMO_MONTH = 10;
export const DEMO_DAYS = 31;
export const DEMO_TODAY = "2026-10-10";

const EXAMPLE_NIT = "901482331";

export const EXAMPLE_COMPANY: Company = {
  name: "Panadería La Aurora",
  nit: EXAMPLE_NIT,
  dv: nitDv(EXAMPLE_NIT),
  city: "Bogotá",
  departmentCode: "11",
  cityCode: "001",
  address: "Calle 72 10 34",
  phone: "6015550101",
  email: "nomina@laaurora.com",
  ciiu: "1081",
  arlCode: "14-23",
  exonerated: true,
  personType: "J",
};

export const COMPANY = {
  name: EXAMPLE_COMPANY.name,
  nit: `${EXAMPLE_COMPANY.nit}-${EXAMPLE_COMPANY.dv}`,
  city: EXAMPLE_COMPANY.city,
};

export const STAFF = {
  programador: { name: "Diana Castro", title: "Programa los turnos" },
  marcador: { name: "Héctor Ruiz", title: "Marca entrada y salida" },
  administrador: { name: "Elena Vargas", title: "Liquida la nómina" },
} as const;

function person(
  id: string,
  firstName: string,
  firstSurname: string,
  documentNumber: string,
  jobTitle: string,
  monthlySalary: number,
  riskClass: 1 | 2 | 3 | 4 | 5,
): Employee {
  return {
    id,
    docType: "CC",
    documentNumber,
    firstSurname,
    secondSurname: "",
    firstName,
    secondName: "",
    jobTitle,
    monthlySalary,
    dailyHours: 8,
    hireDate: "2024-03-01",
    contractType: "INDEFINIDO",
    salaryMode: "mensual",
    riskClass,
    epsCode: "EPS037",
    afpCode: "230301",
    ccfCode: "CCF24",
    active: true,
  };
}

export const EXAMPLE_EMPLOYEES: Employee[] = [
  person("w-laura", "Laura", "Méndez", "52334901", "Panadera", 1_750_905, 1),
  person("w-camilo", "Camilo", "Rojas", "80221445", "Hornero", 1_900_000, 3),
  person("w-sara", "Sara", "Ortiz", "1015442903", "Cajera", 1_750_905, 1),
  person("w-andres", "Andrés", "Gil", "1022883110", "Repartidor", 1_820_000, 2),
  person("w-marina", "Marina", "Peña", "39552018", "Auxiliar de mostrador", 1_750_905, 1),
  person("w-julian", "Julián", "Vargas", "79440221", "Jefe de punto", 3_800_000, 1),
];

const MADRUGADA = { start: "04:00", end: "12:00" };
const MOSTRADOR = { start: "08:00", end: "17:00" };
const TARDE = { start: "13:00", end: "21:00" };

type ClockPlan = { clockIn: string; clockOut: string } | null;

function isoDay(day: number): string {
  return `2026-10-${String(day).padStart(2, "0")}`;
}

function assignmentId(date: string, workerId: string): string {
  return `a-${date}-${workerId}`;
}

export function createSeedState(): EmpresasState {
  const assignments: Assignment[] = [];
  const clocks: ClockRecord[] = [];
  const publishedAt = "2026-10-01T06:00:00.000Z";

  const plan: Array<{ days: number[]; workerId: string; shift: { start: string; end: string }; skipClock?: number[] }> = [
    { days: [1, 2, 3, 4, 5, 6, 7, 8, 9], workerId: "w-laura", shift: MADRUGADA },
    { days: [1, 2, 3, 4, 5, 6, 7, 8, 9], workerId: "w-camilo", shift: MADRUGADA },
    { days: [1, 2, 3, 5, 6, 8, 9], workerId: "w-sara", shift: MOSTRADOR },
    { days: [1, 2, 3, 5, 6, 8, 9], workerId: "w-marina", shift: MOSTRADOR, skipClock: [5] },
    { days: [1, 2, 5, 6, 7, 8, 9], workerId: "w-andres", shift: TARDE },
    { days: [1, 2, 5, 6, 8, 9], workerId: "w-julian", shift: MOSTRADOR },
  ];

  const clockOverrides = new Map<string, ClockPlan>([
    ["2026-10-06:w-laura", { clockIn: "04:00", clockOut: "14:00" }],
    ["2026-10-08:w-sara", { clockIn: "08:00", clockOut: "18:00" }],
    ["2026-10-07:w-andres", { clockIn: "13:00", clockOut: "23:00" }],
    ["2026-10-02:w-andres", { clockIn: "13:20", clockOut: "21:00" }],
  ]);

  for (const group of plan) {
    for (const day of group.days) {
      const date = isoDay(day);
      const id = assignmentId(date, group.workerId);
      assignments.push({
        id,
        date,
        workerId: group.workerId,
        plannedStart: group.shift.start,
        plannedEnd: group.shift.end,
        status: "publicado",
        publishedAt,
      });
      if (group.skipClock?.includes(day)) continue;
      const override = clockOverrides.get(`${date}:${group.workerId}`);
      clocks.push({
        assignmentId: id,
        clockIn: override?.clockIn ?? group.shift.start,
        clockOut: override?.clockOut ?? group.shift.end,
        markedBy: "Héctor Ruiz",
        markedAt: `${date}T23:10:00.000Z`,
      });
    }
  }

  return {
    company: EXAMPLE_COMPANY,
    employees: EXAMPLE_EMPLOYEES,
    period: { year: DEMO_YEAR, month: DEMO_MONTH },
    role: "administrador",
    workerId: "w-laura",
    assignments,
    clocks,
    notifications: [],
    pendingRemovals: [],
    novedades: [],
  };
}

export function createEmptyState(): EmpresasState {
  return {
    company: null,
    employees: [],
    period: { year: DEMO_YEAR, month: DEMO_MONTH },
    role: "administrador",
    workerId: "",
    assignments: [],
    clocks: [],
    notifications: [],
    pendingRemovals: [],
    novedades: [],
  };
}

export function dayIso(day: number): string {
  return isoDay(day);
}
