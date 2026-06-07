import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta NominaApp para respaldar y sincronizar tu nómina personal.",
};

export default function LoginPage() {
  return (
    <main className="page-main">
      <div className="container">
        <LoginForm />
      </div>
    </main>
  );
}
