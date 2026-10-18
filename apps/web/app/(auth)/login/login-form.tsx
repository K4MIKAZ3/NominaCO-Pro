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
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const supabase = createClient();
      if (mode === "signin") {
        const { error: signError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signError) throw signError;
        router.push("/dashboard");
        router.refresh();
      } else {
        const { data, error: signError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signError) throw signError;
        if (data.session) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setInfo("Te enviamos un correo para confirmar tu cuenta.");
          setMode("signin");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
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
        <p style={{ color: "#8b1e1e", margin: 0, fontSize: "0.9rem" }}>{error}</p>
      ) : null}
      {info ? (
        <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
          {info}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Un momento…" : mode === "signin" ? "Continuar" : "Crear cuenta"}
      </button>
      <button
        type="button"
        className="btn"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin" ? "Crear cuenta" : "Ya tengo cuenta"}
      </button>
      <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
        <Link href="/">Volver al inicio</Link>
      </p>
    </form>
  );
}
