"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { MonthSummaryPanel } from "@/components/MonthSummaryPanel";
import { ProfileEditor } from "@/components/ProfileEditor";
import { WorkDaysEditor } from "@/components/WorkDaysEditor";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { site } from "@/lib/site";
import type { ExpenseSummary } from "@/lib/expenses";
import type { MonthSummary } from "@/lib/payroll/models";

type DashboardTab = "resumen" | "perfil" | "jornadas";

export function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("resumen");
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
      setSelectedYearMonth((current) => {
        if (data.summaries.length === 0) return data.maxYearMonth;
        const hasCurrent = data.summaries.some(
          (summary) =>
            `${summary.year}-${String(summary.month).padStart(2, "0")}` === current,
        );
        return hasCurrent ? current : data.maxYearMonth;
      });
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

  const userId = session.user.id;
  const selectedIndex = summaries.findIndex(
    (summary) =>
      `${summary.year}-${String(summary.month).padStart(2, "0")}` === selectedYearMonth,
  );
  const summary = selectedIndex >= 0 ? summaries[selectedIndex] : null;
  const expenseSummary = selectedIndex >= 0 ? expenseSummaries[selectedIndex] : null;

  return (
    <div className={`dashboard-panel${activeTab === "jornadas" ? " dashboard-panel--wide" : ""}`}>
      <div className="dashboard-header">
        <div>
          <h1>Hola{profileName ? `, ${profileName}` : ""}</h1>
          <p className="subtitle">Panel web sincronizado con tu cuenta Nominapp</p>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? "Cerrando…" : "Cerrar sesión"}
        </button>
      </div>

      <nav className="dashboard-tabs" aria-label="Secciones del panel">
        <button
          type="button"
          className={`dashboard-tab${activeTab === "resumen" ? " is-active" : ""}`}
          onClick={() => setActiveTab("resumen")}
        >
          Resumen
        </button>
        <button
          type="button"
          className={`dashboard-tab${activeTab === "perfil" ? " is-active" : ""}`}
          onClick={() => setActiveTab("perfil")}
        >
          Perfil
        </button>
        <button
          type="button"
          className={`dashboard-tab${activeTab === "jornadas" ? " is-active" : ""}`}
          onClick={() => setActiveTab("jornadas")}
        >
          Jornadas
        </button>
      </nav>

      {activeTab === "resumen" && (
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
          onOpenProfile={() => setActiveTab("perfil")}
        />
      )}

      {activeTab === "perfil" && (
        <ProfileEditor userId={userId} onSaved={() => loadDashboard(userId)} />
      )}

      {activeTab === "jornadas" && (
        <WorkDaysEditor
          userId={userId}
          selectedYearMonth={selectedYearMonth}
          minYearMonth={minYearMonth}
          maxYearMonth={maxYearMonth}
          onSelectYearMonth={setSelectedYearMonth}
          onChanged={() => loadDashboard(userId)}
        />
      )}

      <p className="auth-note">
        Los cambios se guardan en la nube y se reflejan en la app Android al sincronizar.
      </p>
    </div>
  );
}
