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
  const defaultEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const defaultLabel = now.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
  const openCount = periods.filter((p) => p.status !== "closed").length;

  return (
    <AppShell
      active="/payroll"
      company={company}
      companies={companies}
      counts={{ employees: employees.length, periods: periods.length }}
    >
      <header className="page-head">
        <div>
          <div className="crumb">Nómina</div>
          <h1>Períodos de liquidación</h1>
          <p className="page-lead">Crea, revisa y cierra quincenas o meses por empresa.</p>
        </div>
        <div className="actions">
          {openCount > 0 ? (
            <span className="chip chip-warn">{openCount} abiertos</span>
          ) : (
            <span className="chip chip-ok">Al día</span>
          )}
        </div>
      </header>

      {!company ? (
        <div className="content-pad">
          <p className="muted">Crea una empresa para gestionar períodos.</p>
        </div>
      ) : (
        <>
          {sample ? (
            <section className="stats">
              <div className="stat">
                <span>Devengado (preview)</span>
                <b className="m">{formatCop(sample.grossTotal)}</b>
              </div>
              <div className="stat">
                <span>Deducciones</span>
                <b className="m">
                  {formatCop(sample.legalDeductions.reduce((s, d) => s + d.amount, 0))}
                </b>
              </div>
              <div className="stat strong">
                <span>Neto</span>
                <b className="m">{formatCop(sample.netTotal)}</b>
              </div>
              <div className="stat">
                <span>IBC</span>
                <b className="m">{formatCop(sample.ibcTotal)}</b>
              </div>
            </section>
          ) : null}

          <div className="content-pad stack">
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
              {periods.length === 0 ? (
                <p className="muted" style={{ margin: 0 }}>
                  Sin períodos todavía.
                </p>
              ) : (
                <table className="table-html">
                  <thead>
                    <tr>
                      <th>Período</th>
                      <th>Rango</th>
                      <th>Estado</th>
                      <th />
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
                        <td>
                          {run.status !== "closed" ? (
                            <form action={closePayrollPeriodAction}>
                              <input type="hidden" name="periodId" value={run.id} />
                              <button type="submit" className="btn btn-primary">
                                Cerrar período
                              </button>
                            </form>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            {sample && first ? (
              <section className="panel">
                <div className="label-caps">Detalle</div>
                <h2 style={{ margin: "6px 0 2px", fontSize: 22 }}>{first.full_name}</h2>
                <div className="sub muted" style={{ fontSize: 13 }}>
                  {first.job_title || "Empleado"} · preview 10 días
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
              </section>
            ) : (
              <p className="muted">Agrega un empleado para ver el detalle de liquidación.</p>
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}
