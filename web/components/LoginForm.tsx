"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { site } from "@/lib/site";

type AuthMode = "login" | "signup" | "reset";

export function LoginForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  if (!isSupabaseConfigured()) {
    return (
      <div className="auth-card">
        <h1>Cuenta NominaApp</h1>
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
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "Sesión iniciada. Abre la app NominaApp en tu Android con el mismo correo para sincronizar tus datos.",
        });
      } else if (mode === "signup") {
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
          redirectTo: `${site.url}/login`,
        });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "Revisa tu correo para restablecer la contraseña.",
        });
      }
    } catch (err) {
      const text = err instanceof Error ? err.message : "Ocurrió un error.";
      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h1>Cuenta NominaApp</h1>
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

        {mode !== "reset" && (
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
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
