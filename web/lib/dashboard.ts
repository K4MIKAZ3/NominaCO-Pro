import {
  buildExpenseSummary,
  currentYearMonth,
  type ExpenseRow,
  type ExpenseSummary,
} from "@/lib/expenses";
import { getSupabase } from "@/lib/supabase";
import {
  compareYearMonths,
  enumerateYearMonths,
  navigationYearMonthBounds,
  parseYearMonth,
  todayYearMonth,
  yearMonthPrefix,
} from "@/lib/payroll/dates";
import { computeMonthSummary } from "@/lib/payroll/payrollEngine";
import type { ContractType, PayPeriodType } from "@/lib/dashboard-api";
import type {
  AppPreferences,
  DayType,
  EmployeeProfile,
  ManualDeduction,
  MonthSummary,
  PayrollEntryType,
  WorkDayEntry,
} from "@/lib/payroll/models";
import type { LocalDate } from "@/lib/payroll/dates";

interface ProfileRow {
  name: string;
  document_id: string;
  job_title: string;
  monthly_salary: number;
  daily_hours: number;
  contract_type: string;
  pay_period_type: string;
  pending_vacation_days: number;
}

interface WorkDayRow {
  date_iso: string;
  start_time: string;
  end_time: string;
  day_type: string;
  notes: string;
}

interface ManualHolidayRow {
  date_iso: string;
  label: string;
}

interface AppPreferencesRow {
  default_start_hour: number;
  default_start_minute: number;
  default_end_hour: number;
  default_end_minute: number;
  use_24h_format: boolean;
  reminder_enabled: boolean;
  reminder_hour: number;
  reminder_minute: number;
}

const defaultPreferences = (): AppPreferences => ({
  defaultStartHour: 8,
  defaultStartMinute: 0,
  defaultEndHour: 16,
  defaultEndMinute: 30,
  use24HourFormat: true,
  reminderEnabled: false,
  reminderHour: 18,
  reminderMinute: 0,
});

function mapPreferences(row: AppPreferencesRow | null): AppPreferences {
  if (!row) return defaultPreferences();
  return {
    defaultStartHour: row.default_start_hour,
    defaultStartMinute: row.default_start_minute,
    defaultEndHour: row.default_end_hour,
    defaultEndMinute: row.default_end_minute,
    use24HourFormat: row.use_24h_format,
    reminderEnabled: row.reminder_enabled,
    reminderHour: row.reminder_hour,
    reminderMinute: row.reminder_minute,
  };
}

function deductionKey(d: ManualDeduction): string {
  return `${d.yearMonth}|${d.effectiveDate}|${d.label}|${d.amount}|${d.entryType}`;
}

interface ManualDeductionRow {
  id: string;
  year_month: string;
  effective_date_iso: string | null;
  label: string;
  amount: number;
  entry_type: string;
}

export interface DashboardData {
  profileName: string | null;
  profile: EmployeeProfile | null;
  workDays: WorkDayEntry[];
  manualHolidays: Set<LocalDate>;
  manualHolidayLabels: Map<LocalDate, string>;
  deductions: ManualDeduction[];
  deductionIds: Map<string, string>;
  expenseRows: ExpenseRow[];
  preferences: AppPreferences;
  summaries: MonthSummary[];
  expenseSummaries: ExpenseSummary[];
  minYearMonth: string;
  maxYearMonth: string;
  navMinYearMonth: string;
  navMaxYearMonth: string;
  todayYearMonth: string;
}

function parseDayType(value: string): DayType {
  if (value === "FESTIVO_DOMINICAL" || value === "FESTIVO_NOCTURNO") return value;
  return "NORMAL";
}

function parseEntryType(value: string): PayrollEntryType {
  if (value === "ADVANCE" || value === "BONUS") return value;
  return "DEDUCTION";
}

function parseContractType(value: string): ContractType {
  if (value === "OBRA_LABOR" || value === "TERMINO_DEFINIDO") return value;
  return "INDEFINIDO";
}

function parsePayPeriodType(value: string): PayPeriodType {
  if (value === "MONTHLY" || value === "WEEKLY" || value === "VENTEEN") return value;
  return "BIWEEKLY";
}

function mapProfile(row: ProfileRow): EmployeeProfile {
  return {
    name: row.name,
    documentId: row.document_id,
    jobTitle: row.job_title,
    monthlySalary: row.monthly_salary,
    dailyHours: row.daily_hours,
    contractType: parseContractType(row.contract_type),
    payPeriodType: parsePayPeriodType(row.pay_period_type),
    pendingVacationDays: row.pending_vacation_days ?? 0,
  };
}

function mapWorkDay(row: WorkDayRow): WorkDayEntry {
  return {
    date: row.date_iso,
    start: row.start_time,
    end: row.end_time,
    dayType: parseDayType(row.day_type),
    notes: row.notes,
  };
}

function mapDeduction(row: ManualDeductionRow): ManualDeduction {
  const effectiveDate =
    row.effective_date_iso ?? `${row.year_month}-01`;
  return {
    yearMonth: row.year_month,
    effectiveDate,
    label: row.label,
    amount: row.amount,
    entryType: parseEntryType(row.entry_type),
  };
}

