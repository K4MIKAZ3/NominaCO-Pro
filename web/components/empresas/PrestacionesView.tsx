"use client";

import { formatMoney } from "@/lib/empresas/format";
import { DIAS_MES, SMMLV, SUBSIDIO_TRANSPORTE, qualifiesTransport } from "@/lib/empresas/law";
import { useEmpresas } from "@/lib/empresas/store";
import { employeeName } from "@/lib/empresas/types";
import type { Employee } from "@/lib/empresas/types";

function causedDays(hireDate: string, year: number, month: number): number {
  const startMonth = hireDate.slice(0, 7) > `${year}-01` ? Number(hireDate.slice(5, 7)) : 1;
  const startYear = Number(hireDate.slice(0, 4));
  const first = startYear < year ? 1 : startMonth;
  return Math.max(0, (month - first + 1) * DIAS_MES);
}

function snapshot(employee: Employee, year: number, month: number) {
  const days = causedDays(employee.hireDate, year, month);
  const integral = employee.salaryMode === "integral";
  const transport = qualifiesTransport(employee.monthlySalary, integral) ? SUBSIDIO_TRANSPORTE : 0;
  const base = employee.monthlySalary + transport;
  const vacationBase = integral ? Math.round(employee.monthlySalary * 0.7) : employee.monthlySalary;
  const cesantias = integral ? 0 : Math.round((base * days) / 360);
  const intereses = integral ? 0 : Math.round((cesantias * 0.12 * days) / 360);
  const primaDays = month <= 6 ? days : Math.max(0, (month - 6) * DIAS_MES);
  const prima = integral ? 0 : Math.round((base * primaDays) / 360);
  const vacationDays = (15 * days) / 360;
  const vacaciones = Math.round((vacationBase / 30) * vacationDays);
  return { days, cesantias, intereses, prima, primaDays, vacaciones };
}

export function PrestacionesView() {
  const { state } = useEmpresas();
  const { year, month } = state.period;
  const rows = state.employees.filter((employee) => employee.active).map((employee) => ({
    employee,
    ...snapshot(employee, year, month),
  }));

  return (
    <div className="nx-stack">
      <section className="nx-card">
        <h2>Prestaciones causadas</h2>
        <p>
          Año comercial de 360 días, con el salario vigente. Cesantías e intereses se consignan y pagan en enero y
          febrero. La prima del semestre vence el {month <= 6 ? "30 de junio" : "20 de diciembre"}. Las vacaciones son
          15 días hábiles por año y no llevan auxilio de transporte. El salario integral no causa prima ni cesantías.
        </p>
        <p className="nx-muted">Mínimo de referencia {formatMoney(SMMLV)}. Auxilio de transporte {formatMoney(SUBSIDIO_TRANSPORTE)}.</p>
      </section>
      {rows.map((row) => (
        <section className="nx-card" key={row.employee.id}>
          <h2>{employeeName(row.employee)}</h2>
          <p className="nx-muted">
            {row.days} días causados en {year} · contrato {row.employee.contractType.toLowerCase()} desde {row.employee.hireDate}
          </p>
          <div className="nx-stats">
            <article>
              <span>Cesantías</span>
              <strong>{formatMoney(row.cesantias)}</strong>
            </article>
            <article>
              <span>Intereses</span>
              <strong>{formatMoney(row.intereses)}</strong>
            </article>
            <article>
              <span>Prima del semestre</span>
              <strong>{formatMoney(row.prima)}</strong>
            </article>
            <article>
              <span>Vacaciones en dinero</span>
              <strong>{formatMoney(row.vacaciones)}</strong>
            </article>
          </div>
        </section>
      ))}
    </div>
  );
}
