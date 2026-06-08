import * as Law from "./colombiaLaborLaw2026";
import {
  addDays,
  addWeeks,
  isAfter,
  isBefore,
  previousOrSameMonday,
  type LocalDate,
} from "./dates";

export interface RemuneratedRestDays {
  paidSundays: number;
  paidWeekdayHolidays: number;
  totalDays: number;
}

function weekQualifies(
  weekStart: LocalDate,
  periodStart: LocalDate,
  periodEnd: LocalDate,
  workedDates: Set<LocalDate>,
  manualHolidays: Set<LocalDate>,
  workDaysPerWeek: number,
): boolean {
  let availableOrdinary = 0;
  let workedOrdinary = 0;
  for (let offset = 0; offset <= 6; offset++) {
    const date = addDays(weekStart, offset);
    if (isBefore(date, periodStart) || isAfter(date, periodEnd)) continue;
    if (!Law.isOrdinaryWorkday(date, manualHolidays)) continue;
    availableOrdinary++;
    if (workedDates.has(date)) workedOrdinary++;
  }
  if (availableOrdinary === 0) return false;
  const required = Math.min(workDaysPerWeek, availableOrdinary);
  return workedOrdinary >= required;
}

export function calculateRemuneratedRest(
  start: LocalDate,
  end: LocalDate,
  workedDates: Set<LocalDate>,
  manualHolidays: Set<LocalDate>,
  workDaysPerWeek: number = Law.ORDINARY_WORK_DAYS_PER_WEEK,
): RemuneratedRestDays {
  let paidSundays = 0;
  let paidWeekdayHolidays = 0;

  let weekStart = previousOrSameMonday(start);
  while (!isAfter(weekStart, end)) {
    if (weekQualifies(weekStart, start, end, workedDates, manualHolidays, workDaysPerWeek)) {
      for (let offset = 0; offset <= 6; offset++) {
        const date = addDays(weekStart, offset);
        if (isBefore(date, start) || isAfter(date, end)) continue;
        if (workedDates.has(date)) continue;
        if (Law.isSunday(date)) {
          paidSundays++;
        } else if (Law.isWeekdayHoliday(date, manualHolidays)) {
          paidWeekdayHolidays++;
        }
      }
    }
    weekStart = addWeeks(weekStart, 1);
  }

  return {
    paidSundays,
    paidWeekdayHolidays,
    totalDays: paidSundays + paidWeekdayHolidays,
  };
}
