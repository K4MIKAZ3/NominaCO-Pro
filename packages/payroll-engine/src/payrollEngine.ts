import { contributionBase } from "./contributionBase.js";
import {
  addDays,
  daysBetween,
  endOfMonth,
  getLastNYearMonths,
  isAfter,
  startOfMonth,
  type LocalDate,
} from "./dates.js";
import { isRestDay } from "./holidays.js";
import { calculateHours } from "./hourCalculator.js";
import { qualifiesTransport, resolveLegalSnapshot } from "./legalSnapshots.js";
import {
  addHourBreakdown,
  emptyHourBreakdown,
  type EmployeeProfile,
  type ManualDeduction,
  type MonthSummary,
  type MonthlyPayroll,
  type PeriodPayrollSummary,
  type WorkDayEntry,
} from "./models.js";
import {
  dailyRate,
  extraDominicalDiurnaFactor,
  extraDominicalNocturnaFactor,
  hourlyRate,
  proportionalBaseSalary,
  remuneratedRestPay,
  transportSubsidyForDays,
} from "./rates.js";
import { calculateRemuneratedRest } from "./remuneratedRest.js";
import type { LegalSnapshot, PayrollLine } from "./types.js";

function pay(hourly: number, hours: number, factor: number): number {
  if (hours <= 0) return 0;
  return Math.trunc(hourly * hours * factor);
}

function legalDeductionsFromIbc(
  ibc: number,
  snapshot: LegalSnapshot,
): PayrollLine[] {
  const salud = Math.trunc(ibc * snapshot.healthEmployeeRate);
  const pension = Math.trunc(ibc * snapshot.pensionEmployeeRate);
  return [
    { label: "Aporte salud (4%)", amount: salud, isDeduction: true, code: "SAL" },
    { label: "Aporte pensión (4%)", amount: pension, isDeduction: true, code: "PEN" },
  ];
}

export function liquidateMonth(
  profile: EmployeeProfile,
  year: number,
  month: number,
  entries: WorkDayEntry[],
  manualHolidays: Set<LocalDate> = new Set(),
  snapshots?: LegalSnapshot[],
): MonthlyPayroll {
  return liquidateDateRange(
    profile,
    startOfMonth(year, month),
    endOfMonth(year, month),
    entries,
    manualHolidays,
    year,
    month,
    snapshots,
  );
}

