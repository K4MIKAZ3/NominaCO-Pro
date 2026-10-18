import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { demoCompany, demoEmployees, demoPayrollRuns } from "@/lib/demo-data";
import { formatCop } from "@/lib/format";

export const metadata = { title: "Panel" };

export default function DashboardPage() {
  const openRun = demoPayrollRuns[0];
  return (
    <AppShell active="/dashboard">
      <div className="stack">
        <header>
          <p className="eyebrow">Hoy</p>
          <h1 className="page-title">Panel de {demoCompany.name}</h1>
          <p className="page-lead">
            Resumen operativo de la empresa activa. Los datos son demo hasta conectar Supabase.
          </p>
        </header>

        <section className="grid-3">
          <div className="panel anim-rise">
            <p className="eyebrow">Empleados</p>
            <p style={{ fontSize: "2rem", margin: "0.4rem 0 0", fontFamily: "var(--font-brand)" }}>
              {demoCompany.employeesActive}
            </p>
            <p className="muted">activos en nómina</p>
          </div>
          <div className="panel anim-rise delay-1">
            <p className="eyebrow">Período abierto</p>
            <p style={{ fontSize: "1.35rem", margin: "0.55rem 0 0.2rem", fontWeight: 600 }}>
              {openRun.label}
            </p>
            <span className="badge">{openRun.status}</span>
          </div>
          <div className="panel anim-rise delay-2">
            <p className="eyebrow">Estimado bruto</p>
            <p style={{ fontSize: "1.45rem", margin: "0.55rem 0 0", fontFamily: "var(--font-brand)" }}>
              {formatCop(openRun.grossEstimate)}
            </p>
          </div>
        </section>

        <section className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Próximo paso</h2>
              <p className="muted" style={{ margin: "0.35rem 0 0" }}>
                Revisar asistencia y liquidar el período con el motor `@nominapp/payroll-engine`.
              </p>
            </div>
            <Link href="/payroll" className="btn btn-accent">
              Ir a nómina
            </Link>
          </div>
        </section>

        <section className="panel">
          <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.15rem" }}>Empleados recientes</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cargo</th>
                <th>Salario</th>
              </tr>
            </thead>
            <tbody>
              {demoEmployees.slice(0, 3).map((e) => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td>{e.jobTitle}</td>
                  <td>{formatCop(e.monthlySalary)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </AppShell>
  );
}
