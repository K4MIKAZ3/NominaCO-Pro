/** Fecha ISO `YYYY-MM-DD`. */
export type LocalDate = string;

export type PayrollLineCode =
  | "SBP"
  | "ST"
  | "DRD"
  | "FER"
  | "RN"
  | "HED"
  | "HEN"
  | "RDD"
  | "RDN"
  | "EDD"
  | "EDN"
  | "BON"
  | "SAL"
  | "PEN"
  | "DED";

export interface PayrollLine {
  label: string;
  amount: number;
  code?: PayrollLineCode | string;
  isDeduction?: boolean;
  hours?: number;
}

/**
 * Snapshot legal vigente para una fecha de liquidación.
 * En producción viene de `legal_parameters` (Supabase), no de constantes.
 */
export interface LegalSnapshot {
  id: string;
  validFrom: LocalDate;
  validTo: LocalDate | null;
  smmlv: number;
  transportSubsidy: number;
  transportSalaryCapMultiplier: number;
  uvt: number;
  healthEmployeeRate: number;
  pensionEmployeeRate: number;
  referenceMonthDays: number;
  settlementYearDays: number;
  cesantiasInterestAnnual: number;
  ordinaryWorkDaysPerWeek: number;
  weeklyHoursLimit: number;
  /** Multiplicador total dominical/festivo (ej. 1.9 = +90 %). */
  dominicalFactor: number;
  nightStartHour: number;
  nightEndHour: number;
  nightOrdinaryFactor: number;
  extraDayFactor: number;
  extraNightFactor: number;
  officialHolidays: LocalDate[];
}

