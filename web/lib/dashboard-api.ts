import { getSupabase } from "@/lib/supabase";
import type { DayType, WorkDayEntry } from "@/lib/payroll/models";

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
