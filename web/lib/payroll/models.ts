import type { LocalDate } from "./dates";

export type DayType = "NORMAL" | "FESTIVO_DOMINICAL" | "FESTIVO_NOCTURNO";

export type PayrollEntryType = "DEDUCTION" | "ADVANCE" | "BONUS";

export interface WorkDayEntry {
  date: LocalDate;
  start: string;
  end: string;
  dayType: DayType;
  notes: string;
}

export interface HourBreakdown {
  normalDiurna: number;
  nocturnaOrdinaria: number;
  extraDiurna: number;
  extraNocturna: number;
  dominicalDiurna: number;
  dominicalNocturna: number;
  extraDominicalDiurna: number;
  extraDominicalNocturna: number;
}

export function emptyHourBreakdown(): HourBreakdown {
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

export function addHourBreakdown(a: HourBreakdown, b: HourBreakdown): HourBreakdown {
  return {
    normalDiurna: a.normalDiurna + b.normalDiurna,
    nocturnaOrdinaria: a.nocturnaOrdinaria + b.nocturnaOrdinaria,
    extraDiurna: a.extraDiurna + b.extraDiurna,
    extraNocturna: a.extraNocturna + b.extraNocturna,
    dominicalDiurna: a.dominicalDiurna + b.dominicalDiurna,
    dominicalNocturna: a.dominicalNocturna + b.dominicalNocturna,
    extraDominicalDiurna: a.extraDominicalDiurna + b.extraDominicalDiurna,
    extraDominicalNocturna: a.extraDominicalNocturna + b.extraDominicalNocturna,
  };
}

export type ContractType = "INDEFINIDO" | "OBRA_LABOR" | "TERMINO_DEFINIDO";
export type PayPeriodType = "MONTHLY" | "WEEKLY" | "BIWEEKLY" | "VENTEEN";

export interface EmployeeProfile {
  name: string;
  documentId: string;
  jobTitle: string;
  monthlySalary: number;
  dailyHours: number;
  contractType: ContractType;
  payPeriodType: PayPeriodType;
  pendingVacationDays: number;
}

export interface CalendarMark {
  worked: boolean;
  officialHoliday: boolean;
  manualHoliday: boolean;
  sunday: boolean;
}

export interface PeriodPayrollSummary {
  periodLabel: string;
  periodStart: LocalDate;
  periodEnd: LocalDate;
  workedDays: number;
  dailyRate: number;
  grossTotal: number;
  legalDeductions: number;
  manualDeductions: number;
  bonuses: number;
  advances: number;
  netTotal: number;
  pendingBalance: number;
}

export interface SemesterSettlement {
  label: string;
  start: LocalDate;
  end: LocalDate;
  workedDays: number;
  remuneratedRestDays: number;
  primaAmount: number;
  paymentDeadline: string;
}

export interface LiquidationEstimate {
  cesantias: number;
  interesesCesantias: number;
  primaProporcional: number;
  vacaciones: number;
  pendingVacationDays: number;
  periodEnd: LocalDate;
  total: number;
}

export interface YearSettlementReport {
  year: number;
  firstSemester: SemesterSettlement;
  secondSemester: SemesterSettlement;
  annualCesantias: number;
  annualInteresesCesantias: number;
  liquidation: LiquidationEstimate;
}

export interface AppPreferences {
  defaultStartHour: number;
  defaultStartMinute: number;
  defaultEndHour: number;
  defaultEndMinute: number;
  use24HourFormat: boolean;
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
}

export function totalHourBreakdown(b: HourBreakdown): number {
  return Math.round(
    (b.normalDiurna +
      b.nocturnaOrdinaria +
      b.extraDiurna +
      b.extraNocturna +
      b.dominicalDiurna +
      b.dominicalNocturna +
      b.extraDominicalDiurna +
      b.extraDominicalNocturna) *
      100,
  ) / 100;
}

export interface PayrollLine {
  label: string;
  amount: number;
  isDeduction?: boolean;
  code?: string;
  hours?: number;
}

export interface ManualDeduction {
  yearMonth: string;
  effectiveDate: LocalDate;
  label: string;
  amount: number;
  entryType: PayrollEntryType;
}

export interface MonthlyPayroll {
  year: number;
  month: number;
  workedDays: number;
  restDays: number;
  remuneratedRestDays: number;
  breakdown: HourBreakdown;
  earnings: PayrollLine[];
  legalDeductions: PayrollLine[];
  manualDeductions: PayrollLine[];
  manualBonuses: PayrollLine[];
  grossTotal: number;
  netTotal: number;
  dailyRate: number;
  hourlyRate: number;
}

export interface MonthSummary {
  year: number;
  month: number;
  grossTotal: number;
  legalDeductions: number;
  manualDeductions: number;
  netTotal: number;
}
