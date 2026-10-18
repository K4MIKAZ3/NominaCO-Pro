import { AppShell } from "@/components/layout/AppShell";
import { demoCompanies } from "@/lib/demo-data";

export const metadata = { title: "Empresas" };

export default function CompaniesPage() {
  return (
    <AppShell active="/companies">
      <div className="stack">
        <header>
          <p className="eyebrow">Multi-tenant</p>
          <h1 className="page-title">Empresas</h1>
          <p className="page-lead">
            Cada empresa tiene NIT, miembros con rol y empleados propios. El aislamiento es por
            <code> company_id</code> + RLS.
          </p>
        </header>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button type="button" className="btn btn-primary">
            Nueva empresa
          </button>
        </div>

        <section className="panel">
          <table className="table">
            <thead>
              <tr>
                <th>Razón social</th>
                <th>NIT</th>
                <th>Ciudad</th>
                <th>Empleados</th>
                <th>Nómina</th>
              </tr>
            </thead>
            <tbody>
              {demoCompanies.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                  </td>
                  <td>{c.nit}</td>
                  <td>{c.city}</td>
                  <td>{c.employeesActive}</td>
                  <td>
                    <span className={c.payrollOpen ? "badge" : "badge badge-warn"}>
                      {c.payrollOpen ? "Abierta" : "Cerrada"}
                    </span>
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
