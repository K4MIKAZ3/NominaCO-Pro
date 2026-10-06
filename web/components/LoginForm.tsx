"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PasswordField } from "@/components/PasswordField";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  isPasswordValid,
  mapAuthPasswordError,
  mapAuthRateLimitError,
  PASSWORD_REQUIREMENTS_HINT,
  passwordsMatch,
  validatePassword,
} from "@/lib/password";
import { resetPasswordRedirectUrl, site } from "@/lib/site";

type AuthMode = "login" | "signup" | "reset";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);

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

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setSessionChecked(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
      setSessionChecked(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (sessionChecked && hasSession) {
      router.replace(site.auth.homePath);
    }
  }, [sessionChecked, hasSession, router]);

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

  if (!sessionChecked || hasSession) {
    return (
      <div className="auth-card">
        <p className="dashboard-status">Verificando sesión…</p>
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
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace(site.auth.homePath);
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
          options: { emailRedirectTo: `${site.url}${site.auth.homePath}` },
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
      const text =
        mode === "signup" ? mapAuthPasswordError(raw) : mapAuthRateLimitError(raw);
      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
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
