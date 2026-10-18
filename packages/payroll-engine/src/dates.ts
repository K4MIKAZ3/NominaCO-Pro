export type LocalDate = string;

export function parseDate(iso: LocalDate): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

export function isoDate(y: number, m: number, d: number): LocalDate {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function dayOfWeekValue(iso: LocalDate): number {
  const { y, m, d } = parseDate(iso);
  const dow = new Date(y, m - 1, d).getDay();
  return dow === 0 ? 7 : dow;
}

export function isAfter(a: LocalDate, b: LocalDate): boolean {
  return a > b;
}

export function isBefore(a: LocalDate, b: LocalDate): boolean {
  return a < b;
}

export function addDays(iso: LocalDate, days: number): LocalDate {
  const { y, m, d } = parseDate(iso);
  const dt = new Date(y, m - 1, d + days);
  return isoDate(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
}

export function daysBetween(start: LocalDate, end: LocalDate): number {
  const s = parseDate(start);
  const e = parseDate(end);
  const ms = Date.UTC(e.y, e.m - 1, e.d) - Date.UTC(s.y, s.m - 1, s.d);
  return Math.floor(ms / 86400000);
}

export function startOfMonth(year: number, month: number): LocalDate {
  return isoDate(year, month, 1);
}

export function endOfMonth(year: number, month: number): LocalDate {
  const lastDay = new Date(year, month, 0).getDate();
  return isoDate(year, month, lastDay);
}

export function previousOrSameMonday(iso: LocalDate): LocalDate {
  const dow = dayOfWeekValue(iso);
  return addDays(iso, -(dow - 1));
}

export function addWeeks(iso: LocalDate, weeks: number): LocalDate {
  return addDays(iso, weeks * 7);
}

export function yearMonthPrefix(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function parseTimeToMinutes(time: string): number {
  const parts = time.split(":");
  return Number(parts[0]) * 60 + Number(parts[1]);
}

export function getLastNYearMonths(
  count: number,
  from: Date = new Date(),
): { year: number; month: number }[] {
  const result: { year: number; month: number }[] = [];
  for (let offset = count - 1; offset >= 0; offset--) {
    const d = new Date(from.getFullYear(), from.getMonth() - offset, 1);
    result.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return result;
}

export function parseYearMonth(key: string): { year: number; month: number } {
  const [yearStr, monthStr] = key.split("-");
  return { year: Number.parseInt(yearStr, 10), month: Number.parseInt(monthStr, 10) };
}

export function shiftYearMonth(key: string, deltaMonths: number): string {
  const { year, month } = parseYearMonth(key);
  const d = new Date(year, month - 1 + deltaMonths, 1);
  return yearMonthPrefix(d.getFullYear(), d.getMonth() + 1);
}

export function compareYearMonths(a: string, b: string): number {
  return a.localeCompare(b);
}

export function enumerateYearMonths(fromKey: string, toKey: string): string[] {
  if (compareYearMonths(fromKey, toKey) > 0) return [];
  const result: string[] = [];
  let current = fromKey;
  while (compareYearMonths(current, toKey) <= 0) {
    result.push(current);
    current = shiftYearMonth(current, 1);
  }
  return result;
}

export function todayYearMonth(from: Date = new Date()): string {
  return yearMonthPrefix(from.getFullYear(), from.getMonth() + 1);
}

/** Límites de navegación del calendario (como la app Android: sin tope en el mes actual). */
export function navigationYearMonthBounds(
  from: Date = new Date(),
  pastMonths = 60,
  futureMonths = 24,
): { minYearMonth: string; maxYearMonth: string; todayYearMonth: string } {
  const today = todayYearMonth(from);
  return {
    minYearMonth: shiftYearMonth(today, -pastMonths),
    maxYearMonth: shiftYearMonth(today, futureMonths),
    todayYearMonth: today,
  };
}

export function isYearMonthInRange(
  key: string,
  minYearMonth: string,
  maxYearMonth: string,
): boolean {
  return compareYearMonths(key, minYearMonth) >= 0 && compareYearMonths(key, maxYearMonth) <= 0;
}
