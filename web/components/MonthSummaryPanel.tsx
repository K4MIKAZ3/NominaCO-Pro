"use client";

import { formatMoney, formatMonthFull } from "@/lib/format";
import { shiftYearMonth, compareYearMonths, parseYearMonth } from "@/lib/payroll/dates";
import type { ExpenseSummary } from "@/lib/expenses";
import type { MonthSummary } from "@/lib/payroll/models";

interface MonthSummaryPanelProps {
  profileName: string | null;
  selectedYearMonth: string;
  minYearMonth: string;
  maxYearMonth: string;
  summary: MonthSummary | null;
  expenseSummary: ExpenseSummary | null;
  loading: boolean;
  error: string | null;
  onSelectYearMonth: (yearMonth: string) => void;
  onOpenProfile: () => void;
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
  selectedYearMonth,
  minYearMonth,
  maxYearMonth,
  summary,
  expenseSummary,
  loading,
  error,
  onSelectYearMonth,
  onOpenProfile,
}: MonthSummaryPanelProps) {
  const { year, month } = summary
    ? { year: summary.year, month: summary.month }
    : expenseSummary
      ? { year: expenseSummary.year, month: expenseSummary.month }
      : parseYearMonth(selectedYearMonth);
  const monthLabel = formatMonthFull(year, month);
  const canGoPrev = compareYearMonths(selectedYearMonth, minYearMonth) > 0;
  const canGoNext = compareYearMonths(selectedYearMonth, maxYearMonth) < 0;
  const isCurrentMonth = selectedYearMonth === maxYearMonth;

  return (
    <>
      {profileName && (
        <div className="month-nav">
          <div className="month-nav-controls">
            <button
              type="button"
              className="month-nav-btn"
              aria-label="Mes anterior"
              disabled={!canGoPrev}
              onClick={() => onSelectYearMonth(shiftYearMonth(selectedYearMonth, -1))}
            >
              ‹
            </button>
            <span className="month-nav-label">{monthLabel}</span>
            <button
              type="button"
              className="month-nav-btn"
              aria-label="Mes siguiente"
              disabled={!canGoNext}
              onClick={() => onSelectYearMonth(shiftYearMonth(selectedYearMonth, 1))}
            >
              ›
            </button>
          </div>
          {!isCurrentMonth && (
            <button
              type="button"
              className="month-nav-today"
              onClick={() => onSelectYearMonth(maxYearMonth)}
            >
              Hoy
            </button>
          )}
        </div>
      )}

      {loading && <p className="dashboard-status">Cargando resumen…</p>}

      {error && <div className="form-message error">{error}</div>}

      {!loading && !error && !profileName && !summary && (
        <div className="dashboard-empty">
          <p>Configura tu perfil laboral para ver el resumen.</p>
          <button type="button" className="btn btn-primary" onClick={onOpenProfile}>
            Ir a perfil
          </button>
        </div>
      )}

      {!loading && !error && expenseSummary && (
        <article className="summary-card expense-card">
          <h2 className="summary-month">Gastos · {monthLabel}</h2>
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

      {!loading && !error && summary && (
        <article className="summary-card">
          <h2 className="summary-month">Nómina · {monthLabel}</h2>
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
      )}
    </>
  );
}
