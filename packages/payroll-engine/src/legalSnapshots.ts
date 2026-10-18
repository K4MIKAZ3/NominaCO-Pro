import type { LegalSnapshot, LocalDate } from "./types.js";

/**
 * Snapshots semilla 2026 — espejo de la validación legal (docs/LEGAL_VALIDATION_2026.md).
 * En runtime Empresas los carga desde BD; estos sirven para tests y bootstrap.
 */

const HOLIDAYS_2026: LocalDate[] = [
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
  "2026-07-13", // Ley 2578/2026 — Chiquinquirá (Emiliani)
  "2026-07-20",
  "2026-08-07",
  "2026-08-17",
  "2026-10-12",
  "2026-11-02",
  "2026-11-16",
  "2026-12-08",
  "2026-12-25",
];

const base2026 = {
  smmlv: 1_750_905,
  transportSubsidy: 249_095,
  transportSalaryCapMultiplier: 2,
  uvt: 52_374,
  healthEmployeeRate: 0.04,
  pensionEmployeeRate: 0.04,
  referenceMonthDays: 30,
  settlementYearDays: 360,
  cesantiasInterestAnnual: 0.12,
  ordinaryWorkDaysPerWeek: 5,
  nightStartHour: 19,
  nightEndHour: 6,
  nightOrdinaryFactor: 1.35,
  extraDayFactor: 1.25,
  extraNightFactor: 1.75,
  officialHolidays: HOLIDAYS_2026,
} as const;

/** 1-ene-2026 → 30-jun-2026: jornada 44 h, dominical +80 %. */
export const SNAPSHOT_2026_H1: LegalSnapshot = {
  id: "co-2026-h1",
  validFrom: "2026-01-01",
  validTo: "2026-06-30",
  ...base2026,
  weeklyHoursLimit: 44,
  dominicalFactor: 1.8,
};

/** 1-jul-2026 → 14-jul-2026: jornada 44 h, dominical +90 %. */
export const SNAPSHOT_2026_JUL_EARLY: LegalSnapshot = {
  id: "co-2026-jul-early",
  validFrom: "2026-07-01",
  validTo: "2026-07-14",
  ...base2026,
  weeklyHoursLimit: 44,
  dominicalFactor: 1.9,
};

/** 15-jul-2026 → 31-dic-2026: jornada 42 h, dominical +90 %. */
export const SNAPSHOT_2026_H2: LegalSnapshot = {
  id: "co-2026-h2",
  validFrom: "2026-07-15",
  validTo: "2026-12-31",
  ...base2026,
  weeklyHoursLimit: 42,
  dominicalFactor: 1.9,
};

export const SEED_SNAPSHOTS_2026: LegalSnapshot[] = [
  SNAPSHOT_2026_H1,
  SNAPSHOT_2026_JUL_EARLY,
  SNAPSHOT_2026_H2,
];

export function resolveLegalSnapshot(
  date: LocalDate,
  snapshots: LegalSnapshot[] = SEED_SNAPSHOTS_2026,
): LegalSnapshot {
  const match = snapshots.find((s) => {
    if (date < s.validFrom) return false;
    if (s.validTo == null) return true;
    return date <= s.validTo;
  });
  if (!match) {
    throw new Error(`No hay legal_parameters para la fecha ${date}`);
  }
  return match;
}

export function transportSalaryCap(snapshot: LegalSnapshot): number {
  return snapshot.smmlv * snapshot.transportSalaryCapMultiplier;
}

export function qualifiesTransport(salary: number, snapshot: LegalSnapshot): boolean {
  return salary <= transportSalaryCap(snapshot);
}
