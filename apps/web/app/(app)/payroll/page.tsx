import { AppShell } from "@/components/layout/AppShell";
import { demoPayrollRuns } from "@/lib/demo-data";
import { formatCop } from "@/lib/format";
import {
  liquidateMonth,
  type EmployeeProfile,
  type WorkDayEntry,
} from "@nominapp/payroll-engine";

export const metadata = { title: "Nómina" };

function sampleLiquidation() {
  const profile: EmployeeProfile = {
    name: "Ana María Restrepo",
    documentId: "1030587941",
    jobTitle: "Operaria",
    monthlySalary: 1_750_905,
    dailyHours: 8,
    contractType: "INDEFINIDO",
    payPeriodType: "MONTHLY",
    pendingVacationDays: 0,
  };
  const entries: WorkDayEntry[] = [
    "2026-03-02",
    "2026-03-03",
    "2026-03-04",
    "2026-03-05",
    "2026-03-06",
    "2026-03-09",
    "2026-03-10",
    "2026-03-11",
    "2026-03-12",
    "2026-03-13",
  ].map((date) => ({
    date,
    start: "08:00",
    end: "17:00",
    dayType: "NORMAL" as const,
  }));
  return liquidateMonth(profile, 2026, 3, entries);
}

export default function PayrollPage() {
  const sample = sampleLiquidation();

  return (
    <AppShell active="/payroll">
      <div className="stack">
        <header>
          <p className="eyebrow">Liquidación</p>
          <h1 className="page-title">Nómina</h1>
          <p className="page-lead">
            Períodos por empresa. El motor calcula horas, descanso remunerado, IBC sin auxilio
            de transporte y aportes de salud/pensión.
          </p>
        </header>

        <div>
          <button type="button" className="btn btn-primary">
            Nuevo período
          </button>
        </div>

        <section className="panel">
          <table className="table">
            <thead>
              <tr>
                <th>Período</th>
                <th>Empleados</th>
                <th>Bruto est.</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {demoPayrollRuns.map((run) => (
                <tr key={run.id}>
                  <td>
                    <strong>{run.label}</strong>
                    <div className="muted" style={{ fontSize: "0.85rem" }}>
                      {run.periodStart} → {run.periodEnd}
                    </div>
                  </td>
                  <td>{run.employees}</td>
                  <td>{formatCop(run.grossEstimate)}</td>
                  <td>
                    <span className={run.status === "Cerrado" ? "badge" : "badge badge-warn"}>
                      {run.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panel anim-rise">
          <p className="eyebrow">Vista previa del motor</p>
          <h2 style={{ margin: "0.35rem 0 0.75rem", fontSize: "1.2rem" }}>
            Ana María · 10 días (mar 2026)
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
      </div>
    </AppShell>
  );
}
