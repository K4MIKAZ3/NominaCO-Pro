import { AppShell } from "@/components/layout/AppShell";
import { demoEmployees } from "@/lib/demo-data";
import { formatCop } from "@/lib/format";

export const metadata = { title: "Empleados" };

export default function EmployeesPage() {
  return (
    <AppShell active="/employees">
      <div className="stack">
        <header>
          <p className="eyebrow">Talento</p>
          <h1 className="page-title">Empleados</h1>
          <p className="page-lead">
            Perfiles contractuales usados por el motor: salario, jornada diaria, tipo de contrato
            y período de pago.
          </p>
        </header>

        <div>
          <button type="button" className="btn btn-primary">
            Agregar empleado
          </button>
        </div>

        <section className="panel">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Cargo</th>
                <th>Contrato</th>
                <th>Salario</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {demoEmployees.map((e) => (
                <tr key={e.id}>
                  <td>
                    <strong>{e.name}</strong>
                  </td>
                  <td>{e.documentId}</td>
                  <td>{e.jobTitle}</td>
                  <td>{e.contractType.replaceAll("_", " ")}</td>
                  <td>{formatCop(e.monthlySalary)}</td>
                  <td>
                    <span className="badge">{e.status}</span>
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
