"use client";

import { useMemo, useState } from "react";
import { ExpenseEntryDialog } from "@/components/ExpenseEntryDialog";
import { addExpenseEntry, deleteExpenseEntry } from "@/lib/dashboard-api";
import { EXPENSE_CATEGORY_LABELS, type ExpenseRow } from "@/lib/expenses";
import { formatMoney, formatMonthFull } from "@/lib/format";
import { compareYearMonths, parseYearMonth, shiftYearMonth, startOfMonth } from "@/lib/payroll/dates";
import { applyManualEntries, liquidateMonth } from "@/lib/payroll/payrollEngine";
import type { EmployeeProfile, ManualDeduction, WorkDayEntry } from "@/lib/payroll/models";
import type { LocalDate } from "@/lib/payroll/dates";

interface ExpensesPanelProps {
  userId: string;
  selectedYearMonth: string;
  minYearMonth: string;
  maxYearMonth: string;
  todayYearMonth: string;
  profile: EmployeeProfile | null;
  allWorkDays: WorkDayEntry[];
  manualHolidays: Set<LocalDate>;
  deductions: ManualDeduction[];
  expenseRows: ExpenseRow[];
  onSelectYearMonth: (ym: string) => void;
  onRefresh: () => void;
}

export function ExpensesPanel({
  userId,
  selectedYearMonth,
  minYearMonth,
  maxYearMonth,
  todayYearMonth,
  profile,
  allWorkDays,
  manualHolidays,
  deductions,
  expenseRows,
  onSelectYearMonth,
  onRefresh,
}: ExpensesPanelProps) {
  const { year, month } = parseYearMonth(selectedYearMonth);
  const monthLabel = formatMonthFull(year, month);
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const monthExpenses = useMemo(
    () => expenseRows.filter((e) => e.is_fixed || e.year_month === selectedYearMonth),
    [expenseRows, selectedYearMonth],
  );

  const netPayroll = useMemo(() => {
    if (!profile) return 0;
    const entries = allWorkDays.filter((e) => e.date.startsWith(selectedYearMonth));
    const monthDeductions = deductions.filter(
      (d) => d.yearMonth === selectedYearMonth && d.entryType !== "ADVANCE",
    );
    return applyManualEntries(
      liquidateMonth(profile, year, month, entries, manualHolidays),
      monthDeductions,
    ).netTotal;
  }, [profile, allWorkDays, manualHolidays, deductions, selectedYearMonth, year, month]);

  const totalExpenses = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const balance = netPayroll - totalExpenses;

  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of monthExpenses) {
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    }
    return Array.from(map.entries())
      .map(([category, total]) => ({
        category,
        label: EXPENSE_CATEGORY_LABELS[category] ?? category,
        total,
      }))
      .sort((a, b) => b.total - a.total);
  }, [monthExpenses]);

  const canGoPrev = compareYearMonths(selectedYearMonth, minYearMonth) > 0;
  const canGoNext = compareYearMonths(selectedYearMonth, maxYearMonth) < 0;
  const defaultDate = startOfMonth(year, month);

  async function handleSave(
    label: string,
    amount: number,
    category: string,
    dateIso: string,
    isFixed: boolean,
  ) {
    try {
      await addExpenseEntry(userId, {
        yearMonth: selectedYearMonth,
        dateIso: isFixed ? defaultDate : dateIso,
        label,
        amount,
        category,
        isFixed,
      });
      setShowDialog(false);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("¿Eliminar este gasto?")) return;
    try {
      await deleteExpenseEntry(userId, id);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar.");
    }
  }

  return (
    <section className="editor-section">
      <h2>Gastos</h2>
      <p className="editor-lead">{monthLabel}</p>

      <div className="month-nav month-nav--calendar">
        <div className="month-nav-controls">
          <button
            type="button"
            className="month-nav-btn"
            disabled={!canGoPrev}
            onClick={() => onSelectYearMonth(shiftYearMonth(selectedYearMonth, -1))}
          >
            ‹
          </button>
          <label className="month-nav-picker">
            <span className="sr-only">Ir a mes</span>
            <input
              type="month"
              className="month-nav-input"
              value={selectedYearMonth}
              min={minYearMonth}
              max={maxYearMonth}
              onChange={(e) => {
                if (e.target.value) onSelectYearMonth(e.target.value);
              }}
            />
            <span className="month-nav-label">{monthLabel}</span>
          </label>
          <button
            type="button"
            className="month-nav-btn"
            disabled={!canGoNext}
            onClick={() => onSelectYearMonth(shiftYearMonth(selectedYearMonth, 1))}
          >
            ›
          </button>
        </div>
        {selectedYearMonth !== todayYearMonth && (
          <button
            type="button"
            className="month-nav-today"
            onClick={() => onSelectYearMonth(todayYearMonth)}
          >
            Hoy
          </button>
        )}
      </div>

      {error && <div className="form-message error">{error}</div>}

      {!profile ? (
        <div className="dashboard-empty">
          <p>Configura tu perfil en Ajustes para comparar gastos con tu neto estimado.</p>
        </div>
      ) : (
        <>
          <div className="hero-card">
            <span className="hero-card-label">Balance del mes</span>
            <span className={`hero-card-amount${balance < 0 ? " hero-card-amount--danger" : ""}`}>
              {formatMoney(balance)}
            </span>
            <span className="hero-card-badge">
              {balance >= 0 ? "Neto − gastos" : "Gastos superan el neto"}
            </span>
          </div>
          <div className="stat-row">
            <div className="stat-card">
              <span className="stat-label">Neto estimado</span>
              <span className="stat-value stat-value--green">{formatMoney(netPayroll)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Gastos</span>
              <span className="stat-value summary-value--expense">{formatMoney(totalExpenses)}</span>
            </div>
          </div>
        </>
      )}

      {categoryTotals.length > 0 && (
        <div className="summary-card">
          <p className="summary-month">Por categoría</p>
          {categoryTotals.map((item) => (
            <div key={item.category} className="summary-row">
              <span className="summary-label">{item.label}</span>
              <span className="summary-value">{formatMoney(item.total)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="editor-section-header">
        <h3 className="summary-month">Listado</h3>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowDialog(true)}>
          + Agregar
        </button>
      </div>

      {monthExpenses.length === 0 ? (
        <div className="dashboard-empty">
          <p>No hay gastos en {monthLabel}.</p>
        </div>
      ) : (
        <ul className="workday-list">
          {monthExpenses.map((expense) => (
            <li key={expense.id} className="workday-item">
              <div>
                <strong>{expense.label}</strong>
                <span className="workday-meta">
                  {EXPENSE_CATEGORY_LABELS[expense.category] ?? expense.category}
                  {expense.is_fixed ? " · Fijo" : ` · ${expense.date_iso}`}
                </span>
              </div>
              <div className="workday-actions">
                <span className="summary-value">{formatMoney(expense.amount)}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm workday-delete"
                  onClick={() => handleDelete(expense.id)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showDialog && (
        <ExpenseEntryDialog
          defaultDate={defaultDate}
          onClose={() => setShowDialog(false)}
          onSave={handleSave}
        />
      )}
    </section>
  );
}