export function liquidateDateRange(
  profile: EmployeeProfile,
  start: LocalDate,
  end: LocalDate,
  entries: WorkDayEntry[],
  manualHolidays: Set<LocalDate> = new Set(),
  referenceYear: number = parseInt(start.slice(0, 4), 10),
  referenceMonth: number = parseInt(start.slice(5, 7), 10),
  snapshots?: LegalSnapshot[],
): MonthlyPayroll {
  const midOffset = Math.max(0, Math.floor(daysBetween(start, end) / 2));
  const midDate = addDays(start, midOffset);
  const snapshot = resolveLegalSnapshot(midDate, snapshots);

  const dailyRateVal = dailyRate(profile.monthlySalary, snapshot);
  const hourly = hourlyRate(profile.monthlySalary, profile.dailyHours, snapshot);

  let breakdown = emptyHourBreakdown();
  let workedDays = 0;
  let restDays = 0;

  let date = start;
  while (!isAfter(date, end)) {
    if (isRestDay(date, snapshot, manualHolidays)) restDays++;
    const entry = entries.find((e) => e.date === date);
    if (entry) {
      workedDays++;
      const daySnapshot = resolveLegalSnapshot(date, snapshots);
      const dayBreakdown = calculateHours(
        entry,
        profile.dailyHours,
        isRestDay(date, daySnapshot, manualHolidays),
        daySnapshot,
      );
      breakdown = addHourBreakdown(breakdown, dayBreakdown);
    }
    date = addDays(date, 1);
  }

  const workedDates = new Set(entries.map((e) => e.date));
  const remuneratedRest = calculateRemuneratedRest(
    start,
    end,
    workedDates,
    snapshot,
    manualHolidays,
  );
  const dominicalPay = remuneratedRestPay(
    profile.monthlySalary,
    remuneratedRest.paidSundays,
    snapshot,
  );
  const holidayPay = remuneratedRestPay(
    profile.monthlySalary,
    remuneratedRest.paidWeekdayHolidays,
    snapshot,
  );

  const baseProportional = proportionalBaseSalary(
    profile.monthlySalary,
    workedDays,
    snapshot,
  );
  const transport = qualifiesTransport(profile.monthlySalary, snapshot)
    ? transportSubsidyForDays(workedDays, snapshot)
    : 0;

  const domFactor = snapshot.dominicalFactor;
  const recargoNocturno = pay(
    hourly,
    breakdown.nocturnaOrdinaria,
    snapshot.nightOrdinaryFactor - 1.0,
  );
  const extraDiurna = pay(hourly, breakdown.extraDiurna, snapshot.extraDayFactor);
  const extraNocturna = pay(hourly, breakdown.extraNocturna, snapshot.extraNightFactor);
  const recargoDomDiurno = pay(hourly, breakdown.dominicalDiurna, domFactor - 1.0);
  const recargoDomNocturno = pay(
    hourly,
    breakdown.dominicalNocturna,
    domFactor - 1.0 + (snapshot.nightOrdinaryFactor - 1.0),
  );
  const extraDomDiurna = pay(
    hourly,
    breakdown.extraDominicalDiurna,
    extraDominicalDiurnaFactor(snapshot),
  );
  const extraDomNocturna = pay(
    hourly,
    breakdown.extraDominicalNocturna,
    extraDominicalNocturnaFactor(snapshot),
  );

  const earnings: PayrollLine[] = [];
  earnings.push({ label: "Salario base proporcional", amount: baseProportional, code: "SBP" });
  if (transport > 0) {
    earnings.push({ label: "Subsidio de transporte", amount: transport, code: "ST" });
  }
  if (dominicalPay > 0) {
    earnings.push({
      label: `Dominical remunerado (${remuneratedRest.paidSundays} día(s))`,
      amount: dominicalPay,
      code: "DRD",
    });
  }
  if (holidayPay > 0) {
    earnings.push({
      label: `Festivo remunerado (${remuneratedRest.paidWeekdayHolidays} día(s))`,
      amount: holidayPay,
      code: "FER",
    });
  }
  if (recargoNocturno > 0) {
    earnings.push({
      label: "Recargo nocturno (+35%)",
      amount: recargoNocturno,
      code: "RN",
      hours: breakdown.nocturnaOrdinaria,
    });
  }
  if (extraDiurna > 0) {
    earnings.push({
      label: "Horas extra diurnas (+25%)",
      amount: extraDiurna,
      code: "HED",
      hours: breakdown.extraDiurna,
    });
  }
  if (extraNocturna > 0) {
    earnings.push({
      label: "Horas extra nocturnas (+75%)",
      amount: extraNocturna,
      code: "HEN",
      hours: breakdown.extraNocturna,
    });
  }
  if (recargoDomDiurno > 0) {
    earnings.push({
      label: "Recargo dominical/festivo diurno",
      amount: recargoDomDiurno,
      code: "RDD",
      hours: breakdown.dominicalDiurna,
    });
  }
  if (recargoDomNocturno > 0) {
    earnings.push({
      label: "Recargo dominical/festivo nocturno",
      amount: recargoDomNocturno,
      code: "RDN",
      hours: breakdown.dominicalNocturna,
    });
  }
  if (extraDomDiurna > 0) {
    earnings.push({
      label: "Extra dominical/festivo diurna",
      amount: extraDomDiurna,
      code: "EDD",
      hours: breakdown.extraDominicalDiurna,
    });
  }
  if (extraDomNocturna > 0) {
    earnings.push({
      label: "Extra dominical/festivo nocturna",
      amount: extraDomNocturna,
      code: "EDN",
      hours: breakdown.extraDominicalNocturna,
    });
  }

  const gross = earnings.reduce((sum, e) => sum + e.amount, 0);
  const ibc = contributionBase(earnings);
  const legalDeductions = legalDeductionsFromIbc(ibc, snapshot);
  const legalTotal = legalDeductions.reduce((s, d) => s + d.amount, 0);

  return {
    year: referenceYear,
    month: referenceMonth,
    workedDays,
    restDays,
    remuneratedRestDays: remuneratedRest.totalDays,
    dailyRate: Math.trunc(dailyRateVal),
    hourlyRate: hourly,
    breakdown,
    earnings,
    legalDeductions,
    manualDeductions: [],
    manualBonuses: [],
    grossTotal: gross,
    ibcTotal: ibc,
    netTotal: gross - legalTotal,
  };
}

