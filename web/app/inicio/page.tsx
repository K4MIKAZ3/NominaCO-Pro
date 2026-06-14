import type { Metadata } from "next";
import { Dashboard } from "@/components/Dashboard";

export const metadata: Metadata = {
  title: "Mi cuenta",
  description: "Resumen de nómina y gastos sincronizados desde la app Nominapp.",
};

export default function InicioPage() {
  return (
    <main className="page-main">
      <div className="container">
        <Dashboard />
      </div>
    </main>
  );
}
