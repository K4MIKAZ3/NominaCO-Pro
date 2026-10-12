"use client";

import { useMemo, useState } from "react";
import { formatHours, formatMoney } from "@/lib/empresas/format";
import { daysInMonth, monthPrefix } from "@/lib/empresas/law";
import { liquidatePeriod } from "@/lib/empresas/payroll";
import { useEmpresas } from "@/lib/empresas/store";
import { employeeName } from "@/lib/empresas/types";

export function NominaView() {
  const { state } = useEmpresas();
  const periodEnd = `${monthPrefix(state.period.year, state.period.month)}-${String(daysInMonth(state.period.year, state.period.month)).padStart(2, "0")}`;
  const [openId, setOpenId] = useState<string | null>(state.role === "trabajador" ? state.workerId : state.employees[0]?.id ?? null);
  const slips = useMemo(
    () => liquidatePeriod(state.employees, state.assignments, state.clocks, state.company, state.novedades, periodEnd),
    [state.employees, state.assignments, state.clocks, state.company, state.novedades, periodEnd],
  );
  const visible = state.role === "trabajador" ? slips.filter((slip) => slip.workerId === state.workerId) : slips;
  const totals = visible.reduce(
    (sum, slip) => ({
      gross: sum.gross + slip.gross,
      deductions: sum.deductions + slip.deductions,
      net: sum.net + slip.net,
    }),
    { gross: 0, deductions: 0, net: 0 },
  );

  return (
    <div className="nx-stack">
      <section className="nx-card">
        <h2>Nómina del mes</h2>
        <p>
          Corte del mes comercial de 30 días. Entran los turnos publicados que ya tienen entrada y salida. El valor de
          la hora es el salario mensual dividido entre 30 y entre la jornada diaria.
        </p>
        <div className="nx-stats">
          <article>
            <span>Devengado</span>
            <strong>{formatMoney(totals.gross)}</strong>
          </article>
          <article>
            <span>Descuentos</span>
            <strong>{formatMoney(totals.deductions)}</strong>
          </article>
          <article>
            <span>Neto a pagar</span>
            <strong>{formatMoney(totals.net)}</strong>
          </article>
        </div>
      </section>
      {visible.map((slip) => {
        const worker = state.employees.find((item) => item.id === slip.workerId);
        const open = openId === slip.workerId;
        return (
          <section className="nx-card" key={slip.workerId}>
            <button
              type="button"
              className="nx-slip-head"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : slip.workerId)}
            >
              <span>
                <strong>{worker ? employeeName(worker) : slip.workerId}</strong>
                <small>
                  {worker?.jobTitle} · {slip.workedDays} días pagos · {slip.absences} ausencias · extra {formatHours(slip.extraHours)}
                </small>
              </span>
              <em>{formatMoney(slip.net)}</em>
            </button>
            {open ? (
              <div className="nx-slip">
                {slip.incomplete > 0 ? (
                  <p className="nx-note">{slip.incomplete} marcación incompleta: falta la salida, así que ese día aún no se paga.</p>
                ) : null}
                {slip.warnings.map((warning) => (
                  <p className="nx-note" key={warning}>
                    {warning}
                  </p>
                ))}
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Concepto</th>
                      <th scope="col">Horas</th>
                      <th scope="col">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slip.lines.map((line) => (
                      <tr key={`${slip.workerId}-${line.label}`} className={line.deduction ? "is-deduction" : ""}>
                        <td>{line.label}</td>
                        <td>{line.hours != null ? formatHours(line.hours) : "—"}</td>
                        <td>{line.deduction ? `−${formatMoney(line.amount)}` : formatMoney(line.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="nx-muted">Salario del contrato: {formatMoney(worker?.monthlySalary ?? 0)} · jornada de {worker?.dailyHours} h.</p>
                {state.role !== "trabajador" ? (
                  <div className="nx-cost">
                    <h3>Costo del empleador</h3>
                    <p>Pensión {formatMoney(slip.employer.pension)} · Salud {formatMoney(slip.employer.health)} · ARL {formatMoney(slip.employer.arl)} · Caja {formatMoney(slip.employer.ccf)} · SENA {formatMoney(slip.employer.sena)} · ICBF {formatMoney(slip.employer.icbf)}</p>
                    <p>Provisión cesantías {formatMoney(slip.employer.cesantias)} · intereses {formatMoney(slip.employer.interesesCesantias)} · prima {formatMoney(slip.employer.prima)} · vacaciones {formatMoney(slip.employer.vacaciones)}</p>
                    <p><strong>Total empleador {formatMoney(slip.employer.total)}</strong></p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
