"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { CalendarPanel } from "@/components/CalendarPanel";
import { ExpensesPanel } from "@/components/ExpensesPanel";
import { PayrollPanel } from "@/components/PayrollPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import type { ManualDeductionRecord } from "@/lib/dashboard-api";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { site } from "@/lib/site";
import type { DashboardData } from "@/lib/dashboard";
import { isYearMonthInRange, shiftYearMonth, todayYearMonth } from "@/lib/payroll/dates";

type DashboardTab = "calendario" | "nomina" | "gastos" | "ajustes";

const TABS: { id: DashboardTab; label: string; short: string }[] = [
  { id: "calendario", label: "Calendario", short: "Cal." },
  { id: "nomina", label: "Nómina", short: "Nóm." },
  { id: "gastos", label: "Gastos", short: "Gast." },
  { id: "ajustes", label: "Ajustes", short: "Aj." },
];

const emptyData = (now: string): DashboardData => {
  const nav = {
    navMinYearMonth: shiftYearMonth(now, -60),
    navMaxYearMonth: shiftYearMonth(now, 24),
    todayYearMonth: now,
  };
  return {
    profileName: null,
    profile: null,
    workDays: [],
    manualHolidays: new Set(),
    manualHolidayLabels: new Map(),
    deductions: [],
    deductionIds: new Map(),
    expenseRows: [],
    preferences: {
      defaultStartHour: 8,
      defaultStartMinute: 0,
      defaultEndHour: 16,
      defaultEndMinute: 30,
      use24HourFormat: true,
      reminderEnabled: false,
      reminderHour: 18,
      reminderMinute: 0,
    },
    summaries: [],
    expenseSummaries: [],
    minYearMonth: now,
    maxYearMonth: now,
    ...nav,
  };
};

export function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("calendario");
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedYearMonth, setSelectedYearMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const loadDashboard = useCallback(async (userId: string) => {
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      const { fetchDashboard } = await import("@/lib/dashboard");
      const next = await fetchDashboard(userId);
      setData(next);
      setSelectedYearMonth((current) => {
        if (isYearMonthInRange(current, next.navMinYearMonth, next.navMaxYearMonth)) {
          return current;
        }
        return next.todayYearMonth;
      });
    } catch (err) {
      const text = err instanceof Error ? err.message : "No se pudo cargar el panel.";
      setDashboardError(text);
      const now = new Date();
      const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      setData(emptyData(ym));
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setSessionChecked(true);
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setSessionChecked(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: current } }) => {
      setSession(current);
      setSessionChecked(true);
      if (current?.user) {
        window.setTimeout(() => loadDashboard(current.user.id), 0);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        window.setTimeout(() => loadDashboard(nextSession.user.id), 0);
      } else {
        setData(null);
        setDashboardError(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadDashboard]);

  useEffect(() => {
    if (sessionChecked && !session) {
      router.replace(site.auth.loginPath);
    }
  }, [sessionChecked, session, router]);

  async function handleSignOut() {
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      router.replace(site.auth.loginPath);
    } catch {
      router.replace(site.auth.loginPath);
    }
  }

  const deductionRecords: ManualDeductionRecord[] = useMemo(() => {
    if (!data) return [];
    return data.deductions.map((d) => ({
      id: data.deductionIds.get(
        `${d.yearMonth}|${d.effectiveDate}|${d.label}|${d.amount}|${d.entryType}`,
      ) ?? "",
      yearMonth: d.yearMonth,
      effectiveDate: d.effectiveDate,
      label: d.label,
      amount: d.amount,
      entryType: d.entryType,
    })).filter((d) => d.id);
  }, [data]);

  const manualHolidayList = useMemo(() => {
    if (!data) return [];
    return Array.from(data.manualHolidayLabels.entries())
      .map(([dateIso, label]) => ({ dateIso, label }))
      .sort((a, b) => a.dateIso.localeCompare(b.dateIso));
  }, [data]);

  if (!sessionChecked || !session) {
    return (
      <div className="dashboard-panel">
        <p className="dashboard-status">Verificando sesión…</p>
      </div>
    );
  }

  const userId = session.user.id;
  const profileName = data?.profileName ?? null;
  const navMinYearMonth = data?.navMinYearMonth ?? todayYearMonth();
  const navMaxYearMonth = data?.navMaxYearMonth ?? todayYearMonth();
  const todayYm = data?.todayYearMonth ?? todayYearMonth();

  return (
    <div className="dashboard-shell">
      <header className="dashboard-appbar">
        <div className="dashboard-appbar-brand">
          <span className="dashboard-appbar-logo" aria-hidden="true">N</span>
          <div>
            <p className="dashboard-appbar-title">Nominapp</p>
            <p className="dashboard-appbar-sub">
              Hola{profileName ? `, ${profileName}` : ""}
            </p>
          </div>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={handleSignOut}>
          Salir
        </button>
      </header>

      <div className="dashboard-panel">
        {dashboardError && <div className="form-message error">{dashboardError}</div>}
        {dashboardLoading && <p className="dashboard-status">Sincronizando datos…</p>}

        {data && (
          <>
            {activeTab === "calendario" && (
              <CalendarPanel
                userId={userId}
                selectedYearMonth={selectedYearMonth}
                minYearMonth={navMinYearMonth}
                maxYearMonth={navMaxYearMonth}
                todayYearMonth={todayYm}
                profile={data.profile}
                manualHolidays={data.manualHolidays}
                allWorkDays={data.workDays}
                monthDeductions={data.deductions.filter((d) => d.yearMonth === selectedYearMonth)}
                preferences={data.preferences}
                onSelectYearMonth={setSelectedYearMonth}
                onRefresh={() => loadDashboard(userId)}
              />
            )}

            {activeTab === "nomina" && (
              <PayrollPanel
                userId={userId}
                selectedYearMonth={selectedYearMonth}
                minYearMonth={navMinYearMonth}
                maxYearMonth={navMaxYearMonth}
                todayYearMonth={todayYm}
                profile={data.profile}
                allWorkDays={data.workDays}
                manualHolidays={data.manualHolidays}
                deductions={deductionRecords}
                preferences={data.preferences}
                onSelectYearMonth={setSelectedYearMonth}
                onRefresh={() => loadDashboard(userId)}
              />
            )}

            {activeTab === "gastos" && (
              <ExpensesPanel
                userId={userId}
                selectedYearMonth={selectedYearMonth}
                minYearMonth={navMinYearMonth}
                maxYearMonth={navMaxYearMonth}
                todayYearMonth={todayYm}
                profile={data.profile}
                allWorkDays={data.workDays}
                manualHolidays={data.manualHolidays}
                deductions={data.deductions}
                expenseRows={data.expenseRows}
                onSelectYearMonth={setSelectedYearMonth}
                onRefresh={() => loadDashboard(userId)}
              />
            )}

            {activeTab === "ajustes" && (
              <SettingsPanel
                userId={userId}
                profile={data.profile}
                preferences={data.preferences}
                manualHolidays={manualHolidayList}
                accountEmail={session.user.email ?? null}
                onRefresh={() => loadDashboard(userId)}
                onSignOut={handleSignOut}
              />
            )}
          </>
        )}

        <p className="auth-note">
          Marca cualquier mes (pasado o futuro). Los cambios se guardan en la nube y se sincronizan con la app Android.
        </p>
      </div>

      <nav className="dashboard-tabs dashboard-tabs--bottom" aria-label="Secciones del panel">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`dashboard-tab${activeTab === tab.id ? " is-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="hide-narrow">{tab.label}</span>
            <span className="show-narrow">{tab.short}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
