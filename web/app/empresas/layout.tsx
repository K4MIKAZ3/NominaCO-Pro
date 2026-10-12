import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./empresas.css";

export const metadata: Metadata = {
  title: { absolute: "Nominapp Empresas" },
  description:
    "Demo aislada para empleadores: programar turnos, avisar al trabajador, marcar entrada y salida, y liquidar la nómina del mes.",
  robots: { index: false, follow: false },
};

export default function EmpresasLayout({ children }: { children: ReactNode }) {
  return children;
}
