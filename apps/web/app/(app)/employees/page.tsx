import { createEmployeeAction } from "@/app/actions";
import { AppShell } from "@/components/layout/AppShell";
import { formatCop } from "@/lib/format";
import {
  getActiveCompany,
  listCompanies,
  listEmployees,
  listPayrollPeriods,
} from "@/lib/supabase/data";

export const metadata = { title: "Empleados" };
export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const companies = await listCompanies();
  const company = await getActiveCompany();
  const employees = company ? await listEmployees(company.id) : [];
  const periods = company ? await listPayrollPeriods(company.id) : [];

  return (
    <AppShell
      active="/employees"
      company={company}
      companies={companies}
      counts={{ employees: employees.length, periods: periods.length }}
    >
      <header className="page-head">
        <div>
          <div className="crumb">Empleados</div>
          <h1>Empleados</h1>
          <p className="page-lead">
            Contratos, salarios y jornadas que alimentan cada liquidación.
          </p>
        </div>
      </header>

      <div className="content-pad stack">
        {!company ? (
          <p className="muted">Crea una empresa antes de agregar empleados.</p>
        ) : (
          <>
            <section className="panel">
              <div className="label-caps" style={{ marginBottom: 12 }}>
                Agregar empleado
              </div>
              <form action={createEmployeeAction} className="stack">
                <input type="hidden" name="companyId" value={company.id} />
                <div className="grid-2">
                  <div className="field">
                    <label htmlFor="full_name">Nombre completo</label>
                    <input id="full_name" name="full_name" required />
                  </div>
                  <div className="field">
                    <label htmlFor="document_id">Documento</label>
                    <input id="document_id" name="document_id" required />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label htmlFor="job_title">Cargo</label>
                    <input id="job_title" name="job_title" placeholder="Mesero" />
                  </div>
                  <div className="field">
                    <label htmlFor="monthly_salary">Salario mensual</label>
                    <input
                      id="monthly_salary"
                      name="monthly_salary"
                      type="number"
                      min={1}
                      required
                      defaultValue={1750905}
                    />
                  </div>
                </div>
                <div className="grid-3">
                  <div className="field">
                    <label htmlFor="daily_hours">Horas/día</label>
                    <input id="daily_hours" name="daily_hours" type="number" step="0.5" defaultValue={8} />
                  </div>
                  <div className="field">
                    <label htmlFor="contract_type">Contrato</label>
                    <select id="contract_type" name="contract_type" defaultValue="INDEFINIDO">
                      <option value="INDEFINIDO">Indefinido</option>
                      <option value="TERMINO_DEFINIDO">Término fijo</option>
                      <option value="OBRA_LABOR">Obra o labor</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="pay_period_type">Pago</label>
                    <select id="pay_period_type" name="pay_period_type" defaultValue="BIWEEKLY">
                      <option value="BIWEEKLY">Quincenal</option>
                      <option value="MONTHLY">Mensual</option>
                      <option value="WEEKLY">Semanal</option>
                      <option value="VENTEEN">Catorcena</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ justifySelf: "start" }}>
                  Guardar
                </button>
              </form>
            </section>

            <section className="panel">
              {employees.length === 0 ? (
                <p className="muted" style={{ margin: 0 }}>
                  Sin empleados aún.
                </p>
              ) : (
                <table className="table-html">
                  <thead>
                    <tr>
                      <th>Empleado</th>
                      <th>Documento</th>
                      <th>Cargo</th>
                      <th>Contrato</th>
                      <th>Salario</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((e) => (
                      <tr key={e.id}>
                        <td>
                          <b>{e.full_name}</b>
                        </td>
                        <td className="m">{e.document_id}</td>
                        <td>{e.job_title || "—"}</td>
                        <td>{e.contract_type.replaceAll("_", " ")}</td>
                        <td className="m">{formatCop(e.monthly_salary)}</td>
                        <td>
                          <span className={e.active ? "chip chip-ok" : "chip chip-warn"}>
                            {e.active ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
