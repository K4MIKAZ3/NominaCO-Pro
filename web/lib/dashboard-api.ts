import type { ExpenseRow } from "@/lib/expenses";
import { getSupabase } from "@/lib/supabase";
import type { AppPreferences, DayType, PayrollEntryType, WorkDayEntry } from "@/lib/payroll/models";

export type ContractType = "INDEFINIDO" | "OBRA_LABOR" | "TERMINO_DEFINIDO";
export type PayPeriodType = "MONTHLY" | "WEEKLY" | "BIWEEKLY" | "VENTEEN";

export interface ProfileRecord {
  name: string;
  documentId: string;
  jobTitle: string;
  monthlySalary: number;
  dailyHours: number;
  contractType: ContractType;
  payPeriodType: PayPeriodType;
  pendingVacationDays: number;
}

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

export const CONTRACT_TYPE_OPTIONS: { value: ContractType; label: string }[] = [
  { value: "INDEFINIDO", label: "Indefinido" },
  { value: "OBRA_LABOR", label: "Obra o labor" },
  { value: "TERMINO_DEFINIDO", label: "Término definido" },
];

export const PAY_PERIOD_OPTIONS: { value: PayPeriodType; label: string }[] = [
  { value: "BIWEEKLY", label: "Quincenal" },
  { value: "MONTHLY", label: "Mensual" },
  { value: "WEEKLY", label: "Semanal" },
  { value: "VENTEEN", label: "Ventena (21 días)" },
];

export const DAY_TYPE_OPTIONS: { value: DayType; label: string }[] = [
  { value: "NORMAL", label: "Normal" },
  { value: "FESTIVO_DOMINICAL", label: "Dominical / festivo" },
  { value: "FESTIVO_NOCTURNO", label: "Festivo nocturno" },
];

export const emptyProfile = (): ProfileRecord => ({
  name: "",
  documentId: "",
  jobTitle: "",
  monthlySalary: 0,
  dailyHours: 8,
  contractType: "INDEFINIDO",
  payPeriodType: "BIWEEKLY",
  pendingVacationDays: 0,
});

function parseContractType(value: string): ContractType {
  if (value === "OBRA_LABOR" || value === "TERMINO_DEFINIDO") return value;
  return "INDEFINIDO";
}

function parsePayPeriodType(value: string): PayPeriodType {
  if (value === "MONTHLY" || value === "WEEKLY" || value === "VENTEEN") return value;
  return "BIWEEKLY";
}

function parseDayType(value: string): DayType {
  if (value === "FESTIVO_DOMINICAL" || value === "FESTIVO_NOCTURNO") return value;
  return "NORMAL";
}

function mapProfileRow(row: ProfileRow): ProfileRecord {
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

function toProfileRow(userId: string, profile: ProfileRecord) {
  return {
    user_id: userId,
    name: profile.name.trim(),
    document_id: profile.documentId.trim(),
    job_title: profile.jobTitle.trim(),
    monthly_salary: Math.max(0, Math.trunc(profile.monthlySalary)),
    daily_hours: Math.min(12, Math.max(1, Math.trunc(profile.dailyHours))),
    contract_type: profile.contractType,
    pay_period_type: profile.payPeriodType,
    pending_vacation_days: Math.max(0, Math.trunc(profile.pendingVacationDays)),
    updated_at: new Date().toISOString(),
  };
}

function mapWorkDayRow(row: WorkDayRow): WorkDayEntry {
  return {
    date: row.date_iso,
    start: row.start_time.slice(0, 5),
    end: row.end_time.slice(0, 5),
    dayType: parseDayType(row.day_type),
    notes: row.notes ?? "",
  };
}

export async function fetchProfileRecord(userId: string): Promise<ProfileRecord | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapProfileRow(data as ProfileRow);
}

