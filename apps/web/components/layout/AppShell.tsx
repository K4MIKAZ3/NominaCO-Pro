import Link from "next/link";
import type { ReactNode } from "react";
import { signOutAction } from "@/app/actions";
import { CompanySwitcher } from "@/components/layout/CompanySwitcher";
import type { Company } from "@/lib/types";

const nav = [
  { href: "/dashboard", label: "Resumen" },
  { href: "/payroll", label: "Nómina" },
  { href: "/employees", label: "Empleados" },
  { href: "/companies", label: "Empresas" },
  { href: "/legal", label: "Legal" },
  { href: "/settings", label: "Ajustes" },
];

export function AppShell({
  children,
  active,
  company,
  companies = [],
  counts,
}: {
  children: ReactNode;
  active: string;
  company: Company | null;
  companies?: Company[];
  counts?: { employees?: number; periods?: number };
}) {
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">
          <div className="brand-mark" aria-hidden />
          nominapp
        </div>
        <div className="company">
          <small>Empresa</small>
          <b>{company?.name ?? "Sin empresa"}</b>
          {company?.nit ? <span className="m">{company.nit}</span> : null}
          <CompanySwitcher companies={companies} activeId={company?.id} />
        </div>
        <nav className="nav">
          {nav.map((item) => {
            const badge =
              item.href === "/employees"
                ? counts?.employees
                : item.href === "/payroll"
                  ? counts?.periods
                  : undefined;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active === item.href ? "active" : undefined}
              >
                <span>{item.label}</span>
                {typeof badge === "number" ? <span className="m">{badge}</span> : null}
              </Link>
            );
          })}
        </nav>
        <form action={signOutAction}>
          <button type="submit" className="nav-link">
            Salir
          </button>
        </form>
      </aside>
      <div className="main">{children}</div>
    </div>
  );
}
