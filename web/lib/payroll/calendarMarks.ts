import * as Law from "./colombiaLaborLaw2026";
import { endOfMonth, parseYearMonth, startOfMonth, type LocalDate } from "./dates";
import type { CalendarMark, WorkDayEntry } from "./models";

export function buildCalendarDays(yearMonth: string): (LocalDate | null)[] {
  const { year, month } = parseYearMonth(yearMonth);
  const first = startOfMonth(year, month);
  const offset = (parseInt(first.slice(8, 10), 10) > 0
    ? (new Date(year, month - 1, 1).getDay() + 6) % 7
    : 0);
  const lastDay = parseInt(endOfMonth(year, month).slice(8, 10), 10);
  const result: (LocalDate | null)[] = [];
  for (let i = 0; i < offset; i++) result.push(null);
  for (let day = 1; day <= lastDay; day++) {
    result.push(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  }
  return result;
}

export function buildCalendarMarks(
  yearMonth: string,
  workDays: WorkDayEntry[],
  manualHolidays: Set<LocalDate>,
): Map<LocalDate, CalendarMark> {
  const { year, month } = parseYearMonth(yearMonth);
  const lastDay = parseInt(endOfMonth(year, month).slice(8, 10), 10);
  const workedDates = new Set(workDays.map((e) => e.date));
  const marks = new Map<LocalDate, CalendarMark>();
  for (let day = 1; day <= lastDay; day++) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    marks.set(date, {
      worked: workedDates.has(date),
      officialHoliday: Law.isOfficialHoliday(date),
      manualHoliday: manualHolidays.has(date),
      sunday: Law.isSunday(date),
    });
  }
  return marks;
}

export function countWorkedDays(yearMonth: string, marks: Map<LocalDate, CalendarMark>): number {
  let count = 0;
  marks.forEach((mark) => {
    if (mark.worked) count++;
  });
  return count;
}

export function countNonWorkedWeekdays(yearMonth: string, marks: Map<LocalDate, CalendarMark>): number {
  const { year, month } = parseYearMonth(yearMonth);
  let count = 0;
  const lastDay = parseInt(endOfMonth(year, month).slice(8, 10), 10);
  for (let day = 1; day <= lastDay; day++) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const mark = marks.get(date);
    const dow = new Date(year, month - 1, day).getDay();
    if (dow !== 0 && dow !== 6 && !mark?.worked) count++;
  }
  return count;
}
