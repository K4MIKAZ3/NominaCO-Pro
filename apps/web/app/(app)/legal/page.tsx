import { AppShell } from "@/components/layout/AppShell";
import { formatCop } from "@/lib/format";
import {
  countActiveEmployees,
  getActiveCompany,
  listCompanies,
  listHolidays,
  listLegalSnapshots,
  listPayrollPeriods,
} from "@/lib/supabase/data";

export const metadata = { title: "Legal" };
export const dynamic = "force-dynamic";

export default async function LegalPage() {
  const companies = await listCompanies();
  const company = await getActiveCompany();
  const [snapshots, holidays, employeeCount, periods] = await Promise.all([
    listLegalSnapshots(),
    listHolidays(),
    company ? countActiveEmployees(company.id) : Promise.resolve(0),
    company ? listPayrollPeriods(company.id) : Promise.resolve([]),
  ]);
  const current = snapshots[snapshots.length - 1];
  const base = snapshots[0];

  return (
    <AppShell
      active="/legal"
      company={company}
      companies={companies}
      counts={{ employees: employeeCount, periods: periods.length }}
    >
      <header className="page-head">
        <div>
          <div className="crumb">Legal</div>
          <h1>Parámetros laborales</h1>
          <p className="page-lead">
            SMMLV, auxilio de transporte, jornada y festivos vigentes para Colombia.
          </p>
        </div>
      </header>

      {base ? (
        <section className="stats">
          <div className="stat">
            <span>SMMLV</span>
            <b className="m">{formatCop(base.smmlv)}</b>
          </div>
          <div className="stat">
            <span>Auxilio transporte</span>
            <b className="m">{formatCop(base.transport_subsidy)}</b>
          </div>
          <div className="stat strong">
            <span>Jornada semanal</span>
            <b className="m">{current?.weekly_hours_limit ?? "—"} h</b>
          </div>
          <div className="stat">
            <span>Festivos</span>
            <b className="m">{holidays.length}</b>
          </div>
        </section>
      ) : null}

      <div className="content-pad stack">
        <section className="panel">
          <div className="label-caps" style={{ marginBottom: 8 }}>
            Vigencias
          </div>
          <table className="table-html">
            <thead>
              <tr>
                <th>Desde</th>
                <th>Hasta</th>
                <th>Jornada</th>
                <th>Dominical</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((s) => (
                <tr key={s.id}>
                  <td className="m">{s.valid_from}</td>
                  <td className="m">{s.valid_to ?? "—"}</td>
                  <td className="m">{s.weekly_hours_limit} h</td>
                  <td className="m">
                    +{Math.round((Number(s.dominical_factor) - 1) * 100)} %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panel">
          <div className="label-caps" style={{ marginBottom: 8 }}>
            Festivos
          </div>
          <table className="table-html">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Nombre</th>
                <th>Base</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((h) => (
                <tr key={h.id}>
                  <td className="m">{h.holiday_date}</td>
                  <td>{h.label}</td>
                  <td className="muted">{h.legal_basis ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </AppShell>
  );
}
