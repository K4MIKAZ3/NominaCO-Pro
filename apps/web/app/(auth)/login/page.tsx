import Link from "next/link";

export const metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <div className="auth-wrap">
      <div className="auth-panel anim-rise">
        <p className="eyebrow">Nominapp Empresas</p>
        <h1 className="page-title">Entrar al panel</h1>
        <p className="page-lead">
          Acceso para dueños y contadores. La autenticación Supabase se conectará en la
          siguiente fase; por ahora puedes explorar el panel demo.
        </p>
        <form className="stack" action="/dashboard">
          <div className="field">
            <label htmlFor="email">Correo</label>
            <input id="email" name="email" type="email" placeholder="tu@empresa.com" required />
          </div>
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input id="password" name="password" type="password" placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary">
            Continuar
          </button>
        </form>
        <p className="muted" style={{ marginTop: "1.25rem" }}>
          <Link href="/">Volver al inicio</Link>
          {" · "}
          <Link href="/dashboard">Entrar en demo</Link>
        </p>
      </div>
      <style>{`
        .auth-wrap {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 1.5rem;
        }
        .auth-panel {
          width: min(420px, 100%);
          padding: 1.75rem;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          box-shadow: var(--shadow-soft);
        }
      `}</style>
    </div>
  );
}