export function applyManualEntries(
  payroll: MonthlyPayroll,
  manual: ManualDeduction[],
  snapshot: LegalSnapshot = resolveLegalSnapshot(
    `${payroll.year}-${String(payroll.month).padStart(2, "0")}-15`,
  ),
): MonthlyPayroll {
  const deductions = manual.filter((m) => m.entryType === "DEDUCTION");
  const bonuses = manual.filter((m) => m.entryType === "BONUS");
  if (deductions.length === 0 && bonuses.length === 0) return payroll;

  const bonusLines: PayrollLine[] = bonuses.map((b) => ({
    label: b.label,
    amount: b.amount,
    code: "BON",
  }));
  const deductionLines: PayrollLine[] = deductions.map((d) => ({
    label: d.label,
    amount: d.amount,
    isDeduction: true,
    code: "DED",
  }));
  const bonusTotal = bonuses.reduce((s, b) => s + b.amount, 0);
  const deductionTotal = deductions.reduce((s, d) => s + d.amount, 0);

  const earnings = [...payroll.earnings, ...bonusLines];
  const gross = payroll.grossTotal + bonusTotal;
  const ibc = contributionBase(earnings);
  const legalDeductions = legalDeductionsFromIbc(ibc, snapshot);
  const legalTotal = legalDeductions.reduce((s, d) => s + d.amount, 0);

  return {
    ...payroll,
    earnings,
    manualBonuses: bonusLines,
    manualDeductions: deductionLines,
    legalDeductions,
    grossTotal: gross,
    ibcTotal: ibc,
    netTotal: gross - legalTotal - deductionTotal,
  };
}

export function buildPeriodSummary(
  payroll: MonthlyPayroll,
  periodLabel: string,
  periodStart: LocalDate,
  periodEnd: LocalDate,
  manualEntries: ManualDeduction[],
  snapshot?: LegalSnapshot,
): PeriodPayrollSummary {
  const deductions = manualEntries.filter((m) => m.entryType === "DEDUCTION");
  const advances = manualEntries.filter((m) => m.entryType === "ADVANCE");
  const bonuses = manualEntries.filter((m) => m.entryType === "BONUS");
  const payrollWithEntries = applyManualEntries(
    payroll,
    [...deductions, ...bonuses],
    snapshot,
  );
  const advancesTotal = advances.reduce((s, a) => s + a.amount, 0);
  return {
    periodLabel,
    periodStart,
    periodEnd,
    workedDays: payroll.workedDays,
    dailyRate: payroll.dailyRate,
    grossTotal: payrollWithEntries.grossTotal,
    legalDeductions: payrollWithEntries.legalDeductions.reduce((s, d) => s + d.amount, 0),
    manualDeductions: deductions.reduce((s, d) => s + d.amount, 0),
    bonuses: bonuses.reduce((s, b) => s + b.amount, 0),
    advances: advancesTotal,
    netTotal: payrollWithEntries.netTotal,
    pendingBalance: payrollWithEntries.netTotal - advancesTotal,
  };
}

export function computeMonthSummary(
  profile: EmployeeProfile,
  allWorkDays: WorkDayEntry[],
  manualHolidayDates: Set<LocalDate>,
  allDeductions: ManualDeduction[],
  year: number,
  month: number,
  snapshots?: LegalSnapshot[],
): MonthSummary {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const entries = allWorkDays.filter((e) => e.date.startsWith(prefix));
  const monthEntries = allDeductions.filter((d) => d.yearMonth === prefix);
  const mid = resolveLegalSnapshot(`${prefix}-15`, snapshots);
  const payroll = applyManualEntries(
    liquidateMonth(profile, year, month, entries, manualHolidayDates, snapshots),
    monthEntries.filter((d) => d.entryType !== "ADVANCE"),
    mid,
  );
  return {
    year,
    month,
    grossTotal: payroll.grossTotal,
    legalDeductions: payroll.legalDeductions.reduce((s, d) => s + d.amount, 0),
    manualDeductions: payroll.manualDeductions.reduce((s, d) => s + d.amount, 0),
    netTotal: payroll.netTotal,
  };
}

export function computeMonthSummaries(
  profile: EmployeeProfile,
  allWorkDays: WorkDayEntry[],
  manualHolidayDates: Set<LocalDate>,
  allDeductions: ManualDeduction[],
  monthCount: number = 3,
  snapshots?: LegalSnapshot[],
): MonthSummary[] {
  return getLastNYearMonths(monthCount).map(({ year, month }) =>
    computeMonthSummary(
      profile,
      allWorkDays,
      manualHolidayDates,
      allDeductions,
      year,
      month,
      snapshots,
    ),
  );
}
