"use client";

import { useEffect, useMemo, useState } from "react";
import { PayrollEntryDialog } from "@/components/PayrollEntryDialog";
import {
  addManualDeduction,
  deleteManualDeduction,
  saveProfileRecord,
  type ManualDeductionRecord,
} from "@/lib/dashboard-api";
import { exportPayrollPdf, exportWorkDaysPdf } from "@/lib/export/pdfExporter";
import { formatMoney, formatMonthFull, formatTime } from "@/lib/format";
import { isAfter, isBefore, parseYearMonth, shiftYearMonth, compareYearMonths } from "@/lib/payroll/dates";
import {
  defaultPeriodIndex,
  periodsInMonth,
  shouldShowSubPeriods,
} from "@/lib/payroll/payPeriodCalculator";
import {
  applyManualEntries,
  buildPeriodSummary,
  liquidateDateRange,
  liquidateMonth,
} from "@/lib/payroll/payrollEngine";
import { calculateSettlement } from "@/lib/payroll/settlementCalculator";
import type {
  AppPreferences,
  EmployeeProfile,
  ManualDeduction,
  PayrollEntryType,
  WorkDayEntry,
} from "@/lib/payroll/models";
import type { LocalDate } from "@/lib/payroll/dates";

interface PayrollPanelProps {
  userId: string;
  selectedYearMonth: string;
  minYearMonth: string;
  maxYearMonth: string;
  todayYearMonth: string;
  profile: EmployeeProfile | null;
  allWorkDays: WorkDayEntry[];
  manualHolidays: Set<LocalDate>;
  deductions: ManualDeductionRecord[];
  preferences: AppPreferences;
  onSelectYearMonth: (ym: string) => void;
  onRefresh: () => void;
}

function inRange(date: LocalDate, start: LocalDate, end: LocalDate): boolean {
  return !isBefore(date, start) && !isAfter(date, end);
}