export async function saveProfileRecord(userId: string, profile: ProfileRecord): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase no configurado");

  if (!profile.name.trim()) {
    throw new Error("El nombre es obligatorio.");
  }
  if (profile.monthlySalary <= 0) {
    throw new Error("Indica un salario mensual válido.");
  }

  const { error } = await supabase
    .from("profiles")
    .upsert(toProfileRow(userId, profile), { onConflict: "user_id" });

  if (error) throw new Error(error.message);
}

export async function fetchWorkDaysForMonth(
  userId: string,
  yearMonth: string,
): Promise<WorkDayEntry[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const prefix = `${yearMonth}-`;
  const { data, error } = await supabase
    .from("work_days")
    .select("*")
    .eq("user_id", userId)
    .like("date_iso", `${prefix}%`)
    .order("date_iso", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data ?? []) as WorkDayRow[]).map(mapWorkDayRow);
}

export async function upsertWorkDay(userId: string, entry: WorkDayEntry): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase no configurado");

  if (!entry.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    throw new Error("Fecha inválida.");
  }
  if (!entry.start || !entry.end) {
    throw new Error("Indica hora de entrada y salida.");
  }

  const { error } = await supabase.from("work_days").upsert(
    {
      user_id: userId,
      date_iso: entry.date,
      start_time: entry.start,
      end_time: entry.end,
      day_type: entry.dayType,
      notes: entry.notes.trim(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,date_iso" },
  );

  if (error) throw new Error(error.message);
}

export async function deleteWorkDay(userId: string, dateIso: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase no configurado");

  const { error } = await supabase
    .from("work_days")
    .delete()
    .eq("user_id", userId)
    .eq("date_iso", dateIso);

  if (error) throw new Error(error.message);
}

export function dayTypeLabel(dayType: DayType): string {
  return DAY_TYPE_OPTIONS.find((option) => option.value === dayType)?.label ?? dayType;
}

// --- Manual holidays ---

export interface ManualHolidayRecord {
  dateIso: string;
  label: string;
}

export async function fetchManualHolidays(userId: string): Promise<ManualHolidayRecord[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("manual_holidays")
    .select("*")
    .eq("user_id", userId)
    .order("date_iso", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data ?? []) as { date_iso: string; label: string }[]).map((row) => ({
    dateIso: row.date_iso,
    label: row.label ?? "",
  }));
}