function collectYearMonthRange(
  workDays: WorkDayEntry[],
  deductions: ManualDeduction[],
  expenseRows: ExpenseRow[],
): { minYearMonth: string; maxYearMonth: string } {
  const today = todayYearMonth();
  const keys = new Set<string>([today]);

  for (const entry of workDays) {
    keys.add(entry.date.slice(0, 7));
  }
  for (const deduction of deductions) {
    keys.add(deduction.yearMonth);
  }
  for (const expense of expenseRows) {
    if (!expense.is_fixed) {
      keys.add(expense.year_month);
    }
  }

  const sorted = Array.from(keys).sort(compareYearMonths);
  const minYearMonth = sorted[0] ?? today;
  const maxYearMonth = sorted[sorted.length - 1] ?? today;
  return { minYearMonth, maxYearMonth };
}

export async function fetchDashboard(userId: string): Promise<DashboardData> {
  const supabase = getSupabase();
  if (!supabase) {
    const nav = navigationYearMonthBounds();
    return {
      profileName: null,
      profile: null,
      workDays: [],
      manualHolidays: new Set(),
      manualHolidayLabels: new Map(),
      deductions: [],
      deductionIds: new Map(),
      expenseRows: [],
      preferences: defaultPreferences(),
      summaries: [],
      expenseSummaries: [],
      minYearMonth: nav.todayYearMonth,
      maxYearMonth: nav.todayYearMonth,
      navMinYearMonth: nav.minYearMonth,
      navMaxYearMonth: nav.maxYearMonth,
      todayYearMonth: nav.todayYearMonth,
    };
  }

  const [profileRes, workDaysRes, holidaysRes, deductionsRes, expensesRes, prefsRes] =
    await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("work_days").select("*").eq("user_id", userId),
    supabase.from("manual_holidays").select("*").eq("user_id", userId),
    supabase.from("manual_deductions").select("*").eq("user_id", userId),
    supabase.from("expense_entries").select("*").eq("user_id", userId),
    supabase.from("app_preferences").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  const queryError =
    profileRes.error ??
    workDaysRes.error ??
    holidaysRes.error ??
    deductionsRes.error ??
    expensesRes.error ??
    prefsRes.error;
  if (queryError) {
    throw new Error(queryError.message);
  }

  if (!profileRes.data) {
    const nav = navigationYearMonthBounds();
    return {
      profileName: null,
      profile: null,
      workDays: [],
      manualHolidays: new Set(),
      manualHolidayLabels: new Map(),
      deductions: [],
      deductionIds: new Map(),
      expenseRows: [],
      preferences: mapPreferences(prefsRes.data as AppPreferencesRow | null),
      summaries: [],
      expenseSummaries: [],
      minYearMonth: nav.todayYearMonth,
      maxYearMonth: nav.todayYearMonth,
      navMinYearMonth: nav.minYearMonth,
      navMaxYearMonth: nav.maxYearMonth,
      todayYearMonth: nav.todayYearMonth,
    };
  }

  const profile = mapProfile(profileRes.data as ProfileRow);
  const workDays = ((workDaysRes.data ?? []) as WorkDayRow[]).map(mapWorkDay);
  const holidayRows = (holidaysRes.data ?? []) as ManualHolidayRow[];
  const manualHolidays = new Set<LocalDate>(holidayRows.map((h) => h.date_iso));
  const manualHolidayLabels = new Map<LocalDate, string>(
    holidayRows.map((h) => [h.date_iso, h.label ?? ""]),
  );
  const deductionRows = (deductionsRes.data ?? []) as ManualDeductionRow[];
  const deductions = deductionRows.map(mapDeduction);
  const deductionIds = new Map<string, string>(
    deductionRows.map((row) => [deductionKey(mapDeduction(row)), row.id]),
  );
  const expenseRows = (expensesRes.data ?? []) as ExpenseRow[];
  const preferences = mapPreferences(prefsRes.data as AppPreferencesRow | null);

  const { minYearMonth, maxYearMonth } = collectYearMonthRange(workDays, deductions, expenseRows);
  const navBounds = navigationYearMonthBounds();
  const summaryEnd = compareYearMonths(maxYearMonth, navBounds.maxYearMonth) > 0
    ? maxYearMonth
    : navBounds.maxYearMonth;
  const yearMonths = enumerateYearMonths(minYearMonth, summaryEnd);

  const summaries = yearMonths.map((yearMonth) => {
    const { year, month } = parseYearMonth(yearMonth);
    return computeMonthSummary(profile, workDays, manualHolidays, deductions, year, month);
  });

  const expenseSummaries = summaries.map((summary) =>
    buildExpenseSummary(
      expenseRows,
      yearMonthPrefix(summary.year, summary.month),
      summary.netTotal,
    ),
  );

  return {
    profileName: profile.name || null,
    profile,
    workDays,
    manualHolidays,
    manualHolidayLabels,
    deductions,
    deductionIds,
    expenseRows,
    preferences,
    summaries,
    expenseSummaries,
    minYearMonth,
    maxYearMonth,
    navMinYearMonth: navBounds.minYearMonth,
    navMaxYearMonth: navBounds.maxYearMonth,
    todayYearMonth: navBounds.todayYearMonth,
  };
}
