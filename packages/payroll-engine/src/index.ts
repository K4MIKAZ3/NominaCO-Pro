export type {
  LegalSnapshot,
  LocalDate,
  PayrollLine,
  PayrollLineCode,
} from "./types.js";

export {
  SEED_SNAPSHOTS_2026,
  SNAPSHOT_2026_H1,
  SNAPSHOT_2026_H2,
  SNAPSHOT_2026_JUL_EARLY,
  qualifiesTransport,
  resolveLegalSnapshot,
  transportSalaryCap,
} from "./legalSnapshots.js";

export { contributionBase } from "./contributionBase.js";

export {
  dayOfWeekValue,
  isOfficialHoliday,
  isOrdinaryWorkday,
  isRestDay,
  isSunday,
  isWeekdayHoliday,
} from "./holidays.js";

export {
  addDays,
  addWeeks,
  compareYearMonths,
  daysBetween,
  endOfMonth,
  enumerateYearMonths,
  getLastNYearMonths,
  isAfter,
  isBefore,
  isYearMonthInRange,
  navigationYearMonthBounds,
  parseDate,
  parseTimeToMinutes,
  parseYearMonth,
  previousOrSameMonday,
  shiftYearMonth,
  startOfMonth,
  todayYearMonth,
  yearMonthPrefix,
  isoDate,
} from "./dates.js";

export type {
  ContractType,
  DayType,
  EmployeeProfile,
  HourBreakdown,
  LiquidationEstimate,
  ManualDeduction,
  MonthSummary,
  MonthlyPayroll,
  PayPeriodType,
  PayrollEntryType,
  PeriodPayrollSummary,
  RemuneratedRestDays,
  SemesterSettlement,
  WorkDayEntry,
  YearSettlementReport,
} from "./models.js";

export {
  addHourBreakdown,
  emptyHourBreakdown,
} from "./models.js";

export { calculateHours } from "./hourCalculator.js";
export { calculateRemuneratedRest } from "./remuneratedRest.js";

export {
  dailyRate,
  extraDominicalDiurnaFactor,
  extraDominicalNocturnaFactor,
  hourlyRate,
  prestacionesAmount,
  prestacionesBase,
  proportionalBaseSalary,
  remuneratedRestPay,
  transportSubsidyForDays,
} from "./rates.js";

export {
  applyManualEntries,
  buildPeriodSummary,
  computeMonthSummaries,
  computeMonthSummary,
  liquidateDateRange,
  liquidateMonth,
} from "./payrollEngine.js";

export { calculateSettlement } from "./settlement.js";
