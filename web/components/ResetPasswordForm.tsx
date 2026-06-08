"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { site } from "@/lib/site";

type Phase = "loading" | "invalid" | "ready" | "success";

export function ResetPasswordForm() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setPhase("invalid");
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setPhase("invalid");
      return;
    }

    const client = supabase;
    let cancelled = false;

    async function initRecoverySession() {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const tokenHash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type");

        if (code) {
          const { error } = await client.auth.exchangeCodeForSession(code);
          if (error) throw error;
          window.history.replaceState({}, document.title, url.pathname);
        } else if (tokenHash && type === "recovery") {
          const { error } = await client.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });
          if (error) throw error;
          window.history.replaceState({}, document.title, url.pathname);
        } else {
          await client.auth.getSession();
        }

        const {
          data: { session },
          error,
        } = await client.auth.getSession();
        if (error) throw error;

        if (!cancelled) {
          setPhase(session ? "ready" : "invalid");
        }
      } catch {
        if (!cancelled) setPhase("invalid");
      }
    }

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setPhase("ready");
      }
    });

    initRecoverySession();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (password.length < 6) {
      setMessage({ type: "error", text: "La contraseña debe tener al menos 6 caracteres." });
      return;
    }
    if (password !== confirm) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden." });
      return;
    }

    const supabase = getSupabase();
    if (!supabase) return;

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut();
      setPhase("success");
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "No se pudo actualizar la contraseña.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="auth-card">
        <h1>Nueva contraseña</h1>
        <p className="subtitle">El servicio de recuperación aún no está configurado.</p>
        <p className="auth-note">
          <Link href="/login">← Volver al inicio de sesión</Link>
        </p>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="auth-card">
        <h1>Nueva contraseña</h1>
        <p className="subtitle">Validando tu enlace de recuperación…</p>
      </div>
    );
  }

  if (phase === "invalid") {
    return (
      <div className="auth-card">
        <h1>Enlace no válido</h1>
        <p className="subtitle">
          El enlace expiró o ya fue usado. Solicita uno nuevo desde la pantalla de
          recuperación.
        </p>
        <div className="form-actions">
          <Link href="/login" className="btn btn-primary">
            Ir a recuperar contraseña
          </Link>
        </div>
        <p className="auth-note">
          <Link href="/">← Volver al inicio</Link>
        </p>
      </div>
    );
  }

  if (phase === "success") {
    return (
      <div className="auth-card">
        <h1>Contraseña actualizada</h1>
        <p className="subtitle">
          Tu contraseña se cambió correctamente. Ya puedes iniciar sesión en la app
          Android o en la web con la nueva clave.
        </p>
        <div className="form-actions">
          <Link href="/login" className="btn btn-primary">
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h1>Nueva contraseña</h1>
      <p className="subtitle">
        Elige una contraseña segura para tu cuenta de {site.name}.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="password">Nueva contraseña</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirm">Confirmar contraseña</label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Guardando…" : "Guardar nueva contraseña"}
          </button>
        </div>
      </form>

      {message && <div className={`form-message ${message.type}`}>{message.text}</div>}

      <p className="auth-note">
        <Link href="/login">← Volver al inicio de sesión</Link>
      </p>
    </div>
  );
}
