import Link from "next/link";
import {
  closePayrollPeriodAction,
  createPayrollPeriodAction,
} from "@/app/actions";
import { AppShell } from "@/components/layout/AppShell";
import { formatCop } from "@/lib/format";
import {
  getActiveCompany,
  listCompanies,
  listEmployees,
  listPayrollPeriods,
} from "@/lib/supabase/data";
import {
  liquidateMonth,
  type EmployeeProfile,
  type WorkDayEntry,
} from "@nominapp/payroll-engine";

export const metadata = { title: "Nómina" };
export const dynamic = "force-dynamic";

function sampleEntries(year: number, month: number): WorkDayEntry[] {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  return ["02", "03", "04", "05", "06", "09", "10", "11", "12", "13"].map((d) => ({
    date: `${prefix}-${d}`,
    start: "08:00",
    end: "17:00",
    dayType: "NORMAL" as const,
  }));
}

export default async function PayrollPage() {
  const companies = await listCompanies();
  const company = await getActiveCompany();
  const periods = company ? await listPayrollPeriods(company.id) : [];
  const employees = company ? await listEmployees(company.id) : [];

  const first = employees[0];
  let sample = null as ReturnType<typeof liquidateMonth> | null;
  if (first) {
    sample = liquidateMonth(
      {
        name: first.full_name,
        documentId: first.document_id,
        jobTitle: first.job_title,
        monthlySalary: first.monthly_salary,
        dailyHours: Number(first.daily_hours),
        contractType: first.contract_type,
        payPeriodType: first.pay_period_type,
        pendingVacationDays: Number(first.pending_vacation_days),
      } satisfies EmployeeProfile,
      2026,
      3,
      sampleEntries(2026, 3),
    );
  }

  const now = new Date();
  const defaultStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const defaultEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(lastDay)}`;
  const defaultLabel = now.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
  const openCount = periods.filter((p) => p.status !== "closed").length;
  const openPeriod = periods.find((p) => p.status !== "closed") ?? periods[0];
  const deductions = sample
    ? sample.legalDeductions.reduce((s, d) => s + d.amount, 0)
    : 0;

  return (
    <AppShell
      active="/payroll"
      company={company}
      companies={companies}
      counts={{ employees: employees.length, periods: periods.length }}
    >
      <header className="page-head">
        <div>
          <div className="crumb">
            Nómina
            {openPeriod ? ` / ${openPeriod.label}` : ""}
          </div>
          <h1>
            {openPeriod
              ? `${openPeriod.label} · ${openPeriod.period_start} al ${openPeriod.period_end}`
              : "Períodos de liquidación"}
          </h1>
        </div>
        <div className="actions">
          {openCount > 0 ? (
            <span className="chip chip-warn">Borrador · {openCount} abiertos</span>
          ) : (
            <span className="chip chip-ok">Al día</span>
          )}
          {openPeriod && openPeriod.status !== "closed" ? (
            <form action={closePayrollPeriodAction}>
              <input type="hidden" name="periodId" value={openPeriod.id} />
              <button type="submit" className="btn btn-primary">
                Cerrar período
              </button>
            </form>
          ) : null}
        </div>
      </header>

      {!company ? (
        <div className="content-pad">
          <p className="muted">Crea una empresa para gestionar períodos.</p>
        </div>
      ) : (
        <>
          <section className="stats">
            <div className="stat">
              <span>Devengado</span>
              <b className="m">{sample ? formatCop(sample.grossTotal) : "—"}</b>
            </div>
            <div className="stat">
              <span>Deducciones</span>
              <b className="m">{sample ? formatCop(deductions) : "—"}</b>
            </div>
            <div className="stat strong">
              <span>Neto a pagar</span>
              <b className="m">{sample ? formatCop(sample.netTotal) : "—"}</b>
            </div>
            <div className="stat">
              <span>Empleados</span>
              <b className="m">{employees.length}</b>
            </div>
          </section>

          <div className="content-split">
            <div className="table-wrap content-pad stack">
              <section className="panel">
                <div className="label-caps" style={{ marginBottom: 12 }}>
                  Nuevo período
                </div>
                <form action={createPayrollPeriodAction} className="stack">
                  <input type="hidden" name="companyId" value={company.id} />
                  <div className="grid-3">
                    <div className="field">
                      <label htmlFor="label">Etiqueta</label>
                      <input id="label" name="label" required defaultValue={defaultLabel} />
                    </div>
                    <div className="field">
                      <label htmlFor="period_start">Inicio</label>
                      <input
                        id="period_start"
                        name="period_start"
                        type="date"
                        required
                        defaultValue={defaultStart}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="period_end">Fin</label>
                      <input
                        id="period_end"
                        name="period_end"
                        type="date"
                        required
                        defaultValue={defaultEnd}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ justifySelf: "start" }}>
                    Crear período
                  </button>
                </form>
              </section>

              <section className="panel">
                {employees.length === 0 ? (
                  <p className="muted" style={{ margin: 0 }}>
                    Agrega empleados para liquidar este período.{" "}
                    <Link href="/employees">Ir a empleados</Link>
                  </p>
                ) : (
                  <table className="table-html">
                    <thead>
                      <tr>
                        <th>Empleado</th>
                        <th>Cargo</th>
                        <th>Salario</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((e, idx) => (
                        <tr key={e.id}>
                          <td>
                            <b>{e.full_name}</b>
                          </td>
                          <td>{e.job_title || "—"}</td>
                          <td className="m">{formatCop(e.monthly_salary)}</td>
                          <td>
                            <span className={idx === 0 && sample ? "chip chip-warn" : "chip chip-ok"}>
                              {idx === 0 && sample ? "Revisar" : "Listo"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              {periods.length > 0 ? (
                <section className="panel">
                  <div className="label-caps" style={{ marginBottom: 8 }}>
                    Historial
                  </div>
                  <table className="table-html">
                    <thead>
                      <tr>
                        <th>Período</th>
                        <th>Rango</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {periods.map((run) => (
                        <tr key={run.id}>
                          <td>
                            <b>{run.label}</b>
                          </td>
                          <td className="m">
                            {run.period_start} → {run.period_end}
                          </td>
                          <td>
                            <span
                              className={
                                run.status === "closed" ? "chip chip-ok" : "chip chip-warn"
                              }
                            >
                              {run.status === "closed" ? "Cerrado" : "Borrador"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              ) : null}
            </div>

            <aside className="detail">
              {sample && first ? (
                <>
                  <div className="label-caps">Detalle</div>
                  <h2>{first.full_name}</h2>
                  <div className="sub">
                    {first.job_title || "Empleado"} ·{" "}
                    {first.contract_type.replaceAll("_", " ").toLowerCase()}
                  </div>
                  <div className="group-title">Devengado</div>
                  {sample.earnings.map((line) => (
                    <div className="line" key={`${line.code}-${line.label}`}>
                      <span>{line.label}</span>
                      <span className="m">{formatCop(line.amount)}</span>
                    </div>
                  ))}
                  <div className="group-title">Deducciones</div>
                  {sample.legalDeductions.map((line) => (
                    <div className="line" key={`${line.code}-${line.label}`}>
                      <span>{line.label}</span>
                      <span className="m">−{formatCop(line.amount)}</span>
                    </div>
                  ))}
                  <div className="net">
                    <b>Neto</b>
                    <span className="m">{formatCop(sample.netTotal)}</span>
                  </div>
                  <div className="detail-actions">
                    <Link href="/colilla" className="btn btn-accent">
                      Ver colilla
                    </Link>
                    <Link href="/employees" className="btn">
                      Empleados
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="label-caps">Detalle</div>
                  <h2>Sin liquidación</h2>
                  <div className="sub">Agrega un empleado para ver el desglose.</div>
                  <div className="detail-actions">
                    <Link href="/employees" className="btn btn-accent">
                      Agregar empleado
                    </Link>
                  </div>
                </>
              )}
            </aside>
          </div>
        </>
      )}
    </AppShell>
  );
}
