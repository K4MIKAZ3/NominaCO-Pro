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

function sampleEntriesForMonth(year: number, month: number): WorkDayEntry[] {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  // 10 weekdays sample starting on the 2nd when possible
  const days = ["02", "03", "04", "05", "06", "09", "10", "11", "12", "13"];
  return days.map((d) => ({
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
    const profile: EmployeeProfile = {
      name: first.full_name,
      documentId: first.document_id,
      jobTitle: first.job_title,
      monthlySalary: first.monthly_salary,
      dailyHours: Number(first.daily_hours),
      contractType: first.contract_type,
      payPeriodType: first.pay_period_type,
      pendingVacationDays: Number(first.pending_vacation_days),
    };
    sample = liquidateMonth(profile, 2026, 3, sampleEntriesForMonth(2026, 3));
  }

  const now = new Date();
  const defaultStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const defaultEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const defaultLabel = now.toLocaleDateString("es-CO", { month: "long", year: "numeric" });

  return (
    <AppShell active="/payroll" company={company} companies={companies}>
      <div className="stack">
        <header>
          <p className="eyebrow">Liquidación</p>
          <h1 className="page-title">Nómina</h1>
          <p className="page-lead">
            Períodos por empresa. El motor calcula horas, descanso remunerado, IBC sin auxilio
            de transporte y aportes.
          </p>
        </header>

        {!company ? (
          <p className="muted">Crea una empresa para gestionar períodos.</p>
        ) : (
          <>
            <section className="panel">
              <h2 style={{ margin: "0 0 0.85rem", fontSize: "1.15rem" }}>Nuevo período</h2>
              <form action={createPayrollPeriodAction} className="stack">
                <input type="hidden" name="companyId" value={company.id} />
                <div className="grid-3">
                  <div className="field">
                    <label htmlFor="label">Etiqueta</label>
                    <input id="label" name="label" required defaultValue={defaultLabel} />
                  </div>
                  <div className="field">
                    <label htmlFor="period_start">Inicio</label>
                    <input id="period_start" name="period_start" type="date" required defaultValue={defaultStart} />
                  </div>
                  <div className="field">
                    <label htmlFor="period_end">Fin</label>
                    <input id="period_end" name="period_end" type="date" required defaultValue={defaultEnd} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ justifySelf: "start" }}>
                  Crear período
                </button>
              </form>
            </section>

            <section className="panel">
              {periods.length === 0 ? (
                <p className="muted">Sin períodos todavía.</p>
              ) : (
                <table className="table">
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
                          <strong>{run.label}</strong>
                        </td>
                        <td>
                          {run.period_start} → {run.period_end}
                        </td>
                        <td>
                          <span className={run.status === "closed" ? "badge" : "badge badge-warn"}>
                            {run.status}
                          </span>
                        </td>
                        <td>
                          {run.status !== "closed" ? (
                            <form action={closePayrollPeriodAction}>
                              <input type="hidden" name="periodId" value={run.id} />
                              <button type="submit" className="btn btn-ghost">
                                Cerrar
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
              <section className="panel anim-rise">
                <p className="eyebrow">Vista previa del motor</p>
                <h2 style={{ margin: "0.35rem 0 0.75rem", fontSize: "1.2rem" }}>
                  {first.full_name} · 10 días muestra (mar 2026)
                </h2>
                <div className="grid-3" style={{ marginBottom: "1rem" }}>
                  <div>
                    <p className="muted" style={{ margin: 0 }}>
                      Bruto
                    </p>
                    <strong>{formatCop(sample.grossTotal)}</strong>
                  </div>
                  <div>
                    <p className="muted" style={{ margin: 0 }}>
                      IBC (sin ST)
                    </p>
                    <strong>{formatCop(sample.ibcTotal)}</strong>
                  </div>
                  <div>
                    <p className="muted" style={{ margin: 0 }}>
                      Neto
                    </p>
                    <strong>{formatCop(sample.netTotal)}</strong>
                  </div>
                </div>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Concepto</th>
                      <th>Código</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...sample.earnings, ...sample.legalDeductions].map((line) => (
                      <tr key={`${line.code}-${line.label}`}>
                        <td>{line.label}</td>
                        <td>{line.code ?? "—"}</td>
                        <td style={{ color: line.isDeduction ? "var(--danger)" : undefined }}>
                          {line.isDeduction ? "−" : ""}
                          {formatCop(line.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ) : (
              <p className="muted">Agrega un empleado para ver la preview del motor.</p>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
