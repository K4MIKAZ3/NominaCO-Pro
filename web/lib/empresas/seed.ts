import type { Assignment, ClockRecord, EmpresasState, Worker } from "./types";

export const DEMO_YEAR = 2026;
export const DEMO_MONTH = 10;
export const DEMO_DAYS = 31;
export const DEMO_TODAY = "2026-10-10";

export const COMPANY = {
  name: "Panadería La Aurora",
  nit: "901.482.331-6",
  city: "Bogotá",
};

export const STAFF = {
  programador: { name: "Diana Castro", title: "Programa los turnos" },
  marcador: { name: "Héctor Ruiz", title: "Marca entrada y salida" },
  administrador: { name: "Elena Vargas", title: "Liquida la nómina" },
} as const;

export const WORKERS: Worker[] = [
  { id: "w-laura", name: "Laura Méndez", documentId: "CC 52.334.901", jobTitle: "Panadera", monthlySalary: 1_750_905, dailyHours: 8 },
  { id: "w-camilo", name: "Camilo Rojas", documentId: "CC 80.221.445", jobTitle: "Hornero", monthlySalary: 1_900_000, dailyHours: 8 },
  { id: "w-sara", name: "Sara Ortiz", documentId: "CC 1.015.442.903", jobTitle: "Cajera", monthlySalary: 1_750_905, dailyHours: 8 },
  { id: "w-andres", name: "Andrés Gil", documentId: "CC 1.022.883.110", jobTitle: "Repartidor", monthlySalary: 1_820_000, dailyHours: 8 },
  { id: "w-marina", name: "Marina Peña", documentId: "CC 39.552.018", jobTitle: "Auxiliar de mostrador", monthlySalary: 1_750_905, dailyHours: 8 },
  { id: "w-julian", name: "Julián Vargas", documentId: "CC 79.440.221", jobTitle: "Jefe de punto", monthlySalary: 3_800_000, dailyHours: 8 },
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
    role: "programador",
    workerId: "w-laura",
    assignments,
    clocks,
    notifications: [],
    pendingRemovals: [],
  };
}

export function dayIso(day: number): string {
  return isoDay(day);
}
