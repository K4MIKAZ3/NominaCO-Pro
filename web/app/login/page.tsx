import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";
import { privatePageRobots } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta Nominapp para respaldar y sincronizar tu nómina personal.",
  robots: privatePageRobots,
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
