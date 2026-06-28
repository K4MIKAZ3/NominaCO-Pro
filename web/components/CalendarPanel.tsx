"use client";

import { useEffect, useMemo, useState } from "react";
import { DayEditorModal } from "@/components/DayEditorModal";
import { fetchWorkDaysForMonth } from "@/lib/dashboard-api";
import { formatMoney, formatMonthFull } from "@/lib/format";
import {
  buildCalendarDays,
  buildCalendarMarks,
  countNonWorkedWeekdays,
  countWorkedDays,
} from "@/lib/payroll/calendarMarks";
import { compareYearMonths, parseYearMonth, shiftYearMonth } from "@/lib/payroll/dates";
import { liquidateMonth, applyManualEntries } from "@/lib/payroll/payrollEngine";
import type { AppPreferences, EmployeeProfile, ManualDeduction, WorkDayEntry } from "@/lib/payroll/models";
import type { LocalDate } from "@/lib/payroll/dates";

interface CalendarPanelProps {
  userId: string;
  selectedYearMonth: string;
  minYearMonth: string;
  maxYearMonth: string;
  profile: EmployeeProfile | null;
  manualHolidays: Set<LocalDate>;
  allWorkDays: WorkDayEntry[];
  monthDeductions: ManualDeduction[];
  preferences: AppPreferences;
  onSelectYearMonth: (ym: string) => void;
  onRefresh: () => void;
}

const WEEKDAYS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

export function CalendarPanel({
  userId,
  selectedYearMonth,
  minYearMonth,
  maxYearMonth,
  profile,
  manualHolidays,
  allWorkDays,
  monthDeductions,
  preferences,
  onSelectYearMonth,
  onRefresh,
}: CalendarPanelProps) {
  const [monthEntries, setMonthEntries] = useState<WorkDayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<LocalDate | null>(null);

  const { year, month } = parseYearMonth(selectedYearMonth);
  const monthLabel = formatMonthFull(year, month);
  const canGoPrev = compareYearMonths(selectedYearMonth, minYearMonth) > 0;
  const canGoNext = compareYearMonths(selectedYearMonth, maxYearMonth) < 0;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchWorkDaysForMonth(userId, selectedYearMonth)
      .then((data) => {
        if (!cancelled) setMonthEntries(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, selectedYearMonth, allWorkDays.length]);

  const marks = useMemo(
    () => buildCalendarMarks(selectedYearMonth, monthEntries, manualHolidays),
    [selectedYearMonth, monthEntries, manualHolidays],
  );
  const days = useMemo(() => buildCalendarDays(selectedYearMonth), [selectedYearMonth]);
  const workedCount = countWorkedDays(selectedYearMonth, marks);
  const nonWorkedWeekdays = countNonWorkedWeekdays(selectedYearMonth, marks);

  const monthPayroll = useMemo(() => {
    if (!profile) return null;
    const prefix = selectedYearMonth;
    const entries = allWorkDays.filter((e) => e.date.startsWith(prefix));
    const deductions = monthDeductions.filter((d) => d.entryType !== "ADVANCE");
    return applyManualEntries(
      liquidateMonth(profile, year, month, entries, manualHolidays),
      deductions,
    );
  }, [profile, allWorkDays, monthDeductions, manualHolidays, year, month, selectedYearMonth]);

  const todayIso = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  })();

  const editingEntry = selectedDate
    ? monthEntries.find((e) => e.date === selectedDate) ?? null
    : null;

  function handleDayClick(date: LocalDate) {
    setSelectedDate(date);
  }

  function handleRefresh() {
    fetchWorkDaysForMonth(userId, selectedYearMonth).then(setMonthEntries);
    onRefresh();
  }

  return (
    <section className="editor-section">
      <h2>Calendario</h2>
      <p className="editor-lead">{monthLabel}</p>

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
        {selectedYearMonth !== maxYearMonth && (
          <button
            type="button"
            className="month-nav-today"
            onClick={() => onSelectYearMonth(maxYearMonth)}
          >
            Hoy
          </button>
        )}
      </div>

      <div className="calendar-card">
        <div className="calendar-weekdays">
          {WEEKDAYS.map((label) => (
            <span key={label} className="calendar-weekday">
              {label}
            </span>
          ))}
        </div>
        <div className="calendar-grid">
          {days.map((date, idx) => {
            if (!date) return <span key={`empty-${idx}`} className="calendar-cell calendar-cell--empty" />;
            const mark = marks.get(date);
            const isToday = date === todayIso;
            const worked = mark?.worked;
            const holidayColor = mark?.officialHoliday
              ? "official"
              : mark?.manualHoliday
                ? "manual"
                : null;
            return (
              <button
                key={date}
                type="button"
                className={`calendar-cell${worked ? " calendar-cell--worked" : ""}${isToday ? " calendar-cell--today" : ""}${holidayColor ? ` calendar-cell--${holidayColor}` : ""}`}
                onClick={() => handleDayClick(date)}
                aria-label={`Día ${date}`}
              >
                <span className="calendar-day-num">{parseInt(date.slice(8, 10), 10)}</span>
              </button>
            );
          })}
        </div>
        <div className="calendar-legend">
          <span><i className="legend-dot legend-dot--worked" /> Día trabajado</span>
          <span><i className="legend-dot legend-dot--muted" /> Día no trabajado</span>
          <span><i className="legend-dot legend-dot--official" /> Festivo Colombia</span>
          <span><i className="legend-dot legend-dot--manual" /> Festivo manual</span>
        </div>
      </div>

      {loading && <p className="dashboard-status">Cargando calendario…</p>}

      <div className="summary-card calendar-summary">
        <p className="summary-month">Resumen de {monthLabel.toLowerCase()}</p>
        <div className="calendar-stats">
          <div>
            <strong className="calendar-stat-value">{workedCount}</strong>
            <span className="calendar-stat-label">días trabajados</span>
          </div>
          <div>
            <strong className="calendar-stat-value">{nonWorkedWeekdays}</strong>
            <span className="calendar-stat-label">días no laborados</span>
          </div>
        </div>
      </div>

      {monthPayroll && (
        <div className="summary-card">
          <div className="summary-row">
            <span className="summary-label">Neto estimado del mes</span>
            <span className="summary-value summary-value--net">{formatMoney(monthPayroll.netTotal)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Días registrados</span>
            <span className="summary-value">{monthPayroll.workedDays}</span>
          </div>
        </div>
      )}

      {!profile && (
        <div className="dashboard-empty">
          <p>Configura tu perfil en Ajustes para ver el neto estimado.</p>
        </div>
      )}

      {selectedDate && (
        <DayEditorModal
          userId={userId}
          date={selectedDate}
          existingEntry={editingEntry}
          preferences={preferences}
          dailyHours={profile?.dailyHours ?? 8}
          isManualHoliday={manualHolidays.has(selectedDate)}
          isOfficialHoliday={marks.get(selectedDate)?.officialHoliday ?? false}
          onClose={() => setSelectedDate(null)}
          onSaved={handleRefresh}
        />
      )}
    </section>
  );
}
