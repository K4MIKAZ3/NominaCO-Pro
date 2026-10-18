import { AppShell } from "@/components/layout/AppShell";
import { formatCop } from "@/lib/format";
import {
  getActiveCompany,
  listCompanies,
  listHolidays,
  listLegalSnapshots,
} from "@/lib/supabase/data";

export const metadata = { title: "Legal" };
export const dynamic = "force-dynamic";

export default async function LegalPage() {
  const companies = await listCompanies();
  const company = await getActiveCompany();
  const [snapshots, holidays] = await Promise.all([listLegalSnapshots(), listHolidays()]);
  const h2 = snapshots.find((s) => s.id === "co-2026-h2") ?? snapshots[snapshots.length - 1];
  const h1 = snapshots.find((s) => s.id === "co-2026-h1") ?? snapshots[0];

  return (
    <AppShell active="/legal" company={company} companies={companies}>
      <div className="stack">
        <header>
          <p className="eyebrow">Parámetros por vigencia</p>
          <h1 className="page-title">Marco legal</h1>
          <p className="page-lead">
            Datos vivos desde Supabase (`legal_parameter_sets` / `official_holidays`), no
            constantes hardcodeadas.
          </p>
        </header>

        {h1 ? (
          <section className="grid-2">
            <div className="panel">
              <p className="eyebrow">SMMLV</p>
              <p style={{ fontSize: "1.8rem", margin: "0.4rem 0", fontFamily: "var(--font-brand)" }}>
                {formatCop(h1.smmlv)}
              </p>
              <p className="muted">Auxilio transporte {formatCop(h1.transport_subsidy)}</p>
            </div>
            <div className="panel">
              <p className="eyebrow">{h2?.id ?? "Vigencia"}</p>
              <p style={{ margin: "0.5rem 0 0" }}>
                Jornada semanal <strong>{h2?.weekly_hours_limit ?? "—"} h</strong> · Dominical{" "}
                <strong>
                  +{h2 ? Math.round((Number(h2.dominical_factor) - 1) * 100) : "—"} %
                </strong>
              </p>
              <p className="muted" style={{ marginTop: "0.4rem" }}>
                Festivos: {holidays.length} (incluye 2026-07-13 si está sembrado)
              </p>
            </div>
          </section>
        ) : null}

        <section className="panel">
          <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.15rem" }}>Vigencias</h2>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Desde</th>
                <th>Hasta</th>
                <th>Jornada</th>
                <th>Dominical</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((s) => (
                <tr key={s.id}>
                  <td>
                    <code>{s.id}</code>
                  </td>
                  <td>{s.valid_from}</td>
                  <td>{s.valid_to ?? "—"}</td>
                  <td>{s.weekly_hours_limit} h</td>
                  <td>+{Math.round((Number(s.dominical_factor) - 1) * 100)} %</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panel">
          <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.15rem" }}>Festivos</h2>
          <table className="table">
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
                  <td>{h.holiday_date}</td>
                  <td>{h.label}</td>
                  <td>{h.legal_basis ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </AppShell>
  );
}
