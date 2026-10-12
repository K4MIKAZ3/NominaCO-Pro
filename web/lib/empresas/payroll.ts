import { formatDay } from "./format";
import {
  ARL_RATE,
  DIAS_MES,
  SMMLV,
  SUBSIDIO_TRANSPORTE,
  clampIbc,
  dominicalFactor,
  fondoSolidaridad,
  isExonerated,
  isRestDay,
  qualifiesTransport,
  weeklyHourLimit,
} from "./law";
import type { Assignment, ClockRecord, Company, Employee, Novelty } from "./types";

export { SMMLV, SUBSIDIO_TRANSPORTE, DIAS_MES, dominicalFactor, isRestDay };

const MINUTES_DAY = 24 * 60;
const LUNCH_START = 12 * 60;
const LUNCH_END = 13 * 60;

export type HourBreakdown = {
  normalDiurna: number;
  nocturnaOrdinaria: number;
  extraDiurna: number;
  extraNocturna: number;
  dominicalDiurna: number;
  dominicalNocturna: number;
  extraDominicalDiurna: number;
  extraDominicalNocturna: number;
};

export type PayLine = {
  label: string;
  amount: number;
  hours?: number;
  deduction?: boolean;
};

export type EmployerCost = {
  health: number;
  pension: number;
  arl: number;
  ccf: number;
  sena: number;
  icbf: number;
  cesantias: number;
  interesesCesantias: number;
  prima: number;
  vacaciones: number;
  total: number;
};

export type PilaSlice = {
  days: number;
  salaryBasic: number;
  integral: boolean;
  exonerated: boolean;
  ibc: number;
  hours: number;
  pensionRate: number;
  pensionPay: number;
  healthRate: number;
  healthPay: number;
  arlRate: number;
  arlPay: number;
  ccfRate: number;
  ccfPay: number;
  senaRate: number;
  senaPay: number;
  icbfRate: number;
  icbfPay: number;
  fspSolidaridad: number;
  fspSubsistencia: number;
  ing: boolean;
  ret: boolean;
};

export type WorkerPayroll = {
  workerId: string;
  workedDays: number;
  absences: number;
  incomplete: number;
  extraHours: number;
  lines: PayLine[];
  gross: number;
  deductions: number;
  net: number;
  warnings: string[];
  employer: EmployerCost;
  pila: PilaSlice;
};