export function PayrollPanel({
  userId,
  selectedYearMonth,
  minYearMonth,
  maxYearMonth,
  todayYearMonth,
  profile,
  allWorkDays,
  manualHolidays,
  deductions,
  preferences,
  onSelectYearMonth,
  onRefresh,
}: PayrollPanelProps) {
  const { year, month } = parseYearMonth(selectedYearMonth);
  const monthLabel = formatMonthFull(year, month);
  const [periodIndex, setPeriodIndex] = useState(() =>
    profile ? defaultPeriodIndex(profile.payPeriodType, selectedYearMonth) : 0,
  );
  const [entryDialog, setEntryDialog] = useState<PayrollEntryType | null>(null);
  const [expanded, setExpanded] = useState({ earnings: true, deductions: true, settlement: false });
  const [vacationInput, setVacationInput] = useState("");
  const [savingVacation, setSavingVacation] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setPeriodIndex(defaultPeriodIndex(profile.payPeriodType, selectedYearMonth));
    }
  }, [profile, selectedYearMonth]);

  const payPeriods = profile ? periodsInMonth(profile.payPeriodType, selectedYearMonth) : [];
  const showSubPeriods = profile ? shouldShowSubPeriods(profile.payPeriodType, payPeriods) : false;
  const selectedPeriod = payPeriods[periodIndex] ?? null;

  const monthEntries = useMemo(
    () => allWorkDays.filter((e) => e.date.startsWith(selectedYearMonth)),
    [allWorkDays, selectedYearMonth],
  );

  const monthDeductions = useMemo(
    () => deductions.filter((d) => d.yearMonth === selectedYearMonth),
    [deductions, selectedYearMonth],
  );

  const payroll = useMemo(() => {
    if (!profile) return null;
    if (showSubPeriods && selectedPeriod) {
      const periodEntries = allWorkDays.filter((e) =>
        inRange(e.date, selectedPeriod.start, selectedPeriod.end),
      );
      const periodManual = deductions.filter((d) =>
        inRange(d.effectiveDate, selectedPeriod.start, selectedPeriod.end),
      );
      const base = liquidateDateRange(
        profile,
        selectedPeriod.start,
        selectedPeriod.end,
        periodEntries,
        manualHolidays,
        year,
        month,
      );
      return applyManualEntries(
        base,
        periodManual.filter((d) => d.entryType !== "ADVANCE"),
      );
    }
    return applyManualEntries(
      liquidateMonth(profile, year, month, monthEntries, manualHolidays),
      monthDeductions.filter((d) => d.entryType !== "ADVANCE"),
    );
  }, [
    profile,
    showSubPeriods,
    selectedPeriod,
    allWorkDays,
    manualHolidays,
    year,
    month,
    monthEntries,
    monthDeductions,
    deductions,
    selectedYearMonth,
  ]);

  const periodSummary = useMemo(() => {
    if (!profile || !payroll || !showSubPeriods || !selectedPeriod) return null;
    const periodManual = deductions.filter((d) =>
      inRange(d.effectiveDate, selectedPeriod.start, selectedPeriod.end),
    );
    return buildPeriodSummary(
      payroll,
      selectedPeriod.label,
      selectedPeriod.start,
      selectedPeriod.end,
      periodManual,
    );
  }, [profile, payroll, showSubPeriods, selectedPeriod, deductions]);

  const periodManualEntries = useMemo(() => {
    if (!showSubPeriods || !selectedPeriod) return monthDeductions;
    return deductions.filter((d) =>
      inRange(d.effectiveDate, selectedPeriod.start, selectedPeriod.end),
    );
  }, [showSubPeriods, selectedPeriod, monthDeductions, deductions]);

  const advances = periodManualEntries.filter((d) => d.entryType === "ADVANCE");
  const bonuses = periodManualEntries.filter((d) => d.entryType === "BONUS");
  const manualDeductionList = (showSubPeriods ? periodManualEntries : monthDeductions).filter(
    (d) => d.entryType === "DEDUCTION",
  );

  const yearSettlement = useMemo(() => {
    if (!profile) return null;
    return calculateSettlement(
      profile,
      year,
      allWorkDays,
      manualHolidays,
      profile.pendingVacationDays,
    );
  }, [profile, year, allWorkDays, manualHolidays]);

  const totalLegal = payroll?.legalDeductions.reduce((s, d) => s + d.amount, 0) ?? 0;
  const totalManual = manualDeductionList.reduce((s, d) => s + d.amount, 0);
  const totalDeductions = totalLegal + totalManual;

  const canGoPrev = compareYearMonths(selectedYearMonth, minYearMonth) > 0;
  const canGoNext = compareYearMonths(selectedYearMonth, maxYearMonth) < 0;

  async function handleAddEntry(label: string, amount: number) {
    if (!entryDialog || !profile) return;
    const effectiveDate = selectedPeriod?.start ?? `${selectedYearMonth}-01`;
    try {
      await addManualDeduction(userId, {
        yearMonth: selectedYearMonth,
        effectiveDate,
        label,
        amount,
        entryType: entryDialog,
      });
      setEntryDialog(null);
      setMessage("Registro guardado.");
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    }
  }

  async function handleRemoveEntry(id: string) {
    try {
      await deleteManualDeduction(userId, id);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar.");
    }
  }

  async function handleVacationSave() {
    if (!profile) return;
    const days = Number.parseInt(vacationInput, 10) || 0;
    setSavingVacation(true);
    try {
      await saveProfileRecord(userId, {
        name: profile.name,
        documentId: profile.documentId,
        jobTitle: profile.jobTitle,
        monthlySalary: profile.monthlySalary,
        dailyHours: profile.dailyHours,
        contractType: profile.contractType,
        payPeriodType: profile.payPeriodType,
        pendingVacationDays: days,
      });
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSavingVacation(false);
    }
  }

  if (!profile) {
    return (
      <div className="dashboard-empty">
        <p>Configura tu perfil en Ajustes para ver la liquidación.</p>
      </div>
    );
  }

  if (!payroll) {
    return <p className="dashboard-status">Sin datos de nómina para este mes.</p>;
  }

  const periodWorkDays = showSubPeriods && selectedPeriod
    ? allWorkDays.filter((e) => inRange(e.date, selectedPeriod.start, selectedPeriod.end))
    : monthEntries;

  return (
    <section className="editor-section">
      <h2>Nómina</h2>
      <p className="editor-lead">Liquidación {monthLabel}</p>

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

      {showSubPeriods && payPeriods.length > 0 && (
        <div className="period-chips">
          {payPeriods.map((period) => (
            <button
              key={period.indexInMonth}
              type="button"
              className={`period-chip${period.indexInMonth === periodIndex ? " is-active" : ""}`}
              onClick={() => setPeriodIndex(period.indexInMonth)}
            >
              {period.label}
            </button>
          ))}
        </div>
      )}

      {periodSummary && (
        <div className="summary-card">
          <p className="summary-month">Resumen del subperíodo</p>
          <div className="summary-row">
            <span className="summary-label">Pendiente</span>
            <span className="summary-value">{formatMoney(periodSummary.pendingBalance)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Avances</span>
            <span className="summary-value">{formatMoney(periodSummary.advances)}</span>
          </div>
        </div>
      )}

      <div className="hero-card">
        <span className="hero-card-label">Total a pagar</span>
        <span className="hero-card-amount">{formatMoney(payroll.netTotal)}</span>
        <span className="hero-card-badge">Liquidación calculada</span>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <span className="stat-label">Total devengado</span>
          <span className="stat-value stat-value--green">{formatMoney(payroll.grossTotal)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total deducciones</span>
          <span className="stat-value">{formatMoney(totalDeductions)}</span>
        </div>
      </div>

      {error && <div className="form-message error">{error}</div>}
      {message && <div className="form-message success">{message}</div>}

      <div className="collapsible-section">
        <button
          type="button"
          className="collapsible-header"
          onClick={() => setExpanded((e) => ({ ...e, earnings: !e.earnings }))}
        >
          <span>Devengados · {formatMoney(payroll.grossTotal)}</span>
          <span>{expanded.earnings ? "−" : "+"}</span>
        </button>
        {expanded.earnings && (
          <div className="collapsible-body">
            <p className="editor-hint">
              {payroll.workedDays} días laborados
              {payroll.remuneratedRestDays > 0 && ` + ${payroll.remuneratedRestDays} descanso remunerado`}
            </p>
            {payroll.earnings.filter((l) => l.code !== "BON").map((line) => (
              <div key={line.code ?? line.label} className="summary-row">
                <span className="summary-label">{line.label}</span>
                <span className="summary-value">{formatMoney(line.amount)}</span>
              </div>
            ))}
            {bonuses.map((b) => (
              <div key={b.id} className="summary-row">
                <span className="summary-label">{b.label}</span>
                <span className="summary-value">{formatMoney(b.amount)}</span>
              </div>
            ))}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEntryDialog("BONUS")}>
              + Agregar bono
            </button>
          </div>
        )}
      </div>

      <div className="collapsible-section">
        <button
          type="button"
          className="collapsible-header"
          onClick={() => setExpanded((e) => ({ ...e, deductions: !e.deductions }))}
        >
          <span>Descuentos · {formatMoney(totalDeductions)}</span>
          <span>{expanded.deductions ? "−" : "+"}</span>
        </button>
        {expanded.deductions && (
          <div className="collapsible-body">
            {payroll.legalDeductions.map((line) => (
              <div key={line.code} className="summary-row">
                <span className="summary-label">{line.label}</span>
                <span className="summary-value summary-value--deduction">-{formatMoney(line.amount)}</span>
              </div>
            ))}
            {manualDeductionList.map((d) => (
              <div key={d.id} className="workday-item">
                <div>
                  <strong>{d.label}</strong>
                  <span className="workday-meta">-{formatMoney(d.amount)}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm workday-delete"
                  onClick={() => handleRemoveEntry(d.id)}
                >
                  Eliminar
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEntryDialog("DEDUCTION")}>
              + Agregar egreso
            </button>
          </div>
        )}
      </div>

      <div className="summary-card">
        <p className="summary-month">Neto a pagar</p>
        <p className="hero-card-amount">{formatMoney(payroll.netTotal)}</p>
        <p className="editor-hint">Cálculo personal · no constituye nómina oficial</p>
      </div>

      <div className="btn-row">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => exportPayrollPdf(profile, payroll, preferences.use24HourFormat)}
        >
          PDF nómina
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() =>
            exportWorkDaysPdf(profile, payroll, periodWorkDays, preferences.use24HourFormat)
          }
        >
          PDF días
        </button>
      </div>

      <div className="collapsible-section">
        <div className="collapsible-header-static">
          <span>Avances</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEntryDialog("ADVANCE")}>
            +
          </button>
        </div>
        {advances.length === 0 ? (
          <p className="editor-hint">Sin avances registrados.</p>
        ) : (
          advances.map((a) => (
            <div key={a.id} className="workday-item">
              <div>
                <strong>{a.label}</strong>
                <span className="workday-meta">{formatMoney(a.amount)}</span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm workday-delete"
                onClick={() => handleRemoveEntry(a.id)}
              >
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>

      {yearSettlement && (
        <div className="collapsible-section">
          <button
            type="button"
            className="collapsible-header"
            onClick={() => setExpanded((e) => ({ ...e, settlement: !e.settlement }))}
          >
            <span>Prestaciones {year}</span>
            <span>{expanded.settlement ? "−" : "+"}</span>
          </button>
          {expanded.settlement && (
            <div className="collapsible-body">
              <div className="summary-row">
                <span className="summary-label">{yearSettlement.firstSemester.label}</span>
                <span className="summary-value">{formatMoney(yearSettlement.firstSemester.primaAmount)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">{yearSettlement.secondSemester.label}</span>
                <span className="summary-value">{formatMoney(yearSettlement.secondSemester.primaAmount)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Cesantías anuales</span>
                <span className="summary-value">{formatMoney(yearSettlement.annualCesantias)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Intereses cesantías</span>
                <span className="summary-value">{formatMoney(yearSettlement.annualInteresesCesantias)}</span>
              </div>
              <div className="form-group">
                <label htmlFor="vacation-days">Vacaciones pendientes (días)</label>
                <input
                  id="vacation-days"
                  type="number"
                  min={0}
                  value={vacationInput || (profile.pendingVacationDays || "")}
                  onChange={(e) => setVacationInput(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={savingVacation}
                onClick={handleVacationSave}
              >
                {savingVacation ? "Guardando…" : "Actualizar vacaciones"}
              </button>
              <div className="summary-row">
                <span className="summary-label">Liquidación estimada</span>
                <span className="summary-value summary-value--net">
                  {formatMoney(yearSettlement.liquidation.total)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {periodWorkDays.length > 0 && (
        <div className="summary-card">
          <p className="summary-month">
            {showSubPeriods ? "Días del subperíodo" : "Días del mes"} ({periodWorkDays.length})
          </p>
          <ul className="workday-list">
            {periodWorkDays.map((entry) => (
              <li key={entry.date} className="workday-item">
                <div>
                  <strong>{entry.date}</strong>
                  <span className="workday-meta">
                    {formatTime(entry.start, preferences.use24HourFormat)} –{" "}
                    {formatTime(entry.end, preferences.use24HourFormat)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {entryDialog && (
        <PayrollEntryDialog
          entryType={entryDialog}
          onClose={() => setEntryDialog(null)}
          onSave={handleAddEntry}
        />
      )}
    </section>
  );
}
