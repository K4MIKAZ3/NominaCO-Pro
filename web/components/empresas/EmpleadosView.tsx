"use client";

import { useState } from "react";
import { SALARIO_INTEGRAL_MIN, SMMLV } from "@/lib/empresas/law";
import { formatMoney } from "@/lib/empresas/format";
import { useEmpresas } from "@/lib/empresas/store";
import { employeeName } from "@/lib/empresas/types";
import type { ContractType, Employee, NoveltyKind, SalaryMode } from "@/lib/empresas/types";

const BLANK: Employee = {
  id: "",
  docType: "CC",
  documentNumber: "",
  firstSurname: "",
  secondSurname: "",
  firstName: "",
  secondName: "",
  jobTitle: "",
  monthlySalary: SMMLV,
  dailyHours: 8,
  hireDate: "2026-01-01",
  contractType: "INDEFINIDO",
  salaryMode: "mensual",
  riskClass: 1,
  epsCode: "EPS037",
  afpCode: "230301",
  ccfCode: "CCF24",
  active: true,
};

const NOVELTY_LABEL: Record<NoveltyKind, string> = {
  AUS: "Ausencia",
  SLN: "Licencia no remunerada",
  VAC: "Vacaciones",
  IGE: "Incapacidad común",
  IRL: "Accidente o enfermedad laboral",
  LMA: "Licencia de maternidad o paternidad",
};

