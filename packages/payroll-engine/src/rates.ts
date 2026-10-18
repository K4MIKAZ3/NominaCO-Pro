import type { LegalSnapshot } from "./types.js";
import { qualifiesTransport } from "./legalSnapshots.js";

export function dailyRate(monthlySalary: number, snapshot: LegalSnapshot): number {
  return monthlySalary / snapshot.referenceMonthDays;
}

export function hourlyRate(
  monthlySalary: number,
  dailyHours: number,
  snapshot: LegalSnapshot,
): number {
  return dailyRate(monthlySalary, snapshot) / dailyHours;
}

export function proportionalBaseSalary(
  monthlySalary: number,
  workedDays: number,
  snapshot: LegalSnapshot,
): number {
  if (workedDays <= 0) return 0;
  return Math.min(
    Math.trunc(dailyRate(monthlySalary, snapshot) * workedDays),
    monthlySalary,
  );
}

export function transportSubsidyForDays(
  workedDays: number,
  snapshot: LegalSnapshot,
): number {
  if (workedDays <= 0) return 0;
  return Math.trunc(
    (snapshot.transportSubsidy * workedDays) / snapshot.referenceMonthDays,
  );
}

export function remuneratedRestPay(
  monthlySalary: number,
  paidDays: number,
  snapshot: LegalSnapshot,
): number {
  if (paidDays <= 0) return 0;
  return Math.trunc(dailyRate(monthlySalary, snapshot) * paidDays);
}

export function prestacionesBase(
  monthlySalary: number,
  snapshot: LegalSnapshot,
): number {
  return (
    monthlySalary +
    (qualifiesTransport(monthlySalary, snapshot) ? snapshot.transportSubsidy : 0)
  );
}

export function prestacionesAmount(
  monthlySalary: number,
  days: number,
  snapshot: LegalSnapshot,
): number {
  if (days <= 0) return 0;
  return Math.trunc(
    (prestacionesBase(monthlySalary, snapshot) * days) / snapshot.settlementYearDays,
  );
}

export function extraDominicalDiurnaFactor(snapshot: LegalSnapshot): number {
  return snapshot.extraDayFactor + (snapshot.dominicalFactor - 1.0);
}

export function extraDominicalNocturnaFactor(snapshot: LegalSnapshot): number {
  return snapshot.extraNightFactor + (snapshot.dominicalFactor - 1.0);
}
