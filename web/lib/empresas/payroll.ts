import { formatDay } from "./format";
import type { Assignment, ClockRecord, Worker } from "./types";

/** Parámetros Colombia 2026 usados por el demo. El mes comercial de nómina tiene 30 días. */
export const SMMLV = 1_750_905;
export const SUBSIDIO_TRANSPORTE = 249_095;
export const TOPE_TRANSPORTE = SMMLV * 2;
export const DIAS_MES = 30;

const MINUTES_DAY = 24 * 60;
const LUNCH_START = 12 * 60;
const LUNCH_END = 13 * 60;

export const HOLIDAYS_2026 = new Set([
  "2026-01-01",
  "2026-01-12",
  "2026-03-23",
  "2026-04-02",
  "2026-04-03",
  "2026-05-01",
  "2026-05-18",
  "2026-06-08",
  "2026-06-15",
  "2026-06-29",
  "2026-07-20",
  "2026-08-07",
  "2026-08-17",
  "2026-10-12",
  "2026-11-02",
  "2026-11-16",
  "2026-12-08",
  "2026-12-25",
]);

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
};

export function isSunday(iso: string): boolean {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay() === 0;
}

export function isRestDay(iso: string): boolean {
  return isSunday(iso) || HOLIDAYS_2026.has(iso);
}

/** +80 % hasta el 30 jun 2026, +90 % desde el 1 jul 2026 (Ley 2466). */
export function dominicalFactor(iso: string): number {
  if (iso < "2026-07-01") return 1.8;
  if (iso < "2027-07-01") return 1.9;
  return 2;
}

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

export function liquidateWorker(
  worker: Worker,
  assignments: Assignment[],
  clocks: ClockRecord[],
): WorkerPayroll {
  const hourly = worker.monthlySalary / DIAS_MES / worker.dailyHours;
  const lines: PayLine[] = [];
  let workedDays = 0;
  let absences = 0;
  let incomplete = 0;
  let extraHours = 0;
  const extraByWeek = new Map<string, number>();
  const warnings: string[] = [];

  const own = assignments
    .filter((assignment) => assignment.workerId === worker.id && assignment.status === "publicado")
    .sort((a, b) => a.date.localeCompare(b.date));

  for (const assignment of own) {
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
    extraHours = round2(extraHours + dayExtra);
    extraByWeek.set(weekKey(assignment.date), round2((extraByWeek.get(weekKey(assignment.date)) ?? 0) + dayExtra));
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

  if (worker.monthlySalary <= TOPE_TRANSPORTE && workedDays > 0) {
    lines.push({
      label: "Auxilio de transporte",
      amount: Math.round((SUBSIDIO_TRANSPORTE * workedDays) / DIAS_MES),
    });
  }

  const gross = lines.reduce((sum, line) => sum + line.amount, 0);
  const transport = lines.find((line) => line.label === "Auxilio de transporte")?.amount ?? 0;
  const ibc = Math.max(0, gross - transport);
  const salud = Math.round(ibc * 0.04);
  const pension = Math.round(ibc * 0.04);
  if (salud > 0) lines.push({ label: "Salud (4%)", amount: salud, deduction: true });
  if (pension > 0) lines.push({ label: "Pensión (4%)", amount: pension, deduction: true });

  const deductions = salud + pension;
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
  };
}

export function liquidatePeriod(workers: Worker[], assignments: Assignment[], clocks: ClockRecord[]): WorkerPayroll[] {
  return workers.map((worker) => liquidateWorker(worker, assignments, clocks));
}