export function EmpleadosView() {
  const { state, saveEmployee, addNovelty, removeNovelty } = useEmpresas();
  const [form, setForm] = useState<Employee>(BLANK);
  const [message, setMessage] = useState("");
  const [novelty, setNovelty] = useState({ workerId: "", kind: "VAC" as NoveltyKind, start: "", end: "", note: "" });

  function edit(employee: Employee) {
    setForm(employee);
    setMessage("");
  }

  return (
    <div className="nx-stack">
      <section className="nx-card">
        <h2>Trabajadores</h2>
        <p className="nx-muted">
          Mínimo 2026 {formatMoney(SMMLV)}. Salario integral desde {formatMoney(SALARIO_INTEGRAL_MIN)}. Los códigos de EPS,
          AFP y caja son los de 6 caracteres que pide la PILA.
        </p>
        {state.employees.length === 0 ? <p>Todavía no hay trabajadores.</p> : null}
        <ul className="nx-people">
          {state.employees.map((employee) => (
            <li key={employee.id}>
              <button type="button" className="nx-slip-head" onClick={() => edit(employee)}>
                <span>
                  <strong>{employeeName(employee)}</strong>
                  <small>
                    {employee.docType} {employee.documentNumber} · {employee.jobTitle} · {formatMoney(employee.monthlySalary)} · riesgo {employee.riskClass}
                    {employee.active ? "" : " · inactivo"}
                  </small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <form
        className="nx-card nx-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!form.firstName.trim() || !form.firstSurname.trim() || form.documentNumber.length < 5) {
            setMessage("Faltan nombre, primer apellido y documento.");
            return;
          }
          saveEmployee({
            ...form,
            id: form.id || `e-${form.documentNumber}`,
            firstName: form.firstName.trim(),
            firstSurname: form.firstSurname.trim(),
            documentNumber: form.documentNumber.replace(/\D/g, ""),
          });
          setForm(BLANK);
          setMessage("Trabajador guardado. Ya se puede programar.");
        }}
      >
        <h2>{form.id ? "Editar trabajador" : "Nuevo trabajador"}</h2>
        <div className="nx-fields">
          <label>
            Primer nombre
            <input value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} required />
          </label>
          <label>
            Segundo nombre
            <input value={form.secondName} onChange={(event) => setForm({ ...form, secondName: event.target.value })} />
          </label>
          <label>
            Primer apellido
            <input value={form.firstSurname} onChange={(event) => setForm({ ...form, firstSurname: event.target.value })} required />
          </label>
          <label>
            Segundo apellido
            <input value={form.secondSurname} onChange={(event) => setForm({ ...form, secondSurname: event.target.value })} />
          </label>
          <label>
            Documento
            <input value={form.documentNumber} onChange={(event) => setForm({ ...form, documentNumber: event.target.value.replace(/\D/g, "") })} required />
          </label>
          <label>
            Tipo
            <select value={form.docType} onChange={(event) => setForm({ ...form, docType: event.target.value as Employee["docType"] })}>
              <option>CC</option>
              <option>CE</option>
              <option>TI</option>
              <option>PA</option>
              <option>PE</option>
            </select>
          </label>
          <label>
            Cargo
            <input value={form.jobTitle} onChange={(event) => setForm({ ...form, jobTitle: event.target.value })} />
          </label>
          <label>
            Salario mensual
            <input type="number" min={1} value={form.monthlySalary} onChange={(event) => setForm({ ...form, monthlySalary: Number(event.target.value) })} />
          </label>
          <label>
            Jornada diaria
            <input type="number" min={1} max={10} value={form.dailyHours} onChange={(event) => setForm({ ...form, dailyHours: Number(event.target.value) })} />
          </label>
          <label>
            Ingreso
            <input type="date" value={form.hireDate} onChange={(event) => setForm({ ...form, hireDate: event.target.value })} />
          </label>
          <label>
            Contrato
            <select value={form.contractType} onChange={(event) => setForm({ ...form, contractType: event.target.value as ContractType })}>
              <option value="INDEFINIDO">Indefinido</option>
              <option value="FIJO">Término fijo</option>
              <option value="OBRA">Obra o labor</option>
              <option value="APRENDIZAJE">Aprendizaje</option>
            </select>
          </label>
          <label>
            Modalidad
            <select value={form.salaryMode} onChange={(event) => setForm({ ...form, salaryMode: event.target.value as SalaryMode })}>
              <option value="mensual">Mensual</option>
              <option value="integral">Integral</option>
            </select>
          </label>
          <label>
            Clase de riesgo ARL
            <select value={form.riskClass} onChange={(event) => setForm({ ...form, riskClass: Number(event.target.value) as Employee["riskClass"] })}>
              <option value={1}>I · 0,522 %</option>
              <option value={2}>II · 1,044 %</option>
              <option value={3}>III · 2,436 %</option>
              <option value={4}>IV · 4,350 %</option>
              <option value={5}>V · 6,960 %</option>
            </select>
          </label>
          <label>
            Código EPS
            <input value={form.epsCode} maxLength={6} onChange={(event) => setForm({ ...form, epsCode: event.target.value })} />
          </label>
          <label>
            Código AFP
            <input value={form.afpCode} maxLength={6} onChange={(event) => setForm({ ...form, afpCode: event.target.value })} />
          </label>
          <label>
            Código caja
            <input value={form.ccfCode} maxLength={6} onChange={(event) => setForm({ ...form, ccfCode: event.target.value })} />
          </label>
          <label className="nx-check">
            <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
            Activo para programar y cotizar
          </label>
        </div>
        <div className="nx-actions">
          <button type="submit" className="nx-btn nx-btn-primary">
            Guardar trabajador
          </button>
          {form.id ? (
            <button type="button" className="nx-btn nx-btn-ghost" onClick={() => setForm(BLANK)}>
              Nuevo
            </button>
          ) : null}
        </div>
        {message ? <p className="nx-note">{message}</p> : null}
      </form>
      <form
        className="nx-card nx-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!novelty.workerId || !novelty.start || !novelty.end) return;
          addNovelty({ id: `nov-${Date.now()}`, ...novelty });
          setNovelty({ ...novelty, start: "", end: "", note: "" });
        }}
      >
        <h2>Novedades del mes</h2>
        <p className="nx-muted">
          Una ausencia o licencia no remunerada no se paga. Vacaciones se pagan sin auxilio de transporte. La incapacidad
          y la licencia de maternidad no duplican el salario: las paga la EPS o la ARL y quedan marcadas para la PILA.
        </p>
        <div className="nx-fields">
          <label>
            Trabajador
            <select value={novelty.workerId} onChange={(event) => setNovelty({ ...novelty, workerId: event.target.value })}>
              <option value="">Elegir</option>
              {state.employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employeeName(employee)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tipo
            <select value={novelty.kind} onChange={(event) => setNovelty({ ...novelty, kind: event.target.value as NoveltyKind })}>
              {(Object.keys(NOVELTY_LABEL) as NoveltyKind[]).map((kind) => (
                <option key={kind} value={kind}>
                  {NOVELTY_LABEL[kind]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Desde
            <input type="date" value={novelty.start} onChange={(event) => setNovelty({ ...novelty, start: event.target.value })} />
          </label>
          <label>
            Hasta
            <input type="date" value={novelty.end} onChange={(event) => setNovelty({ ...novelty, end: event.target.value })} />
          </label>
        </div>
        <button type="submit" className="nx-btn nx-btn-primary">
          Registrar novedad
        </button>
        <ul className="nx-people">
          {state.novedades.map((item) => {
            const employee = state.employees.find((worker) => worker.id === item.workerId);
            return (
              <li key={item.id}>
                <strong>{employee ? employeeName(employee) : item.workerId}</strong>
                <small>
                  {NOVELTY_LABEL[item.kind]} · {item.start} a {item.end}
                </small>
                <button type="button" className="nx-btn nx-btn-ghost" onClick={() => removeNovelty(item.id)}>
                  Quitar
                </button>
              </li>
            );
          })}
        </ul>
      </form>
    </div>
  );
}
