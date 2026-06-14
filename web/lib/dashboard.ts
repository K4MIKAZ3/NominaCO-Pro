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
  parseYearMonth,
  yearMonthPrefix,
} from "@/lib/payroll/dates";
import { computeMonthSummary } from "@/lib/payroll/payrollEngine";
import type {
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
}

interface ManualDeductionRow {
  year_month: string;
  effective_date_iso: string | null;
  label: string;
  amount: number;
  entry_type: string;
}

export interface DashboardData {
  profileName: string | null;
  summaries: MonthSummary[];
  expenseSummaries: ExpenseSummary[];
  minYearMonth: string;
  maxYearMonth: string;
}

function parseDayType(value: string): DayType {
  if (value === "FESTIVO_DOMINICAL" || value === "FESTIVO_NOCTURNO") return value;
  return "NORMAL";
}

function parseEntryType(value: string): PayrollEntryType {
  if (value === "ADVANCE" || value === "BONUS") return value;
  return "DEDUCTION";
}

function mapProfile(row: ProfileRow): EmployeeProfile {
  return {
    name: row.name,
    documentId: row.document_id,
    jobTitle: row.job_title,
    monthlySalary: row.monthly_salary,
    dailyHours: row.daily_hours,
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
  const maxYearMonth = currentYearMonth();
  const keys = new Set<string>([maxYearMonth]);

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
  const minYearMonth = sorted[0] ?? maxYearMonth;
  return { minYearMonth, maxYearMonth };
}

export async function fetchDashboard(userId: string): Promise<DashboardData> {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      profileName: null,
      summaries: [],
      expenseSummaries: [],
      minYearMonth: currentYearMonth(),
      maxYearMonth: currentYearMonth(),
    };
  }

  const [profileRes, workDaysRes, holidaysRes, deductionsRes, expensesRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("work_days").select("*").eq("user_id", userId),
    supabase.from("manual_holidays").select("*").eq("user_id", userId),
    supabase.from("manual_deductions").select("*").eq("user_id", userId),
    supabase.from("expense_entries").select("*").eq("user_id", userId),
  ]);

  const queryError =
    profileRes.error ??
    workDaysRes.error ??
    holidaysRes.error ??
    deductionsRes.error ??
    expensesRes.error;
  if (queryError) {
    throw new Error(queryError.message);
  }

  if (!profileRes.data) {
    const now = currentYearMonth();
    return {
      profileName: null,
      summaries: [],
      expenseSummaries: [],
      minYearMonth: now,
      maxYearMonth: now,
    };
  }

  const profile = mapProfile(profileRes.data as ProfileRow);
  const workDays = ((workDaysRes.data ?? []) as WorkDayRow[]).map(mapWorkDay);
  const manualHolidays = new Set<LocalDate>(
    ((holidaysRes.data ?? []) as ManualHolidayRow[]).map((h) => h.date_iso),
  );
  const deductions = ((deductionsRes.data ?? []) as ManualDeductionRow[]).map(mapDeduction);
  const expenseRows = (expensesRes.data ?? []) as ExpenseRow[];

  const { minYearMonth, maxYearMonth } = collectYearMonthRange(workDays, deductions, expenseRows);
  const yearMonths = enumerateYearMonths(minYearMonth, maxYearMonth);

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
    summaries,
    expenseSummaries,
    minYearMonth,
    maxYearMonth,
  };
}
