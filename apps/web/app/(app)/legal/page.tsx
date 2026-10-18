import { AppShell } from "@/components/layout/AppShell";
import { demoLegalSnapshots } from "@/lib/demo-data";
import { formatCop } from "@/lib/format";
import { SNAPSHOT_2026_H1, SNAPSHOT_2026_H2 } from "@nominapp/payroll-engine";

export const metadata = { title: "Legal" };

export default function LegalPage() {
  const snap = SNAPSHOT_2026_H2;
  return (
    <AppShell active="/legal">
      <div className="stack">
        <header>
          <p className="eyebrow">Parámetros por vigencia</p>
          <h1 className="page-title">Marco legal 2026</h1>
          <p className="page-lead">
            Snapshots versionados (no constantes anuales). Incluye festivo Chiquinquirá
            13-jul-2026 (Ley 2578) y el cambio de jornada a 42 h desde el 15 de julio.
          </p>
        </header>

        <section className="grid-2">
          <div className="panel">
            <p className="eyebrow">SMMLV</p>
            <p style={{ fontSize: "1.8rem", margin: "0.4rem 0", fontFamily: "var(--font-brand)" }}>
              {formatCop(SNAPSHOT_2026_H1.smmlv)}
            </p>
            <p className="muted">
              Auxilio transporte {formatCop(SNAPSHOT_2026_H1.transportSubsidy)}
            </p>
          </div>
          <div className="panel">
            <p className="eyebrow">Vigente H2</p>
            <p style={{ margin: "0.5rem 0 0" }}>
              Jornada semanal <strong>{snap.weeklyHoursLimit} h</strong> · Dominical{" "}
              <strong>+{Math.round((snap.dominicalFactor - 1) * 100)} %</strong>
            </p>
            <p className="muted" style={{ marginTop: "0.4rem" }}>
              Festivos en snapshot: {snap.officialHolidays.length} (incluye 2026-07-13)
            </p>
          </div>
        </section>

        <section className="panel">
          <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.15rem" }}>Vigencias semilla</h2>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Rango</th>
                <th>Jornada</th>
                <th>Recargo dominical</th>
              </tr>
            </thead>
            <tbody>
              {demoLegalSnapshots.map((s) => (
                <tr key={s.id}>
                  <td>
                    <code>{s.id}</code>
                  </td>
                  <td>{s.range}</td>
                  <td>{s.weeklyHours} h</td>
                  <td>{s.dominical}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </AppShell>
  );
}
