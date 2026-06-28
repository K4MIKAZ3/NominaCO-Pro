"use client";

import { useState } from "react";
import type { PayrollEntryType } from "@/lib/payroll/models";

interface PayrollEntryDialogProps {
  entryType: PayrollEntryType;
  onClose: () => void;
  onSave: (label: string, amount: number) => void;
}

const TITLES: Record<PayrollEntryType, string> = {
  ADVANCE: "Registrar avance recibido",
  DEDUCTION: "Agregar egreso / préstamo",
  BONUS: "Agregar bono",
};

const HINTS: Record<PayrollEntryType, string> = {
  ADVANCE: "Dinero que ya te pagó el patrón en este período.",
  DEDUCTION: "Descuento manual del neto (préstamo, libranza, etc.)",
  BONUS: "Ingreso adicional (bonificación, incentivo, etc.).",
};

export function PayrollEntryDialog({ entryType, onClose, onSave }: PayrollEntryDialogProps) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const value = Number.parseInt(amount, 10);
    if (label.trim() && value > 0) {
      onSave(label.trim(), value);
    }
  }

  return (
    <div className="editor-dialog-backdrop" onClick={onClose}>
      <form
        className="editor-dialog editor-dialog--touch"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{TITLES[entryType]}</h3>
        <p className="editor-hint">{HINTS[entryType]}</p>
        <div className="form-group form-grid-full">
          <label htmlFor="entry-label">Concepto</label>
          <input
            id="entry-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
          />
        </div>
        <div className="form-group form-grid-full">
          <label htmlFor="entry-amount">Valor (COP)</label>
          <input
            id="entry-amount"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            required
          />
        </div>
        <div className="form-actions editor-dialog-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
