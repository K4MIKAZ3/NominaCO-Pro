"use client";

import { useState } from "react";
import { nitDv } from "@/lib/empresas/law";
import { useEmpresas } from "@/lib/empresas/store";
import type { Company } from "@/lib/empresas/types";

const EMPTY: Company = {
  name: "",
  nit: "",
  dv: "",
  city: "",
  departmentCode: "11",
  cityCode: "001",
  address: "",
  phone: "",
  email: "",
  ciiu: "",
  arlCode: "14-23",
  exonerated: true,
  personType: "J",
};

export function EmpresaView() {
  const { state, saveCompany, loadExample, startBlank } = useEmpresas();
  const [form, setForm] = useState<Company>(state.company ?? EMPTY);
  const [saved, setSaved] = useState("");

  function set<K extends keyof Company>(key: K, value: Company[K]) {
    setSaved("");
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "nit") next.dv = nitDv(String(value));
      return next;
    });
  }

  return (
    <div className="nx-stack">
      <section className="nx-hero">
        <p className="nx-kicker">Cualquier empresa · datos en este equipo</p>
        <h1>{state.company ? state.company.name : "Crea la empresa"}</h1>
        <p className="nx-lead">
          La nómina, los aportes y la PILA salen de la ficha de esta empresa y de sus trabajadores. Nada se envía a un
          servidor: queda guardado en este navegador.
        </p>
        <div className="nx-actions">
          <button type="button" className="nx-btn nx-btn-ghost" onClick={loadExample}>
            Cargar ejemplo La Aurora
          </button>
          {state.company ? (
            <button type="button" className="nx-btn nx-btn-ghost" onClick={startBlank}>
              Empezar empresa nueva
            </button>
          ) : null}
        </div>
      </section>
      <form
        className="nx-card nx-form"
        onSubmit={(event) => {
          event.preventDefault();
          const nit = form.nit.replace(/\D/g, "");
          if (nit.length < 6 || !form.name.trim()) {
            setSaved("Faltan la razón social y un NIT de al menos 6 dígitos.");
            return;
          }
          saveCompany({ ...form, nit, dv: nitDv(nit), name: form.name.trim() });
          setSaved("Empresa guardada.");
        }}
      >
        <h2>Ficha del aportante</h2>
        <div className="nx-fields">
          <label>
            Razón social
            <input value={form.name} onChange={(event) => set("name", event.target.value)} required />
          </label>
          <label>
            NIT
            <input value={form.nit} inputMode="numeric" onChange={(event) => set("nit", event.target.value.replace(/\D/g, ""))} required />
          </label>
          <label>
            Dígito de verificación
            <input value={form.dv} readOnly />
          </label>
          <label>
            Tipo de persona
            <select value={form.personType} onChange={(event) => set("personType", event.target.value as Company["personType"])}>
              <option value="J">Jurídica</option>
              <option value="N">Natural</option>
            </select>
          </label>
          <label>
            Ciudad
            <input value={form.city} onChange={(event) => set("city", event.target.value)} />
          </label>
          <label>
            Departamento DANE
            <input value={form.departmentCode} maxLength={2} onChange={(event) => set("departmentCode", event.target.value)} />
          </label>
          <label>
            Municipio DANE
            <input value={form.cityCode} maxLength={3} onChange={(event) => set("cityCode", event.target.value)} />
          </label>
          <label>
            Dirección
            <input value={form.address} onChange={(event) => set("address", event.target.value)} />
          </label>
          <label>
            Teléfono
            <input value={form.phone} onChange={(event) => set("phone", event.target.value)} />
          </label>
          <label>
            Correo
            <input type="email" value={form.email} onChange={(event) => set("email", event.target.value)} />
          </label>
          <label>
            CIIU
            <input value={form.ciiu} maxLength={4} onChange={(event) => set("ciiu", event.target.value)} />
          </label>
          <label>
            Código ARL
            <input value={form.arlCode} maxLength={6} onChange={(event) => set("arlCode", event.target.value)} />
          </label>
          <label className="nx-check">
            <input type="checkbox" checked={form.exonerated} onChange={(event) => set("exonerated", event.target.checked)} />
            Exonerada de salud patronal, SENA e ICBF (art. 114-1 ET) para quien gana menos de 10 SMMLV
          </label>
        </div>
        <button type="submit" className="nx-btn nx-btn-primary">
          Guardar empresa
        </button>
        {saved ? <p className="nx-note">{saved}</p> : null}
      </form>
    </div>
  );
}
