import { LoginForm } from "./login-form";

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
          Acceso para dueños y contadores. Auth vía Supabase del proyecto{" "}
          <code>kmkrxyrorksrwmdomfuy</code>.
        </p>
        <LoginForm />
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
