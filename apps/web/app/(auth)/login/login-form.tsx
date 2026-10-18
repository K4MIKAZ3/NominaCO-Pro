"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const hasKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!hasKey) {
      router.push("/dashboard");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      if (mode === "signin") {
        const { error: signError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signError) throw signError;
      } else {
        const { error: signError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signError) throw signError;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo autenticar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="stack" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="email">Correo</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@empresa.com"
          required
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          placeholder="••••••••"
          required
          minLength={6}
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
        />
      </div>
      {error ? (
        <p style={{ color: "var(--danger)", margin: 0, fontSize: "0.9rem" }}>{error}</p>
      ) : null}
      {!hasKey ? (
        <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
          Sin `NEXT_PUBLIC_SUPABASE_ANON_KEY`: entrar abre el panel demo.
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Espera…" : mode === "signin" ? "Continuar" : "Crear cuenta"}
      </button>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin" ? "Crear cuenta" : "Ya tengo cuenta"}
      </button>
      <p className="muted" style={{ margin: 0 }}>
        <Link href="/">Volver al inicio</Link>
        {" · "}
        <Link href="/dashboard">Panel demo</Link>
      </p>
    </form>
  );
}
