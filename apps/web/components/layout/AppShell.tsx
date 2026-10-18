import Link from "next/link";
import type { ReactNode } from "react";
import { signOutAction } from "@/app/actions";
import { CompanySwitcher } from "@/components/layout/CompanySwitcher";
import type { Company } from "@/lib/types";

const nav = [
  { href: "/dashboard", label: "Panel" },
  { href: "/companies", label: "Empresas" },
  { href: "/employees", label: "Empleados" },
  { href: "/payroll", label: "Nómina" },
  { href: "/legal", label: "Legal" },
  { href: "/settings", label: "Ajustes" },
];

export function AppShell({
  children,
  active,
  company,
  companies = [],
}: {
  children: ReactNode;
  active: string;
  company: Company | null;
  companies?: Company[];
}) {
  return (
    <div className="app-shell">
      <aside className="app-nav anim-fade">
        <div className="app-brand">
          <p className="brand-mark">Nominapp</p>
          <p className="brand-sub">Empresas</p>
        </div>
        <div className="company-chip">
          <span className="eyebrow">Empresa activa</span>
          <strong>{company?.name ?? "Sin empresa"}</strong>
          <CompanySwitcher companies={companies} activeId={company?.id} />
        </div>
        <nav>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link${active === item.href ? " is-active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="nav-footer">
          <form action={signOutAction}>
            <button type="submit" className="nav-link" style={{ width: "100%", background: "transparent", border: 0, textAlign: "left", cursor: "pointer" }}>
              Salir
            </button>
          </form>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar anim-fade">
          <p className="muted">empresas.nominapp.xyz</p>
          <Link href="/" className="btn btn-ghost">
            Sitio público
          </Link>
        </header>
        <main className="app-content anim-rise">{children}</main>
      </div>
      <style>{`
        .app-shell {
          min-height: 100vh;
          display: grid;
          grid-template-columns: var(--nav-width) 1fr;
        }
        .app-nav {
          position: sticky;
          top: 0;
          height: 100vh;
          padding: 1.4rem 1rem 1.2rem;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          background: linear-gradient(180deg, var(--forest-950), var(--forest-900));
          color: var(--sand-50);
        }
        .app-brand .brand-mark {
          margin: 0;
          font-family: var(--font-brand);
          font-size: 1.55rem;
          line-height: 1;
        }
        .app-brand .brand-sub {
          margin: 0.2rem 0 0;
          opacity: 0.72;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-size: 0.72rem;
        }
        .company-chip {
          display: grid;
          gap: 0.25rem;
          padding: 0.85rem 0.9rem;
          border-radius: 12px;
          background: rgba(247, 243, 235, 0.08);
          border: 1px solid rgba(247, 243, 235, 0.12);
        }
        .company-chip .eyebrow {
          color: var(--cyan-400);
        }
        .company-chip strong {
          font-size: 0.95rem;
          font-weight: 600;
        }
        .app-nav nav {
          display: grid;
          gap: 0.25rem;
          flex: 1;
        }
        .nav-link {
          padding: 0.7rem 0.85rem;
          border-radius: 10px;
          color: rgba(247, 243, 235, 0.78);
          transition: background 160ms ease, color 160ms ease;
        }
        .nav-link:hover,
        .nav-link.is-active {
          background: rgba(46, 196, 189, 0.16);
          color: white;
        }
        .nav-footer {
          border-top: 1px solid rgba(247, 243, 235, 0.1);
          padding-top: 0.8rem;
        }
        .app-main {
          min-width: 0;
        }
        .app-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--line);
          background: rgba(247, 243, 235, 0.55);
          backdrop-filter: blur(8px);
        }
        .app-content {
          padding: 1.5rem;
        }
        @media (max-width: 900px) {
          .app-shell {
            grid-template-columns: 1fr;
          }
          .app-nav {
            position: relative;
            height: auto;
          }
          .app-nav nav {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
