import * as Law from "./colombiaLaborLaw2026";
import { calculateHours } from "./hourCalculator";
import { calculateRemuneratedRest } from "./remuneratedRestCalculator";
import {
  addDays,
  daysBetween,
  endOfMonth,
  getLastNYearMonths,
  isAfter,
  startOfMonth,
  type LocalDate,
} from "./dates";
import {
  addHourBreakdown,
  emptyHourBreakdown,
  type EmployeeProfile,
  type ManualDeduction,
  type MonthSummary,
  type MonthlyPayroll,
  type PayrollLine,
  type WorkDayEntry,
} from "./models";

function pay(hourly: number, hours: number, factor: number): number {
  if (hours <= 0) return 0;
  return Math.trunc(hourly * hours * factor);
}

export function liquidateMonth(
  profile: EmployeeProfile,
  year: number,
  month: number,
  entries: WorkDayEntry[],
  manualHolidays: Set<LocalDate>,
): MonthlyPayroll {
  return liquidateDateRange(
    profile,
    startOfMonth(year, month),
    endOfMonth(year, month),
    entries,
    manualHolidays,
    year,
    month,
  );
}

export function liquidateDateRange(
  profile: EmployeeProfile,
  start: LocalDate,
  end: LocalDate,
  entries: WorkDayEntry[],
  manualHolidays: Set<LocalDate>,
  referenceYear: number = parseInt(start.slice(0, 4), 10),
  referenceMonth: number = parseInt(start.slice(5, 7), 10),
): MonthlyPayroll {
  const dailyRateVal = Law.dailyRate(profile.monthlySalary);
  const hourly = Law.hourlyRate(profile.monthlySalary, profile.dailyHours);

  let breakdown = emptyHourBreakdown();
  let workedDays = 0;
  let restDays = 0;

  let date = start;
  while (!isAfter(date, end)) {
    if (Law.isRestDay(date, manualHolidays)) restDays++;
    const entry = entries.find((e) => e.date === date);
    if (entry) {
      workedDays++;
      const dayBreakdown = calculateHours(
        entry,
        profile.dailyHours,
        Law.isRestDay(date, manualHolidays),
      );
      breakdown = addHourBreakdown(breakdown, dayBreakdown);
    }
    date = addDays(date, 1);
  }

  const workedDates = new Set(entries.map((e) => e.date));
  const remuneratedRest = calculateRemuneratedRest(start, end, workedDates, manualHolidays);
  const dominicalPay = Law.remuneratedRestPay(profile.monthlySalary, remuneratedRest.paidSundays);
  const holidayPay = Law.remuneratedRestPay(
    profile.monthlySalary,
    remuneratedRest.paidWeekdayHolidays,
  );

  const midOffset = Math.max(0, Math.floor(daysBetween(start, end) / 2));
  const midDate = addDays(start, midOffset);
  const domFactor = Law.dominicalFactor(midDate);

  const baseProportional = Law.proportionalBaseSalary(profile.monthlySalary, workedDays);
  const transport = Law.qualifiesTransport(profile.monthlySalary)
    ? Law.transportSubsidyForDays(workedDays)
    : 0;

  const recargoNocturno = pay(hourly, breakdown.nocturnaOrdinaria, Law.Factors.NOCTURNA - 1.0);
  const extraDiurna = pay(hourly, breakdown.extraDiurna, Law.Factors.EXTRA_DIURNA);
  const extraNocturna = pay(hourly, breakdown.extraNocturna, Law.Factors.EXTRA_NOCTURNA);
  const recargoDomDiurno = pay(hourly, breakdown.dominicalDiurna, domFactor - 1.0);
  const recargoDomNocturno = pay(
    hourly,
    breakdown.dominicalNocturna,
    domFactor - 1.0 + (Law.Factors.NOCTURNA - 1.0),
  );
  const extraDomDiurna = pay(
    hourly,
    breakdown.extraDominicalDiurna,
    Law.extraDominicalDiurnaFactor(midDate),
  );
  const extraDomNocturna = pay(
    hourly,
    breakdown.extraDominicalNocturna,
    Law.extraDominicalNocturnaFactor(midDate),
  );

  const earnings: PayrollLine[] = [];
  earnings.push({ label: "Salario base proporcional", amount: baseProportional, code: "SBP" });
  if (transport > 0) earnings.push({ label: "Subsidio de transporte", amount: transport, code: "ST" });
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
  const salud = Math.trunc(gross * Law.DESCUENTO_SALUD);
  const pension = Math.trunc(gross * Law.DESCUENTO_PENSION);
  const legalDeductions: PayrollLine[] = [
    { label: "Aporte salud (4%)", amount: salud, isDeduction: true, code: "SAL" },
    { label: "Aporte pensión (4%)", amount: pension, isDeduction: true, code: "PEN" },
  ];

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
    netTotal: gross - salud - pension,
  };
}

export function applyManualEntries(
  payroll: MonthlyPayroll,
  manual: ManualDeduction[],
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
  }));
  const bonusTotal = bonuses.reduce((s, b) => s + b.amount, 0);
  const deductionTotal = deductions.reduce((s, d) => s + d.amount, 0);

  const gross = payroll.grossTotal + bonusTotal;
  const salud = Math.trunc(gross * Law.DESCUENTO_SALUD);
  const pension = Math.trunc(gross * Law.DESCUENTO_PENSION);
  const legalDeductions: PayrollLine[] = [
    { label: "Aporte salud (4%)", amount: salud, isDeduction: true, code: "SAL" },
    { label: "Aporte pensión (4%)", amount: pension, isDeduction: true, code: "PEN" },
  ];

  return {
    ...payroll,
    earnings: [...payroll.earnings, ...bonusLines],
    manualBonuses: bonusLines,
    manualDeductions: deductionLines,
    legalDeductions,
    grossTotal: gross,
    netTotal: gross - salud - pension - deductionTotal,
  };
}

export function computeMonthSummaries(
  profile: EmployeeProfile,
  allWorkDays: WorkDayEntry[],
  manualHolidayDates: Set<LocalDate>,
  allDeductions: ManualDeduction[],
  monthCount: number = 3,
): MonthSummary[] {
  const months = getLastNYearMonths(monthCount);

  return months.map(({ year, month }) => {
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    const entries = allWorkDays.filter((e) => e.date.startsWith(prefix));
    const monthEntries = allDeductions.filter((d) => d.yearMonth === prefix);
    const payroll = applyManualEntries(
      liquidateMonth(profile, year, month, entries, manualHolidayDates),
      monthEntries.filter((d) => d.entryType !== "ADVANCE"),
    );
    return {
      year,
      month,
      grossTotal: payroll.grossTotal,
      legalDeductions: payroll.legalDeductions.reduce((s, d) => s + d.amount, 0),
      manualDeductions: payroll.manualDeductions.reduce((s, d) => s + d.amount, 0),
      netTotal: payroll.netTotal,
    };
  });
}
