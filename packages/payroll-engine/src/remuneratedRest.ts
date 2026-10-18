import {
  addDays,
  addWeeks,
  isAfter,
  isBefore,
  previousOrSameMonday,
  type LocalDate,
} from "./dates.js";
import {
  isOrdinaryWorkday,
  isSunday,
  isWeekdayHoliday,
} from "./holidays.js";
import type { LegalSnapshot } from "./types.js";
import type { RemuneratedRestDays } from "./models.js";

function weekQualifies(
  weekStart: LocalDate,
  periodStart: LocalDate,
  periodEnd: LocalDate,
  workedDates: Set<LocalDate>,
  snapshot: LegalSnapshot,
  manualHolidays: Set<LocalDate>,
  workDaysPerWeek: number,
): boolean {
  let availableOrdinary = 0;
  let workedOrdinary = 0;
  for (let offset = 0; offset <= 6; offset++) {
    const date = addDays(weekStart, offset);
    if (isBefore(date, periodStart) || isAfter(date, periodEnd)) continue;
    if (!isOrdinaryWorkday(date, snapshot, manualHolidays)) continue;
    availableOrdinary++;
    if (workedDates.has(date)) workedOrdinary++;
  }
  if (availableOrdinary === 0) return false;
  return workedOrdinary >= Math.min(workDaysPerWeek, availableOrdinary);
}

export function calculateRemuneratedRest(
  start: LocalDate,
  end: LocalDate,
  workedDates: Set<LocalDate>,
  snapshot: LegalSnapshot,
  manualHolidays: Set<LocalDate> = new Set(),
): RemuneratedRestDays {
  const workDaysPerWeek = snapshot.ordinaryWorkDaysPerWeek;
  let paidSundays = 0;
  let paidWeekdayHolidays = 0;
  let weekStart = previousOrSameMonday(start);

  while (!isAfter(weekStart, end)) {
    if (
      weekQualifies(
        weekStart,
        start,
        end,
        workedDates,
        snapshot,
        manualHolidays,
        workDaysPerWeek,
      )
    ) {
      for (let offset = 0; offset <= 6; offset++) {
        const date = addDays(weekStart, offset);
        if (isBefore(date, start) || isAfter(date, end)) continue;
        if (workedDates.has(date)) continue;
        if (isSunday(date)) paidSundays++;
        else if (isWeekdayHoliday(date, snapshot, manualHolidays)) paidWeekdayHolidays++;
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
