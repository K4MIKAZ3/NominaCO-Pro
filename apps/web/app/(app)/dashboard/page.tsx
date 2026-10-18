import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { formatCop } from "@/lib/format";
import {
  countActiveEmployees,
  getActiveCompany,
  listCompanies,
  listEmployees,
  listPayrollPeriods,
} from "@/lib/supabase/data";

export const metadata = { title: "Panel" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const companies = await listCompanies();
  const company = await getActiveCompany();

  if (!company) {
    return (
      <AppShell active="/dashboard" company={null} companies={companies}>
        <div className="stack">
          <header>
            <p className="eyebrow">Bienvenido</p>
            <h1 className="page-title">Crea tu primera empresa</h1>
            <p className="page-lead">
              El panel multi-empresa arranca con una razón social y NIT. Luego agregas
              empleados y períodos de nómina.
            </p>
          </header>
          <Link href="/companies" className="btn btn-primary" style={{ justifySelf: "start" }}>
            Ir a Empresas
          </Link>
        </div>
      </AppShell>
    );
  }

  const [employeeCount, employees, periods] = await Promise.all([
    countActiveEmployees(company.id),
    listEmployees(company.id),
    listPayrollPeriods(company.id),
  ]);
  const openRun = periods.find((p) => p.status !== "closed") ?? periods[0];

  return (
    <AppShell active="/dashboard" company={company} companies={companies}>
      <div className="stack">
        <header>
          <p className="eyebrow">Hoy</p>
          <h1 className="page-title">Panel de {company.name}</h1>
          <p className="page-lead">Resumen operativo de la empresa activa (datos en Supabase).</p>
        </header>

        <section className="grid-3">
          <div className="panel anim-rise">
            <p className="eyebrow">Empleados</p>
            <p style={{ fontSize: "2rem", margin: "0.4rem 0 0", fontFamily: "var(--font-brand)" }}>
              {employeeCount}
            </p>
            <p className="muted">activos en nómina</p>
          </div>
          <div className="panel anim-rise delay-1">
            <p className="eyebrow">Período</p>
            <p style={{ fontSize: "1.35rem", margin: "0.55rem 0 0.2rem", fontWeight: 600 }}>
              {openRun?.label ?? "Sin períodos"}
            </p>
            {openRun ? <span className="badge">{openRun.status}</span> : null}
          </div>
          <div className="panel anim-rise delay-2">
            <p className="eyebrow">Ciudad</p>
            <p style={{ fontSize: "1.45rem", margin: "0.55rem 0 0", fontFamily: "var(--font-brand)" }}>
              {company.city ?? "—"}
            </p>
          </div>
        </section>

        <section className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Próximo paso</h2>
              <p className="muted" style={{ margin: "0.35rem 0 0" }}>
                {employees.length === 0
                  ? "Agrega empleados para liquidar con el motor."
                  : "Revisa períodos y liquida con @nominapp/payroll-engine."}
              </p>
            </div>
            <Link href={employees.length === 0 ? "/employees" : "/payroll"} className="btn btn-accent">
              {employees.length === 0 ? "Agregar empleados" : "Ir a nómina"}
            </Link>
          </div>
        </section>

        <section className="panel">
          <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.15rem" }}>Empleados</h2>
          {employees.length === 0 ? (
            <p className="muted">Aún no hay empleados en esta empresa.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cargo</th>
                  <th>Salario</th>
                </tr>
              </thead>
              <tbody>
                {employees.slice(0, 5).map((e) => (
                  <tr key={e.id}>
                    <td>{e.full_name}</td>
                    <td>{e.job_title}</td>
                    <td>{formatCop(e.monthly_salary)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </AppShell>
  );
}
