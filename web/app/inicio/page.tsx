import type { Metadata } from "next";
import { Dashboard } from "@/components/Dashboard";
import { privatePageRobots } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Mi cuenta",
  description: "Resumen de nómina y gastos sincronizados desde la app Nominapp.",
  robots: privatePageRobots,
};

export default function InicioPage() {
  return (
    <main className="page-main page-main--dashboard">
      <Dashboard />
    </main>
  );
}
