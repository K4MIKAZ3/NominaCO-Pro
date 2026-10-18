import { createCompanyAction } from "@/app/actions";
import { AppShell } from "@/components/layout/AppShell";
import {
  countActiveEmployees,
  getActiveCompany,
  listCompanies,
  listPayrollPeriods,
} from "@/lib/supabase/data";

export const metadata = { title: "Empresas" };
export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const companies = await listCompanies();
  const company = await getActiveCompany();
  const [employeeCount, periods] = company
    ? await Promise.all([
        countActiveEmployees(company.id),
        listPayrollPeriods(company.id),
      ])
    : [0, []];

  return (
    <AppShell
      active="/companies"
      company={company}
      companies={companies}
      counts={{ employees: employeeCount, periods: periods.length }}
    >
      <header className="page-head">
        <div>
          <div className="crumb">Empresas</div>
          <h1>Empresas</h1>
          <p className="page-lead">
            Cada empresa tiene su propio NIT, equipo y períodos de nómina.
          </p>
        </div>
      </header>

      <div className="content-pad stack">
        <section className="panel">
          <div className="label-caps" style={{ marginBottom: 12 }}>
            Nueva empresa
          </div>
          <form action={createCompanyAction} className="stack">
            <div className="grid-2">
              <div className="field">
                <label htmlFor="name">Razón social</label>
                <input id="name" name="name" required placeholder="Restaurante El Fogón S.A.S." />
              </div>
              <div className="field">
                <label htmlFor="nit">NIT</label>
                <input id="nit" name="nit" required placeholder="901.234.567-8" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="city">Ciudad</label>
              <input id="city" name="city" placeholder="Medellín" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ justifySelf: "start" }}>
              Crear empresa
            </button>
          </form>
        </section>

        <section className="panel">
          {companies.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>
              Todavía no hay empresas.
            </p>
          ) : (
            <table className="table-html">
              <thead>
                <tr>
                  <th>Razón social</th>
                  <th>NIT</th>
                  <th>Ciudad</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <b>{c.name}</b>
                    </td>
                    <td className="m">{c.nit}</td>
                    <td>{c.city ?? "—"}</td>
                    <td>
                      {company?.id === c.id ? (
                        <span className="chip chip-ok">Activa</span>
                      ) : null}
                    </td>
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
