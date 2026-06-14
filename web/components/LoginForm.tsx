"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { MonthSummaryPanel } from "@/components/MonthSummaryPanel";
import { PasswordField } from "@/components/PasswordField";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  isPasswordValid,
  mapAuthPasswordError,
  PASSWORD_REQUIREMENTS_HINT,
  passwordsMatch,
  validatePassword,
} from "@/lib/password";
import { resetPasswordRedirectUrl, site } from "@/lib/site";
import type { ExpenseSummary } from "@/lib/expenses";
import type { MonthSummary } from "@/lib/payroll/models";

type AuthMode = "login" | "signup" | "reset";

export function LoginForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );
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

  const passwordError = useMemo(() => {
    if (mode !== "signup") return null;
    if (!touched.password && password.length === 0) return null;
    return validatePassword(password);
  }, [mode, password, touched.password]);

  const confirmError = useMemo(() => {
    if (mode !== "signup") return null;
    if (!touched.confirm && confirmPassword.length === 0) return null;
    if (!passwordsMatch(password, confirmPassword)) {
      return "Las contraseñas no coinciden.";
    }
    return null;
  }, [mode, password, confirmPassword, touched.confirm]);

  const canSubmitSignup =
    isPasswordValid(password) && passwordsMatch(password, confirmPassword);

  useEffect(() => {
    setConfirmPassword("");
    setTouched({ password: false, confirm: false });
  }, [mode]);

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
    const supabase = getSupabase();
    if (!supabase) {
      setSessionChecked(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: current } }) => {
      setSession(current);
      setSessionChecked(true);
      if (current?.user) {
        // Evita deadlock de Supabase: no llamar a la API dentro del callback de auth.
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

  if (!isSupabaseConfigured()) {
    return (
      <div className="auth-card">
        <h1>Cuenta Nominapp</h1>
        <p className="subtitle">
          El inicio de sesión web aún no está configurado en este servidor.
        </p>
        <p className="auth-note">
          Puedes crear tu cuenta directamente desde la app Android después de
          instalarla. Si eres el administrador, configura{" "}
          <code>NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en Vercel.
        </p>
        <p className="auth-note" style={{ marginTop: "1rem" }}>
          <Link href="/">← Volver al inicio</Link>
        </p>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = getSupabase();
    if (!supabase) {
      setMessage({ type: "error", text: "Servicio no disponible." });
      setLoading(false);
      return;
    }

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) {
          setSession(data.session);
          setSessionChecked(true);
          window.setTimeout(() => loadDashboard(data.session.user.id), 0);
        }
      } else if (mode === "signup") {
        setTouched({ password: true, confirm: true });
        const validationError = validatePassword(password);
        if (validationError) {
          setMessage({ type: "error", text: validationError });
          setLoading(false);
          return;
        }
        if (!passwordsMatch(password, confirmPassword)) {
          setMessage({ type: "error", text: "Las contraseñas no coinciden." });
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${site.url}/login` },
        });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "Cuenta creada. Revisa tu correo si requiere confirmación antes de iniciar sesión en la app.",
        });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: resetPasswordRedirectUrl(),
        });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "Revisa tu correo para restablecer la contraseña.",
        });
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Ocurrió un error.";
      const text = mode === "signup" ? mapAuthPasswordError(raw) : raw;
      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    const supabase = getSupabase();
    if (!supabase) return;
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      setMessage(null);
    } finally {
      setSigningOut(false);
    }
  }

  if (sessionChecked && session) {
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

  return (
    <div className="auth-card">
      <h1>Cuenta Nominapp</h1>
      <p className="subtitle">
        Misma cuenta que en la app Android. Respalda y sincroniza tu información.
      </p>

      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab ${mode === "login" ? "active" : ""}`}
          onClick={() => setMode("login")}
        >
          Entrar
        </button>
        <button
          type="button"
          className={`auth-tab ${mode === "signup" ? "active" : ""}`}
          onClick={() => setMode("signup")}
        >
          Registro
        </button>
        <button
          type="button"
          className={`auth-tab ${mode === "reset" ? "active" : ""}`}
          onClick={() => setMode("reset")}
        >
          Recuperar
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {mode === "signup" && (
          <p className="auth-note" style={{ marginBottom: "1rem" }}>
            {PASSWORD_REQUIREMENTS_HINT}
          </p>
        )}

        {mode === "login" && (
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}

        {mode === "signup" && (
          <>
            <PasswordField
              id="password"
              label="Contraseña"
              value={password}
              onChange={(value) => {
                setPassword(value);
                setTouched((current) => ({ ...current, password: true }));
              }}
              hint={passwordError}
            />
            <PasswordField
              id="confirm-password"
              label="Confirmar contraseña"
              value={confirmPassword}
              onChange={(value) => {
                setConfirmPassword(value);
                setTouched((current) => ({ ...current, confirm: true }));
              }}
              hint={confirmError}
            />
          </>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || (mode === "signup" && !canSubmitSignup)}
          >
            {loading
              ? "Procesando…"
              : mode === "login"
                ? "Iniciar sesión"
                : mode === "signup"
                  ? "Crear cuenta"
                  : "Enviar enlace"}
          </button>
        </div>
      </form>

      {message && (
        <div className={`form-message ${message.type}`}>{message.text}</div>
      )}

      <p className="auth-note">
        Al registrarte aceptas los{" "}
        <Link href="/terminos">Términos y la Política de Privacidad</Link>.
      </p>
    </div>
  );
}