export function toMinutes(hhmm: string): number {
  const [hour, minute] = hhmm.split(":").map(Number);
  return hour * 60 + minute;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function emptyBreakdown(): HourBreakdown {
  return {
    normalDiurna: 0,
    nocturnaOrdinaria: 0,
    extraDiurna: 0,
    extraNocturna: 0,
    dominicalDiurna: 0,
    dominicalNocturna: 0,
    extraDominicalDiurna: 0,
    extraDominicalNocturna: 0,
  };
}

function subtractLunch(start: number, end: number): Array<[number, number]> {
  let ranges: Array<[number, number]> = [[start, end]];
  for (const [cutStart, cutEnd] of [
    [LUNCH_START, LUNCH_END],
    [LUNCH_START + MINUTES_DAY, LUNCH_END + MINUTES_DAY],
  ] as const) {
    const next: Array<[number, number]> = [];
    for (const [from, to] of ranges) {
      if (to <= cutStart || from >= cutEnd) {
        next.push([from, to]);
        continue;
      }
      if (from < cutStart) next.push([from, Math.min(to, cutStart)]);
      if (to > cutEnd) next.push([Math.max(from, cutEnd), to]);
    }
    ranges = next.filter(([from, to]) => to > from);
  }
  return ranges;
}

function isNightMinute(minute: number): boolean {
  const clock = ((minute % MINUTES_DAY) + MINUTES_DAY) % MINUTES_DAY;
  return clock >= 19 * 60 || clock < 6 * 60;
}

export function classifyHours(clockIn: string, clockOut: string, dailyHours: number, restDay: boolean): HourBreakdown {
  let start = toMinutes(clockIn);
  let end = toMinutes(clockOut);
  if (end <= start) end += MINUTES_DAY;

  const boundaries = [0, 6 * 60, 19 * 60, MINUTES_DAY, MINUTES_DAY + 6 * 60, MINUTES_DAY + 19 * 60, MINUTES_DAY * 2];
  const breakdown = emptyBreakdown();
  let ordinaryLeft = dailyHours;

  for (const [from, to] of subtractLunch(start, end)) {
    let cursor = from;
    while (cursor < to) {
      const nextBoundary = boundaries.find((mark) => mark > cursor) ?? to;
      const segmentEnd = Math.min(to, nextBoundary);
      let hours = (segmentEnd - cursor) / 60;
      const ordinary = Math.min(hours, Math.max(ordinaryLeft, 0));
      const extra = hours - ordinary;
      ordinaryLeft -= ordinary;
      const night = isNightMinute(cursor);
      if (restDay && night) {
        breakdown.dominicalNocturna += ordinary;
        breakdown.extraDominicalNocturna += extra;
      } else if (restDay) {
        breakdown.dominicalDiurna += ordinary;
        breakdown.extraDominicalDiurna += extra;
      } else if (night) {
        breakdown.nocturnaOrdinaria += ordinary;
        breakdown.extraNocturna += extra;
      } else {
        breakdown.normalDiurna += ordinary;
        breakdown.extraDiurna += extra;
      }
      cursor = segmentEnd;
    }
  }

  return {
    normalDiurna: round2(breakdown.normalDiurna),
    nocturnaOrdinaria: round2(breakdown.nocturnaOrdinaria),
    extraDiurna: round2(breakdown.extraDiurna),
    extraNocturna: round2(breakdown.extraNocturna),
    dominicalDiurna: round2(breakdown.dominicalDiurna),
    dominicalNocturna: round2(breakdown.dominicalNocturna),
    extraDominicalDiurna: round2(breakdown.extraDominicalDiurna),
    extraDominicalNocturna: round2(breakdown.extraDominicalNocturna),
  };
}

export function extraHoursOf(breakdown: HourBreakdown): number {
  return round2(
    breakdown.extraDiurna +
      breakdown.extraNocturna +
      breakdown.extraDominicalDiurna +
      breakdown.extraDominicalNocturna,
  );
}

function mergeLines(lines: PayLine[]): PayLine[] {
  const order: PayLine[] = [];
  const index = new Map<string, PayLine>();
  for (const line of lines) {
    const key = `${line.deduction ? "d" : "e"}:${line.label}`;
    const existing = index.get(key);
    if (!existing) {
      const copy = { ...line };
      index.set(key, copy);
      order.push(copy);
      continue;
    }
    existing.amount += line.amount;
    if (line.hours != null) existing.hours = round2((existing.hours ?? 0) + line.hours);
  }
  return order;
}

function pay(hourly: number, hours: number, factor: number): number {
  if (hours <= 0) return 0;
  return Math.round(hourly * hours * factor);
}

function weekKey(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - weekday + 1);
  return date.toISOString().slice(0, 10);
}

function covers(novelty: Novelty, iso: string): boolean {
  return iso >= novelty.start && iso <= novelty.end;
}

function emptyEmployer(): EmployerCost {
  return { health: 0, pension: 0, arl: 0, ccf: 0, sena: 0, icbf: 0, cesantias: 0, interesesCesantias: 0, prima: 0, vacaciones: 0, total: 0 };
}

function emptyPila(salary: number, integral: boolean): PilaSlice {
  return {
    days: 0,
    salaryBasic: salary,
    integral,
    exonerated: false,
    ibc: 0,
    hours: 0,
    pensionRate: 0.16,
    pensionPay: 0,
    healthRate: 0.125,
    healthPay: 0,
    arlRate: 0,
    arlPay: 0,
    ccfRate: 0.04,
    ccfPay: 0,
    senaRate: 0.02,
    senaPay: 0,
    icbfRate: 0.03,
    icbfPay: 0,
    fspSolidaridad: 0,
    fspSubsistencia: 0,
    ing: false,
    ret: false,
  };
}

