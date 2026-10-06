"use client";

import { useState } from "react";
import { EXPENSE_CATEGORY_OPTIONS } from "@/lib/expenses";

interface ExpenseEntryDialogProps {
  defaultDate: string;
  onClose: () => void;
  onSave: (label: string, amount: number, category: string, dateIso: string, isFixed: boolean) => void;
}

export function ExpenseEntryDialog({ defaultDate, onClose, onSave }: ExpenseEntryDialogProps) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [dateIso, setDateIso] = useState(defaultDate);
  const [category, setCategory] = useState("OTHER");
  const [isFixed, setIsFixed] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const value = Number.parseInt(amount, 10);
    if (label.trim() && value > 0) {
      onSave(label.trim(), value, category, dateIso, isFixed);
    }
  }

  return (
    <div className="editor-dialog-backdrop" onClick={onClose}>
      <form
        className="editor-dialog editor-dialog--touch"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Registrar gasto</h3>
        <p className="editor-hint">Gasto personal del mes. No afecta los descuentos de nómina.</p>
        <div className="form-group form-grid-full">
          <label htmlFor="expense-label">Concepto</label>
          <input
            id="expense-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
          />
        </div>
        <div className="form-group form-grid-full">
          <label htmlFor="expense-amount">Valor (COP)</label>
          <input
            id="expense-amount"
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            required
          />
        </div>
        {!isFixed && (
          <div className="form-group form-grid-full">
            <label htmlFor="expense-date">Fecha</label>
            <input
              id="expense-date"
              type="date"
              value={dateIso}
              onChange={(e) => setDateIso(e.target.value)}
              required
            />
          </div>
        )}
        <div className="form-group form-grid-full">
          <label htmlFor="expense-category">Categoría</label>
          <select
            id="expense-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {EXPENSE_CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={isFixed}
            onChange={(e) => setIsFixed(e.target.checked)}
          />
          <span>Gasto fijo cada mes (ej. arriendo)</span>
        </label>
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
