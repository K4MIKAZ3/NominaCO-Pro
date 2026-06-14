"use client";

import { formatMoney, formatMonthFull } from "@/lib/format";
import type { ExpenseSummary } from "@/lib/expenses";
import type { MonthSummary } from "@/lib/payroll/models";

interface MonthSummaryPanelProps {
  profileName: string | null;
  summaries: MonthSummary[];
  expenseSummary: ExpenseSummary | null;
  loading: boolean;
  error: string | null;
  onSignOut: () => void;
  signingOut: boolean;
}

function SummaryRow({ label, value, variant }: { label: string; value: string; variant?: "net" | "deduction" | "expense" }) {
  return (
    <div className="summary-row">
      <span className="summary-label">{label}</span>
      <span className={`summary-value${variant ? ` summary-value--${variant}` : ""}`}>{value}</span>
    </div>
  );
}

export function MonthSummaryPanel({
  profileName,
  summaries,
  expenseSummary,
  loading,
  error,
  onSignOut,
  signingOut,
}: MonthSummaryPanelProps) {
  return (
    <div className="dashboard-panel">
      <div className="dashboard-header">
        <div>
          <h1>Hola{profileName ? `, ${profileName}` : ""}</h1>
          <p className="subtitle">Resumen de nómina y gastos sincronizados desde la app</p>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onSignOut}
          disabled={signingOut}
        >
          {signingOut ? "Cerrando…" : "Cerrar sesión"}
        </button>
      </div>

      {loading && <p className="dashboard-status">Cargando resumen…</p>}

      {error && <div className="form-message error">{error}</div>}

      {!loading && !error && !profileName && summaries.length === 0 && (
        <div className="dashboard-empty">
          <p>Configura tu perfil en la app para ver el resumen</p>
        </div>
      )}

      {!loading && !error && expenseSummary && (
        <article className="summary-card expense-card">
          <h2 className="summary-month">
            Gastos · {formatMonthFull(expenseSummary.year, expenseSummary.month)}
          </h2>
          <SummaryRow label="Neto estimado" value={formatMoney(expenseSummary.netTotal)} variant="net" />
          <SummaryRow label="Gastos del mes" value={formatMoney(expenseSummary.totalExpenses)} variant="expense" />
          <SummaryRow
            label="Balance"
            value={formatMoney(expenseSummary.balance)}
            variant={expenseSummary.balance >= 0 ? "net" : "expense"}
          />
          {expenseSummary.items.length > 0 && (
            <ul className="expense-list">
              {expenseSummary.items.map((item) => (
                <li key={`${item.label}-${item.amount}-${item.isFixed}`}>
                  <span>
                    {item.label}
                    {item.isFixed ? " · Fijo" : ""}
                  </span>
                  <span>{formatMoney(item.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      )}

      {!loading && !error && summaries.length > 0 && (
        <div className="summary-grid">
          {summaries.map((summary) => (
            <article key={`${summary.year}-${summary.month}`} className="summary-card">
              <h2 className="summary-month">{formatMonthFull(summary.year, summary.month)}</h2>
              <SummaryRow label="Bruto" value={formatMoney(summary.grossTotal)} />
              <SummaryRow
                label="Descuentos legales"
                value={formatMoney(summary.legalDeductions)}
                variant="deduction"
              />
              <SummaryRow
                label="Egresos manuales"
                value={formatMoney(summary.manualDeductions)}
                variant="deduction"
              />
              <SummaryRow label="Neto" value={formatMoney(summary.netTotal)} variant="net" />
            </article>
          ))}
        </div>
      )}

      <p className="auth-note">
        Los datos se sincronizan desde la app Android con la misma cuenta. Edita gastos y días en la app.
      </p>
    </div>
  );
}
