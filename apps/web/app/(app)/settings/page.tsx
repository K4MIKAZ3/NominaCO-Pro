import { AppShell } from "@/components/layout/AppShell";

export const metadata = { title: "Ajustes" };

export default function SettingsPage() {
  return (
    <AppShell active="/settings">
      <div className="stack">
        <header>
          <p className="eyebrow">Cuenta</p>
          <h1 className="page-title">Ajustes</h1>
          <p className="page-lead">
            Preferencias del panel empleador. La integración con Supabase Auth y el selector
            de empresa activa llegan con el esquema multi-tenant.
          </p>
        </header>

        <section className="panel stack">
          <div className="field">
            <label htmlFor="locale">Idioma</label>
            <select id="locale" defaultValue="es-CO">
              <option value="es-CO">Español (Colombia)</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="tz">Zona horaria</label>
            <select id="tz" defaultValue="America/Bogota">
              <option value="America/Bogota">America/Bogota</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="currency">Moneda</label>
            <input id="currency" value="COP" readOnly />
          </div>
          <button type="button" className="btn btn-primary" style={{ justifySelf: "start" }}>
            Guardar (demo)
          </button>
        </section>
      </div>
    </AppShell>
  );
}
