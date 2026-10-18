import { LoginForm } from "./login-form";

export const metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <div className="auth-wrap">
      <div className="auth-panel">
        <div className="brand" style={{ color: "var(--ink)", padding: 0 }}>
          <div className="brand-mark" aria-hidden />
          nominapp
        </div>
        <h1>Entrar</h1>
        <p className="muted" style={{ margin: "0 0 1.25rem", lineHeight: 1.5 }}>
          Accede a tu panel de nómina.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
