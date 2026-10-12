"use client";

import { useMemo } from "react";
import { formatMoney } from "@/lib/empresas/format";
import { daysInMonth, monthPrefix } from "@/lib/empresas/law";
import { liquidatePeriod } from "@/lib/empresas/payroll";
import { buildPilaFile, dueLabel, pilaCsv } from "@/lib/empresas/pila";
import { useEmpresas } from "@/lib/empresas/store";
import { employeeName } from "@/lib/empresas/types";

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function PilaView() {
  const { state } = useEmpresas();
  const { year, month } = state.period;
  const periodEnd = `${monthPrefix(year, month)}-${String(daysInMonth(year, month)).padStart(2, "0")}`;
  const slips = useMemo(
    () => liquidatePeriod(state.employees, state.assignments, state.clocks, state.company, state.novedades, periodEnd),
    [state.employees, state.assignments, state.clocks, state.company, state.novedades, periodEnd],
  );
  const company = state.company;
  const file = company ? buildPilaFile(company, state.employees, slips, year, month) : null;
  const payable = slips.filter((slip) => slip.pila.days > 0);
  const totals = payable.reduce(
    (sum, slip) => ({
      ibc: sum.ibc + slip.pila.ibc,
      pension: sum.pension + slip.pila.pensionPay,
      health: sum.health + slip.pila.healthPay,
      arl: sum.arl + slip.pila.arlPay,
      ccf: sum.ccf + slip.pila.ccfPay,
      sena: sum.sena + slip.pila.senaPay,
      icbf: sum.icbf + slip.pila.icbfPay,
      fsp: sum.fsp + slip.pila.fspSolidaridad + slip.pila.fspSubsistencia,
    }),
    { ibc: 0, pension: 0, health: 0, arl: 0, ccf: 0, sena: 0, icbf: 0, fsp: 0 },
  );

  if (!company || !file) {
    return (
      <section className="nx-card">
        <h2>PILA</h2>
        <p>Primero guarda la ficha de la empresa.</p>
      </section>
    );
  }

  const period = monthPrefix(year, month);
  return (
    <div className="nx-stack">
      <section className="nx-card">
        <h2>Planilla integrada · {period}</h2>
        <p>
          Planilla E, cotizante dependiente. Vencimiento según el NIT {company.nit}-{company.dv}: {dueLabel(company.nit)}.
          La empresa {company.exonerated ? "está marcada como exonerada" : "no está exonerada"} de salud patronal, SENA e ICBF.
        </p>
        <p className="nx-note">
          El archivo plano sigue el registro tipo 1 ({file.headerLength} caracteres) y el registro tipo 2 (
          {file.detailLength || "—"} caracteres) del Anexo Técnico 2. Revísalo en el operador antes de pagarlo: la
          Resolución 1529 de 2026 ajustó validaciones del documento.
        </p>
        <div className="nx-actions">
          <button
            type="button"
            className="nx-btn nx-btn-primary"
            onClick={() => download(`PILA-${company.nit}-${period}.txt`, file.text, "text/plain")}
          >
            Descargar plano
          </button>
          <button
            type="button"
            className="nx-btn nx-btn-ghost"
            onClick={() => download(`PILA-${company.nit}-${period}.csv`, pilaCsv(state.employees, slips), "text/csv")}
          >
            Descargar liquidación
          </button>
        </div>
      </section>
      <section className="nx-card">
        <h2>{file.cotizantes} cotizantes</h2>
        <p>
          IBC {formatMoney(totals.ibc)} · pensión {formatMoney(totals.pension)} · salud {formatMoney(totals.health)} · ARL{" "}
          {formatMoney(totals.arl)} · caja {formatMoney(totals.ccf)} · SENA {formatMoney(totals.sena)} · ICBF{" "}
          {formatMoney(totals.icbf)} · FSP {formatMoney(totals.fsp)}
        </p>
        <div className="nx-slip">
          <table>
            <thead>
              <tr>
                <th scope="col">Cotizante</th>
                <th scope="col">Días</th>
                <th scope="col">IBC</th>
                <th scope="col">Pensión</th>
                <th scope="col">Salud</th>
                <th scope="col">ARL</th>
              </tr>
            </thead>
            <tbody>
              {payable.map((slip) => {
                const employee = state.employees.find((item) => item.id === slip.workerId);
                return (
                  <tr key={slip.workerId}>
                    <td>{employee ? employeeName(employee) : slip.workerId}</td>
                    <td>{slip.pila.days}</td>
                    <td>{formatMoney(slip.pila.ibc)}</td>
                    <td>{formatMoney(slip.pila.pensionPay)}</td>
                    <td>{formatMoney(slip.pila.healthPay)}</td>
                    <td>{formatMoney(slip.pila.arlPay)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
