import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "./server";
import type {
  Company,
  Employee,
  LegalParameterSet,
  OfficialHoliday,
  PayrollPeriod,
} from "@/lib/types";

export const ACTIVE_COMPANY_COOKIE = "ne_active_company";

export async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function getActiveCompanyId(): Promise<string | null> {
  return cookies().get(ACTIVE_COMPANY_COOKIE)?.value ?? null;
}

export async function listCompanies(): Promise<Company[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("companies")
    .select("id,name,nit,city,created_by,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Company[];
}

export async function getActiveCompany(): Promise<Company | null> {
  const companies = await listCompanies();
  if (companies.length === 0) return null;
  const activeId = await getActiveCompanyId();
  return companies.find((c) => c.id === activeId) ?? companies[0];
}

export async function listEmployees(companyId: string): Promise<Employee[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("employees")
    .select(
      "id,company_id,full_name,document_id,job_title,monthly_salary,daily_hours,contract_type,pay_period_type,pending_vacation_days,active,hired_at",
    )
    .eq("company_id", companyId)
    .order("full_name");
  if (error) throw error;
  return (data ?? []) as Employee[];
}

export async function listPayrollPeriods(companyId: string): Promise<PayrollPeriod[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("payroll_periods")
    .select("id,company_id,label,period_start,period_end,status,created_at,closed_at")
    .eq("company_id", companyId)
    .order("period_start", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PayrollPeriod[];
}

export async function listLegalSnapshots(): Promise<LegalParameterSet[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("legal_parameter_sets")
    .select("id,valid_from,valid_to,smmlv,transport_subsidy,weekly_hours_limit,dominical_factor")
    .order("valid_from");
  if (error) throw error;
  return (data ?? []) as LegalParameterSet[];
}

export async function listHolidays(): Promise<OfficialHoliday[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("official_holidays")
    .select("id,holiday_date,label,legal_basis")
    .order("holiday_date");
  if (error) throw error;
  return (data ?? []) as OfficialHoliday[];
}

export async function countActiveEmployees(companyId: string): Promise<number> {
  const { supabase } = await requireUser();
  const { count, error } = await supabase
    .from("employees")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("active", true);
  if (error) throw error;
  return count ?? 0;
}
