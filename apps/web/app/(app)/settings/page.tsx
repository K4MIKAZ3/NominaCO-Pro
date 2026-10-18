import { AppShell } from "@/components/layout/AppShell";
import {
  countActiveEmployees,
  getActiveCompany,
  listCompanies,
  listPayrollPeriods,
  requireUser,
} from "@/lib/supabase/data";

export const metadata = { title: "Ajustes" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { user } = await requireUser();
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
      active="/settings"
      company={company}
      companies={companies}
      counts={{ employees: employeeCount, periods: periods.length }}
    >
      <header className="page-head">
        <div>
          <div className="crumb">Ajustes</div>
          <h1>Cuenta</h1>
          <p className="page-lead">Datos de tu sesión y empresa activa.</p>
        </div>
      </header>

      <div className="content-pad">
        <section className="panel stack">
          <div className="field">
            <label>Correo</label>
            <input value={user.email ?? ""} readOnly />
          </div>
          <div className="field">
            <label>Empresa activa</label>
            <input
              value={company ? `${company.name} · ${company.nit}` : "Ninguna"}
              readOnly
            />
          </div>
          <div className="field">
            <label>Idioma</label>
            <input value="Español (Colombia)" readOnly />
          </div>
          <div className="field">
            <label>Zona horaria</label>
            <input value="America/Bogota" readOnly />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