export function liquidateWorker(
  worker: Employee,
  assignments: Assignment[],
  clocks: ClockRecord[],
  company: Company | null,
  novedades: Novelty[] = [],
  periodEnd = "",
): WorkerPayroll {
  const integral = worker.salaryMode === "integral";
  const hourly = worker.monthlySalary / DIAS_MES / worker.dailyHours;
  const ownNovelties = novedades.filter((novelty) => novelty.workerId === worker.id);
  const lines: PayLine[] = [];
  let workedDays = 0;
  let absences = 0;
  let incomplete = 0;
  let extraHours = 0;
  let ordinaryHours = 0;
  const extraByWeek = new Map<string, number>();
  const ordinaryByWeek = new Map<string, number>();
  const warnings: string[] = [];

  const own = assignments
    .filter((assignment) => assignment.workerId === worker.id && assignment.status === "publicado")
    .sort((a, b) => a.date.localeCompare(b.date));

  for (const assignment of own) {
    const novelty = ownNovelties.find((item) => covers(item, assignment.date));
    if (novelty && novelty.kind !== "VAC") {
      if (novelty.kind === "AUS" || novelty.kind === "SLN") absences += 1;
      continue;
    }
    if (novelty?.kind === "VAC") continue;

    const clock = clocks.find((item) => item.assignmentId === assignment.id);
    if (!clock || !clock.clockIn || !clock.clockOut) {
      if (clock?.clockIn || clock?.clockOut) incomplete += 1;
      else absences += 1;
      continue;
    }

    const restDay = isRestDay(assignment.date);
    const breakdown = classifyHours(clock.clockIn, clock.clockOut, worker.dailyHours, restDay);
    const factor = dominicalFactor(assignment.date);
    const dayExtra = extraHoursOf(breakdown);
    const dayOrdinary = round2(
      breakdown.normalDiurna + breakdown.nocturnaOrdinaria + breakdown.dominicalDiurna + breakdown.dominicalNocturna,
    );
    extraHours = round2(extraHours + dayExtra);
    ordinaryHours = round2(ordinaryHours + dayOrdinary);
    extraByWeek.set(weekKey(assignment.date), round2((extraByWeek.get(weekKey(assignment.date)) ?? 0) + dayExtra));
    ordinaryByWeek.set(weekKey(assignment.date), round2((ordinaryByWeek.get(weekKey(assignment.date)) ?? 0) + dayOrdinary));
    if (dayExtra > 2) {
      warnings.push(`El ${formatDay(assignment.date)} supera 2 horas extra en el día.`);
    }
    workedDays += 1;

    const chunks: Array<[string, number, number]> = [
      ["Hora diurna", breakdown.normalDiurna, 1],
      ["Recargo nocturno (+35%)", breakdown.nocturnaOrdinaria, 1.35],
      ["Hora extra diurna (+25%)", breakdown.extraDiurna, 1.25],
      ["Hora extra nocturna (+75%)", breakdown.extraNocturna, 1.75],
      ["Dominical o festivo diurno", breakdown.dominicalDiurna, factor],
      ["Dominical o festivo nocturno", breakdown.dominicalNocturna, factor + 0.35],
      ["Extra dominical diurna", breakdown.extraDominicalDiurna, 1.25 + (factor - 1)],
      ["Extra dominical nocturna", breakdown.extraDominicalNocturna, 1.75 + (factor - 1)],
    ];
    for (const [label, hours, multiplier] of chunks) {
      const amount = pay(hourly, hours, multiplier);
      if (amount > 0) lines.push({ label, amount, hours });
    }
  }

  for (const [week, hours] of Array.from(extraByWeek.entries())) {
    if (hours > 12) warnings.push(`La semana del ${formatDay(week)} suma ${hours} h extra (máximo legal 12).`);
  }
  for (const [week, hours] of Array.from(ordinaryByWeek.entries())) {
    const limit = weeklyHourLimit(week);
    if (hours > limit) warnings.push(`La semana del ${formatDay(week)} suma ${hours} h ordinarias (máximo ${limit}).`);
  }

  const periodPrefix = periodEnd.slice(0, 7);
  const vacationDays = ownNovelties
    .filter((novelty) => novelty.kind === "VAC")
    .reduce((sum, novelty) => sum + daysInPrefix(novelty.start, novelty.end, periodPrefix), 0);
  if (vacationDays > 0) {
    lines.push({
      label: "Vacaciones",
      amount: Math.round((worker.monthlySalary / DIAS_MES) * vacationDays),
    });
  }

  if (qualifiesTransport(worker.monthlySalary, integral) && workedDays > 0) {
    lines.push({
      label: "Auxilio de transporte",
      amount: Math.round((SUBSIDIO_TRANSPORTE * workedDays) / DIAS_MES),
    });
  }

  const gross = lines.reduce((sum, line) => sum + line.amount, 0);
  const transport = lines.find((line) => line.label === "Auxilio de transporte")?.amount ?? 0;
  const contributory = Math.max(0, gross - transport);
  const pilaDays = Math.min(DIAS_MES, workedDays + vacationDays);
  const ibcBase = integral ? Math.round(contributory * 0.7) : contributory;
  const ibc = clampIbc(ibcBase, pilaDays);
  const exonerated = isExonerated(Boolean(company?.exonerated), worker.monthlySalary);
  const fsp = fondoSolidaridad(ibc);
  const employeeHealth = Math.round(ibc * 0.04);
  const employeePension = Math.round(ibc * 0.04);
  const employerHealth = exonerated ? 0 : Math.round(ibc * 0.085);
  const employerPension = Math.round(ibc * 0.12);
  const arlRate = ARL_RATE[worker.riskClass];
  const employerArl = Math.round(ibc * arlRate);
  const employerCcf = Math.round(ibc * 0.04);
  const employerSena = exonerated ? 0 : Math.round(ibc * 0.02);
  const employerIcbf = exonerated ? 0 : Math.round(ibc * 0.03);

  if (employeeHealth > 0) lines.push({ label: "Salud (4%)", amount: employeeHealth, deduction: true });
  if (employeePension > 0) lines.push({ label: "Pensión (4%)", amount: employeePension, deduction: true });
  if (fsp.solidaridad > 0) lines.push({ label: "Fondo de solidaridad", amount: fsp.solidaridad, deduction: true });
  if (fsp.subsistencia > 0) lines.push({ label: "Fondo de subsistencia", amount: fsp.subsistencia, deduction: true });

  const prestacionalBase = worker.monthlySalary + (qualifiesTransport(worker.monthlySalary, integral) ? SUBSIDIO_TRANSPORTE : 0);
  const vacationBase = integral ? Math.round(worker.monthlySalary * 0.7) : worker.monthlySalary;
  const monthFactor = pilaDays / DIAS_MES;
  const cesantias = integral ? 0 : Math.round(prestacionalBase * 0.0833 * monthFactor);
  const interesesCesantias = integral ? 0 : Math.round(cesantias * 0.12 * monthFactor);
  const prima = integral ? 0 : Math.round(prestacionalBase * 0.0833 * monthFactor);
  const vacaciones = Math.round(vacationBase * 0.0417 * monthFactor);
  const employer: EmployerCost = {
    health: employerHealth,
    pension: employerPension,
    arl: employerArl,
    ccf: employerCcf,
    sena: employerSena,
    icbf: employerIcbf,
    cesantias,
    interesesCesantias,
    prima,
    vacaciones,
    total: employerHealth + employerPension + employerArl + employerCcf + employerSena + employerIcbf + cesantias + interesesCesantias + prima + vacaciones,
  };

  const deductions = employeeHealth + employeePension + fsp.solidaridad + fsp.subsistencia;
  const hireInPeriod = periodPrefix.length === 7 && worker.hireDate.slice(0, 7) === periodPrefix;
  const pila: PilaSlice = {
    days: pilaDays,
    salaryBasic: worker.monthlySalary,
    integral,
    exonerated,
    ibc,
    hours: Math.round(ordinaryHours + extraHours),
    pensionRate: 0.16,
    pensionPay: employeePension + employerPension,
    healthRate: exonerated ? 0.04 : 0.125,
    healthPay: employeeHealth + employerHealth,
    arlRate,
    arlPay: employerArl,
    ccfRate: 0.04,
    ccfPay: employerCcf,
    senaRate: exonerated ? 0 : 0.02,
    senaPay: employerSena,
    icbfRate: exonerated ? 0 : 0.03,
    icbfPay: employerIcbf,
    fspSolidaridad: fsp.solidaridad,
    fspSubsistencia: fsp.subsistencia,
    ing: hireInPeriod,
    ret: false,
  };

  if (worker.monthlySalary < SMMLV && !integral) {
    warnings.push("El salario mensual está por debajo del mínimo de 2026.");
  }
  if (integral && worker.monthlySalary < SMMLV * 13) {
    warnings.push("El salario integral debe ser de al menos 13 SMMLV.");
  }

  return {
    workerId: worker.id,
    workedDays,
    absences,
    incomplete,
    extraHours,
    lines: mergeLines(lines),
    gross,
    deductions,
    net: gross - deductions,
    warnings,
    employer,
    pila,
  };
}

function daysInPrefix(start: string, end: string, prefix: string): number {
  if (prefix.length !== 7) return 0;
  let days = 0;
  let cursor = start < `${prefix}-01` ? `${prefix}-01` : start;
  while (cursor <= end && cursor.startsWith(prefix) && days < 31) {
    const [year, month, day] = cursor.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (Number.isNaN(date.getTime())) break;
    days += 1;
    date.setUTCDate(date.getUTCDate() + 1);
    cursor = date.toISOString().slice(0, 10);
  }
  return days;
}

export function liquidatePeriod(
  workers: Employee[],
  assignments: Assignment[],
  clocks: ClockRecord[],
  company: Company | null,
  novedades: Novelty[] = [],
  periodEnd = "",
): WorkerPayroll[] {
  return workers.map((worker) => liquidateWorker(worker, assignments, clocks, company, novedades, periodEnd));
}
