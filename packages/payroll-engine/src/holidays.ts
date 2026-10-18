import type { LegalSnapshot, LocalDate } from "./types.js";

export function isOfficialHoliday(date: LocalDate, snapshot: LegalSnapshot): boolean {
  return snapshot.officialHolidays.includes(date);
}

export function dayOfWeekValue(date: LocalDate): number {
  // UTC noon evita desfases de zona al parsear YYYY-MM-DD.
  const d = new Date(`${date}T12:00:00Z`);
  const js = d.getUTCDay(); // 0=domingo
  return js === 0 ? 7 : js;
}

export function isSunday(date: LocalDate): boolean {
  return dayOfWeekValue(date) === 7;
}

export function isRestDay(
  date: LocalDate,
  snapshot: LegalSnapshot,
  manualHolidays: Set<LocalDate> = new Set(),
): boolean {
  return isSunday(date) || isOfficialHoliday(date, snapshot) || manualHolidays.has(date);
}

export function isOrdinaryWorkday(
  date: LocalDate,
  snapshot: LegalSnapshot,
  manualHolidays: Set<LocalDate> = new Set(),
): boolean {
  const dow = dayOfWeekValue(date);
  return (
    dow >= 1 &&
    dow <= 5 &&
    !isOfficialHoliday(date, snapshot) &&
    !manualHolidays.has(date)
  );
}

export function isWeekdayHoliday(
  date: LocalDate,
  snapshot: LegalSnapshot,
  manualHolidays: Set<LocalDate> = new Set(),
): boolean {
  return (
    !isSunday(date) &&
    (isOfficialHoliday(date, snapshot) || manualHolidays.has(date))
  );
}
