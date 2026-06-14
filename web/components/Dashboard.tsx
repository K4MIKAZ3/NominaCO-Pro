"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { MonthSummaryPanel } from "@/components/MonthSummaryPanel";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { site } from "@/lib/site";
import type { ExpenseSummary } from "@/lib/expenses";
import type { MonthSummary } from "@/lib/payroll/models";

export function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<MonthSummary[]>([]);
  const [expenseSummaries, setExpenseSummaries] = useState<ExpenseSummary[]>([]);
  const [selectedYearMonth, setSelectedYearMonth] = useState(() => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${now.getFullYear()}-${month}`;
  });
  const [minYearMonth, setMinYearMonth] = useState(selectedYearMonth);
  const [maxYearMonth, setMaxYearMonth] = useState(selectedYearMonth);
  const [signingOut, setSigningOut] = useState(false);

  const loadDashboard = useCallback(async (userId: string) => {
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      const { fetchDashboard } = await import("@/lib/dashboard");
      const data = await fetchDashboard(userId);
      setProfileName(data.profileName);
      setSummaries(data.summaries);
      setExpenseSummaries(data.expenseSummaries);
      setMinYearMonth(data.minYearMonth);
      setMaxYearMonth(data.maxYearMonth);
      setSelectedYearMonth(data.maxYearMonth);
    } catch (err) {
      const text = err instanceof Error ? err.message : "No se pudo cargar el resumen.";
      setDashboardError(text);
      setProfileName(null);
      setSummaries([]);
      setExpenseSummaries([]);
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
        setProfileName(null);
        setSummaries([]);
        setExpenseSummaries([]);
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
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      router.replace(site.auth.loginPath);
    } finally {
      setSigningOut(false);
    }
  }

  if (!sessionChecked || !session) {
    return (
      <div className="dashboard-panel">
        <p className="dashboard-status">Verificando sesión…</p>
      </div>
    );
  }

  const selectedIndex = summaries.findIndex(
    (summary) =>
      `${summary.year}-${String(summary.month).padStart(2, "0")}` === selectedYearMonth,
  );
  const summary = selectedIndex >= 0 ? summaries[selectedIndex] : null;
  const expenseSummary = selectedIndex >= 0 ? expenseSummaries[selectedIndex] : null;

  return (
    <MonthSummaryPanel
      profileName={profileName}
      selectedYearMonth={selectedYearMonth}
      minYearMonth={minYearMonth}
      maxYearMonth={maxYearMonth}
      summary={summary}
      expenseSummary={expenseSummary}
      loading={dashboardLoading}
      error={dashboardError}
      onSelectYearMonth={setSelectedYearMonth}
      onSignOut={handleSignOut}
      signingOut={signingOut}
    />
  );
}
