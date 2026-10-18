import { AppShell } from "@/components/layout/AppShell";
import { getActiveCompany, listCompanies, requireUser } from "@/lib/supabase/data";
import { siteUrl, supabaseUrl } from "@/lib/supabase/env";

export const metadata = { title: "Ajustes" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { user } = await requireUser();
  const companies = await listCompanies();
  const company = await getActiveCompany();

  return (
    <AppShell active="/settings" company={company} companies={companies}>
      <div className="stack">
        <header>
          <p className="eyebrow">Cuenta</p>
          <h1 className="page-title">Ajustes</h1>
          <p className="page-lead">Sesión y entorno conectados a producción.</p>
        </header>

        <section className="panel stack">
          <div className="field">
            <label>Usuario</label>
            <input value={user.email ?? user.id} readOnly />
          </div>
          <div className="field">
            <label>Supabase</label>
            <input value={supabaseUrl} readOnly />
          </div>
          <div className="field">
            <label>Site URL</label>
            <input value={siteUrl} readOnly />
          </div>
          <div className="field">
            <label>Empresa activa</label>
            <input value={company ? `${company.name} (${company.nit})` : "Ninguna"} readOnly />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
