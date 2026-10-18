import { createCompanyAction } from "@/app/actions";
import { AppShell } from "@/components/layout/AppShell";
import { getActiveCompany, listCompanies } from "@/lib/supabase/data";

export const metadata = { title: "Empresas" };
export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const companies = await listCompanies();
  const company = await getActiveCompany();

  return (
    <AppShell active="/companies" company={company} companies={companies}>
      <div className="stack">
        <header>
          <p className="eyebrow">Multi-tenant</p>
          <h1 className="page-title">Empresas</h1>
          <p className="page-lead">
            Cada empresa tiene NIT, miembros con rol y empleados propios. El aislamiento es por
            <code> company_id</code> + RLS.
          </p>
        </header>

        <section className="panel">
          <h2 style={{ margin: "0 0 0.85rem", fontSize: "1.15rem" }}>Nueva empresa</h2>
          <form action={createCompanyAction} className="stack">
            <div className="grid-2">
              <div className="field">
                <label htmlFor="name">Razón social</label>
                <input id="name" name="name" required placeholder="Café Andino SAS" />
              </div>
              <div className="field">
                <label htmlFor="nit">NIT</label>
                <input id="nit" name="nit" required placeholder="901234567-8" />
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
            <p className="muted">Todavía no hay empresas. Crea la primera arriba.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Razón social</th>
                  <th>NIT</th>
                  <th>Ciudad</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.name}</strong>
                      {company?.id === c.id ? (
                        <span className="badge" style={{ marginLeft: "0.5rem" }}>
                          Activa
                        </span>
                      ) : null}
                    </td>
                    <td>{c.nit}</td>
                    <td>{c.city ?? "—"}</td>
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