export async function upsertManualHoliday(
  userId: string,
  dateIso: string,
  label: string = "",
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase no configurado");

  const { error } = await supabase.from("manual_holidays").upsert(
    {
      user_id: userId,
      date_iso: dateIso,
      label: label.trim(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,date_iso" },
  );

  if (error) throw new Error(error.message);
}

export async function deleteManualHoliday(userId: string, dateIso: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase no configurado");

  const { error } = await supabase
    .from("manual_holidays")
    .delete()
    .eq("user_id", userId)
    .eq("date_iso", dateIso);

  if (error) throw new Error(error.message);
}

// --- App preferences ---

export const defaultAppPreferences = (): AppPreferences => ({
  defaultStartHour: 8,
  defaultStartMinute: 0,
  defaultEndHour: 16,
  defaultEndMinute: 30,
  use24HourFormat: true,
  reminderEnabled: false,
  reminderHour: 18,
  reminderMinute: 0,
});

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

function mapAppPreferences(row: AppPreferencesRow): AppPreferences {
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

function toAppPreferencesRow(userId: string, prefs: AppPreferences) {
  return {
    user_id: userId,
    default_start_hour: prefs.defaultStartHour,
    default_start_minute: prefs.defaultStartMinute,
    default_end_hour: prefs.defaultEndHour,
    default_end_minute: prefs.defaultEndMinute,
    use_24h_format: prefs.use24HourFormat,
    reminder_enabled: prefs.reminderEnabled,
    reminder_hour: prefs.reminderHour,
    reminder_minute: prefs.reminderMinute,
    updated_at: new Date().toISOString(),
  };
}

export async function fetchAppPreferences(userId: string): Promise<AppPreferences> {
  const supabase = getSupabase();
  if (!supabase) return defaultAppPreferences();

  const { data, error } = await supabase
    .from("app_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return defaultAppPreferences();
  return mapAppPreferences(data as AppPreferencesRow);
}

export async function saveAppPreferences(userId: string, prefs: AppPreferences): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase no configurado");

  const { error } = await supabase
    .from("app_preferences")
    .upsert(toAppPreferencesRow(userId, prefs), { onConflict: "user_id" });

  if (error) throw new Error(error.message);
}

// --- Manual deductions ---

export interface ManualDeductionRecord {
  id: string;
  yearMonth: string;
  effectiveDate: string;
  label: string;
  amount: number;
  entryType: PayrollEntryType;
}

interface ManualDeductionRow {
  id: string;
  year_month: string;
  effective_date_iso: string | null;
  label: string;
  amount: number;
  entry_type: string;
}

function mapManualDeductionRow(row: ManualDeductionRow): ManualDeductionRecord {
  return {
    id: row.id,
    yearMonth: row.year_month,
    effectiveDate: row.effective_date_iso ?? `${row.year_month}-01`,
    label: row.label,
    amount: row.amount,
    entryType: parseEntryType(row.entry_type),
  };
}

function parseEntryType(value: string): PayrollEntryType {
  if (value === "ADVANCE" || value === "BONUS") return value;
  return "DEDUCTION";
}

export async function fetchManualDeductionsForMonth(
  userId: string,
  yearMonth: string,
): Promise<ManualDeductionRecord[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("manual_deductions")
    .select("*")
    .eq("user_id", userId)
    .eq("year_month", yearMonth)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as ManualDeductionRow[]).map(mapManualDeductionRow);
}

export async function addManualDeduction(
  userId: string,
  entry: Omit<ManualDeductionRecord, "id">,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase no configurado");

  if (!entry.label.trim()) throw new Error("Indica un concepto.");
  if (entry.amount <= 0) throw new Error("Indica un valor válido.");

  const { error } = await supabase.from("manual_deductions").insert({
    user_id: userId,
    year_month: entry.yearMonth,
    effective_date_iso: entry.effectiveDate,
    label: entry.label.trim(),
    amount: Math.trunc(entry.amount),
    entry_type: entry.entryType,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
}

export async function deleteManualDeduction(userId: string, id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase no configurado");

  const { error } = await supabase
    .from("manual_deductions")
    .delete()
    .eq("user_id", userId)
    .eq("id", id);

  if (error) throw new Error(error.message);
}

// --- Expense entries ---

export interface ExpenseEntryInput {
  yearMonth: string;
  dateIso: string;
  label: string;
  amount: number;
  category: string;
  isFixed: boolean;
}

export async function fetchExpenseEntriesForMonth(
  userId: string,
  yearMonth: string,
): Promise<ExpenseRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("expense_entries")
    .select("*")
    .eq("user_id", userId)
    .or(`year_month.eq.${yearMonth},is_fixed.eq.true`)
    .order("date_iso", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ExpenseRow[];
}

export async function addExpenseEntry(userId: string, entry: ExpenseEntryInput): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase no configurado");

  if (!entry.label.trim()) throw new Error("Indica un concepto.");
  if (entry.amount <= 0) throw new Error("Indica un valor válido.");

  const { error } = await supabase.from("expense_entries").insert({
    user_id: userId,
    year_month: entry.yearMonth,
    date_iso: entry.dateIso,
    label: entry.label.trim(),
    amount: Math.trunc(entry.amount),
    category: entry.category || "OTHER",
    is_fixed: entry.isFixed,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
}

export async function deleteExpenseEntry(userId: string, id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase no configurado");

  const { error } = await supabase
    .from("expense_entries")
    .delete()
    .eq("user_id", userId)
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function deleteOwnAccount(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase no configurado");

  const { error } = await supabase.rpc("delete_own_account");
  if (error) throw new Error(error.message);
}
