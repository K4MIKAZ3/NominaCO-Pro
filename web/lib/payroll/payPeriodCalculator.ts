import { formatMonthName } from "@/lib/format";
import {
  addDays,
  addWeeks,
  endOfMonth,
  isAfter,
  isBefore,
  parseYearMonth,
  previousOrSameMonday,
  startOfMonth,
  type LocalDate,
} from "./dates";
import type { PayPeriodType } from "./models";

export interface PayPeriod {
  start: LocalDate;
  end: LocalDate;
  label: string;
  indexInMonth: number;
}

export function payPeriodDayCount(period: PayPeriod): number {
  const start = parseDateParts(period.start);
  const end = parseDateParts(period.end);
  const ms = Date.UTC(end.y, end.m - 1, end.d) - Date.UTC(start.y, start.m - 1, start.d);
  return Math.floor(ms / 86400000) + 1;
}

function parseDateParts(iso: LocalDate) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

export function hasSubPeriods(type: PayPeriodType): boolean {
  return type !== "MONTHLY";
}

export function shouldShowSubPeriods(type: PayPeriodType, periods: PayPeriod[]): boolean {
  return hasSubPeriods(type) && periods.length > 0;
}

export function periodsInMonth(type: PayPeriodType, yearMonth: string): PayPeriod[] {
  const { year, month } = parseYearMonth(yearMonth);
  switch (type) {
    case "MONTHLY":
      return [];
    case "WEEKLY":
      return weeklyPeriods(year, month);
    case "BIWEEKLY":
      return biweeklyPeriods(year, month);
    case "VENTEEN":
      return venteenPeriods(year, month);
    default:
      return biweeklyPeriods(year, month);
  }
}

export function defaultPeriodIndex(
  type: PayPeriodType,
  yearMonth: string,
  today: LocalDate = todayIso(),
): number {
  if (!hasSubPeriods(type)) return 0;
  const periods = periodsInMonth(type, yearMonth);
  if (periods.length === 0) return 0;
  const now = new Date();
  const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  if (yearMonth !== currentYm) return 0;
  const idx = periods.findIndex((p) => !isBefore(today, p.start) && !isAfter(today, p.end));
  return Math.max(0, idx);
}

function todayIso(): LocalDate {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function biweeklyPeriods(year: number, month: number): PayPeriod[] {
  const monthLabel = formatMonthName(month);
  const lastDay = new Date(year, month, 0).getDate();
  const periods: PayPeriod[] = [];
  const firstEnd = Math.min(15, lastDay);
  periods.push(
    period(startOfMonth(year, month), `${year}-${String(month).padStart(2, "0")}-${String(firstEnd).padStart(2, "0")}`, `1–${firstEnd} ${monthLabel}`, 0),
  );
  if (lastDay >= 16) {
    periods.push(
      period(
        `${year}-${String(month).padStart(2, "0")}-16`,
        endOfMonth(year, month),
        `16–${lastDay} ${monthLabel}`,
        1,
      ),
    );
  }
  return periods;
}

function weeklyPeriods(year: number, month: number): PayPeriod[] {
  const monthStart = startOfMonth(year, month);
  const monthEnd = endOfMonth(year, month);
  const monthLabel = formatMonthName(month);
  let weekStart = previousOrSameMonday(monthStart);
  const periods: PayPeriod[] = [];
  while (!isAfter(weekStart, monthEnd)) {
    const weekEnd = addDays(weekStart, 6);
    const overlapStart = isBefore(weekStart, monthStart) ? monthStart : weekStart;
    const overlapEnd = isAfter(weekEnd, monthEnd) ? monthEnd : weekEnd;
    if (!isAfter(overlapStart, overlapEnd)) {
      const startDay = parseDateParts(overlapStart).d;
      const endDay = parseDateParts(overlapEnd).d;
      periods.push(
        period(
          weekStart,
          weekEnd,
          `Sem ${periods.length + 1} · ${startDay}–${endDay} ${monthLabel}`,
          periods.length,
        ),
      );
    }
    weekStart = addWeeks(weekStart, 1);
  }
  return periods;
}

function venteenPeriods(year: number, month: number): PayPeriod[] {
  const monthStart = startOfMonth(year, month);
  const monthEnd = endOfMonth(year, month);
  const monthLabel = formatMonthName(month);
  let periodStart: LocalDate = `${year}-01-01`;
  const periods: PayPeriod[] = [];
  let ventenaIndex = 1;
  while (!isAfter(periodStart, monthEnd) && periodStart.startsWith(String(year))) {
    const periodEnd = addDays(periodStart, 20);
    if (!isBefore(periodEnd, monthStart) && !isAfter(periodStart, monthEnd)) {
      const overlapStart = isBefore(periodStart, monthStart) ? monthStart : periodStart;
      const overlapEnd = isAfter(periodEnd, monthEnd) ? monthEnd : periodEnd;
      const startDay = parseDateParts(overlapStart).d;
      const endDay = parseDateParts(overlapEnd).d;
      periods.push(
        period(
          periodStart,
          periodEnd,
          `Ventena ${ventenaIndex} · ${startDay}–${endDay} ${monthLabel}`,
          periods.length,
        ),
      );
      ventenaIndex++;
    }
    periodStart = addDays(periodStart, 21);
  }
  return periods;
}

function period(start: LocalDate, end: LocalDate, label: string, index: number): PayPeriod {
  return { start, end, label, indexInMonth: index };
}
