import { dayOfWeekValue, type LocalDate } from "./dates";

export const SMMLV = 1_750_905;
export const SUBSIDIO_TRANSPORTE = 249_095;
export const UVT = 52_374;
export const TOPE_SUBSIDIO_TRANSPORTE = SMMLV * 2;
export const DESCUENTO_SALUD = 0.04;
export const DESCUENTO_PENSION = 0.04;
export const DIAS_MES_REFERENCIA = 30;
export const DIAS_ANIO_PRESTACIONES = 360;
export const INTERES_CESANTIAS_ANUAL = 0.12;
export const ORDINARY_WORK_DAYS_PER_WEEK = 5;

export const Factors = {
  NORMAL: 1.0,
  NOCTURNA: 1.35,
  EXTRA_DIURNA: 1.25,
  EXTRA_NOCTURNA: 1.75,
} as const;

export const OFFICIAL_HOLIDAYS_2026: Set<LocalDate> = new Set([
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

export function weeklyHoursLimit(date: LocalDate): number {
  return date < "2026-07-15" ? 44 : 42;
}

export function dominicalFactor(date: LocalDate): number {
  if (date < "2025-07-01") return 1.75;
  if (date < "2026-07-01") return 1.8;
  if (date < "2027-07-01") return 1.9;
  return 2.0;
}

export function extraDominicalDiurnaFactor(date: LocalDate): number {
  return Factors.EXTRA_DIURNA + (dominicalFactor(date) - 1.0);
}

export function extraDominicalNocturnaFactor(date: LocalDate): number {
  return Factors.EXTRA_NOCTURNA + (dominicalFactor(date) - 1.0);
}

export function isOfficialHoliday(date: LocalDate): boolean {
  return OFFICIAL_HOLIDAYS_2026.has(date);
}

export function isSunday(date: LocalDate): boolean {
  return dayOfWeekValue(date) === 7;
}

export function isRestDay(date: LocalDate, manualHolidays: Set<LocalDate>): boolean {
  return isSunday(date) || isOfficialHoliday(date) || manualHolidays.has(date);
}

export function isOrdinaryWorkday(date: LocalDate, manualHolidays: Set<LocalDate>): boolean {
  const dow = dayOfWeekValue(date);
  return dow >= 1 && dow <= 5 && !isOfficialHoliday(date) && !manualHolidays.has(date);
}

export function isWeekdayHoliday(date: LocalDate, manualHolidays: Set<LocalDate>): boolean {
  return !isSunday(date) && (isOfficialHoliday(date) || manualHolidays.has(date));
}

export function remuneratedRestPay(monthlySalary: number, paidDays: number): number {
  if (paidDays <= 0) return 0;
  return Math.trunc(dailyRate(monthlySalary) * paidDays);
}

export function dailyRate(monthlySalary: number): number {
  return monthlySalary / DIAS_MES_REFERENCIA;
}

export function hourlyRate(monthlySalary: number, dailyHours: number): number {
  return dailyRate(monthlySalary) / dailyHours;
}

export function proportionalBaseSalary(monthlySalary: number, workedDays: number): number {
  if (workedDays <= 0) return 0;
  return Math.min(Math.trunc(dailyRate(monthlySalary) * workedDays), monthlySalary);
}

export function transportSubsidyForDays(workedDays: number): number {
  if (workedDays <= 0) return 0;
  return Math.trunc((SUBSIDIO_TRANSPORTE * workedDays) / DIAS_MES_REFERENCIA);
}

export function qualifiesTransport(salary: number): boolean {
  return salary <= TOPE_SUBSIDIO_TRANSPORTE;
}
