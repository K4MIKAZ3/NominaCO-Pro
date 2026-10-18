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

export const metadata = { title: "Resumen" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const companies = await listCompanies();
  const company = await getActiveCompany();

  if (!company) {
    return (
      <AppShell active="/dashboard" company={null} companies={companies}>
        <header className="page-head">
          <div>
            <div className="crumb">Resumen</div>
            <h1>Crea tu primera empresa</h1>
            <p className="page-lead">
              Empieza con la razón social y el NIT. Después agregas empleados y cierras
              períodos.
            </p>
          </div>
          <div className="actions">
            <Link href="/companies" className="btn btn-primary">
              Nueva empresa
            </Link>
          </div>
        </header>
      </AppShell>
    );
  }

  const [employeeCount, employees, periods] = await Promise.all([
    countActiveEmployees(company.id),
    listEmployees(company.id),
    listPayrollPeriods(company.id),
  ]);
  const openRun = periods.find((p) => p.status !== "closed") ?? periods[0];
  const salarySum = employees.reduce((s, e) => s + e.monthly_salary, 0);

  return (
    <AppShell
      active="/dashboard"
      company={company}
      companies={companies}
      counts={{ employees: employeeCount, periods: periods.length }}
    >
      <header className="page-head">
        <div>
          <div className="crumb">Resumen</div>
          <h1>{company.name}</h1>
          <p className="page-lead">Vista general de la empresa activa.</p>
        </div>
        <div className="actions">
          <Link href="/employees" className="btn">
            Empleados
          </Link>
          <Link href="/payroll" className="btn btn-primary">
            Ir a nómina
          </Link>
        </div>
      </header>

      <section className="stats">
        <div className="stat">
          <span>Empleados activos</span>
          <b className="m">{employeeCount}</b>
        </div>
        <div className="stat">
          <span>Período</span>
          <b className="m" style={{ fontSize: "1.1rem" }}>
            {openRun?.label ?? "Sin períodos"}
          </b>
        </div>
        <div className="stat strong">
          <span>Nómina mensual est.</span>
          <b className="m">{formatCop(salarySum)}</b>
        </div>
        <div className="stat">
          <span>Estado</span>
          <b className="m" style={{ fontSize: "1rem" }}>
            {openRun ? (
              <span className={openRun.status === "closed" ? "chip chip-ok" : "chip chip-warn"}>
                {openRun.status === "closed" ? "Cerrado" : "Abierto"}
              </span>
            ) : (
              "—"
            )}
          </b>
        </div>
      </section>

      <div className="content-pad stack">
        <section className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <div className="label-caps">Siguiente paso</div>
              <p style={{ margin: "6px 0 0" }}>
                {employees.length === 0
                  ? "Agrega empleados para empezar a liquidar."
                  : "Revisa o crea un período de nómina."}
              </p>
            </div>
            <Link
              href={employees.length === 0 ? "/employees" : "/payroll"}
              className="btn btn-accent"
            >
              {employees.length === 0 ? "Agregar empleados" : "Abrir nómina"}
            </Link>
          </div>
        </section>

        <section className="panel">
          <div className="label-caps" style={{ marginBottom: 8 }}>
            Empleados
          </div>
          {employees.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>
              Aún no hay empleados.
            </p>
          ) : (
            <table className="table-html">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cargo</th>
                  <th>Salario</th>
                </tr>
              </thead>
              <tbody>
                {employees.slice(0, 6).map((e) => (
                  <tr key={e.id}>
                    <td>
                      <b>{e.full_name}</b>
                    </td>
                    <td>{e.job_title || "—"}</td>
                    <td className="m">{formatCop(e.monthly_salary)}</td>
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
