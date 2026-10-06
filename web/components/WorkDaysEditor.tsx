"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DAY_TYPE_OPTIONS,
  dayTypeLabel,
  deleteWorkDay,
  fetchWorkDaysForMonth,
  upsertWorkDay,
} from "@/lib/dashboard-api";
import { formatMonthFull } from "@/lib/format";
import {
  compareYearMonths,
  endOfMonth,
  parseYearMonth,
  shiftYearMonth,
  startOfMonth,
} from "@/lib/payroll/dates";
import type { DayType, WorkDayEntry } from "@/lib/payroll/models";

interface WorkDaysEditorProps {
  userId: string;
  selectedYearMonth: string;
  minYearMonth: string;
  maxYearMonth: string;
  onSelectYearMonth: (yearMonth: string) => void;
  onChanged: () => void;
}

const emptyDraft = (yearMonth: string): WorkDayEntry => {
  const { year, month } = parseYearMonth(yearMonth);
  return {
    date: startOfMonth(year, month),
    start: "08:00",
    end: "16:30",
    dayType: "NORMAL",
    notes: "",
  };
};

export function WorkDaysEditor({
  userId,
  selectedYearMonth,
  minYearMonth,
  maxYearMonth,
  onSelectYearMonth,
  onChanged,
}: WorkDaysEditorProps) {
  const [entries, setEntries] = useState<WorkDayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<WorkDayEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingDate, setDeletingDate] = useState<string | null>(null);

  const { year, month } = parseYearMonth(selectedYearMonth);
  const monthLabel = formatMonthFull(year, month);
  const canGoPrev = compareYearMonths(selectedYearMonth, minYearMonth) > 0;
  const canGoNext = compareYearMonths(selectedYearMonth, maxYearMonth) < 0;
  const monthStart = startOfMonth(year, month);
  const monthEnd = endOfMonth(year, month);

  const dateBounds = useMemo(
    () => ({ min: monthStart, max: monthEnd }),
    [monthStart, monthEnd],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchWorkDaysForMonth(userId, selectedYearMonth)
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudieron cargar las jornadas.");
          setEntries([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, selectedYearMonth]);

  function openNewDay() {
    setMessage(null);
    setError(null);
    setEditing(emptyDraft(selectedYearMonth));
  }

  function openEditDay(entry: WorkDayEntry) {
    setMessage(null);
    setError(null);
    setEditing({ ...entry });
  }

  function closeEditor() {
    setEditing(null);
  }

  async function handleSaveDay(event: React.FormEvent) {
    event.preventDefault();
    if (!editing) return;

    if (editing.date < dateBounds.min || editing.date > dateBounds.max) {
      setError(`La fecha debe estar dentro de ${monthLabel}.`);
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await upsertWorkDay(userId, editing);
      const refreshed = await fetchWorkDaysForMonth(userId, selectedYearMonth);
      setEntries(refreshed);
      setMessage("Jornada guardada.");
      setEditing(null);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la jornada.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(dateIso: string) {
    if (!window.confirm(`¿Eliminar la jornada del ${dateIso}?`)) return;
    setDeletingDate(dateIso);
    setError(null);
    setMessage(null);
    try {
      await deleteWorkDay(userId, dateIso);
      setEntries((current) => current.filter((entry) => entry.date !== dateIso));
      setMessage("Jornada eliminada.");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar.");
    } finally {
      setDeletingDate(null);
    }
  }

  return (
    <section className="editor-section">
      <div className="editor-section-header">
        <div>
          <h2>Jornadas del mes</h2>
          <p className="editor-lead">Registra o edita días trabajados sincronizados con la app.</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={openNewDay}>
          + Agregar día
        </button>
      </div>

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

      {loading && <p className="dashboard-status">Cargando jornadas…</p>}
      {error && !editing && <div className="form-message error">{error}</div>}
      {message && <div className="form-message success">{message}</div>}

      {!loading && entries.length === 0 && (
        <div className="dashboard-empty">
          <p>No hay jornadas registradas en {monthLabel}.</p>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <ul className="workday-list">
          {entries.map((entry) => (
            <li key={entry.date} className="workday-item">
              <div>
                <strong>{entry.date}</strong>
                <span className="workday-meta">
                  {entry.start} – {entry.end} · {dayTypeLabel(entry.dayType)}
                </span>
                {entry.notes.trim() && (
                  <span className="workday-notes">{entry.notes.trim()}</span>
                )}
              </div>
              <div className="workday-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => openEditDay(entry)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm workday-delete"
                  disabled={deletingDate === entry.date}
                  onClick={() => handleDelete(entry.date)}
                >
                  {deletingDate === entry.date ? "…" : "Eliminar"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <div className="editor-dialog-backdrop" onClick={closeEditor}>
          <form
            className="editor-dialog"
            onSubmit={handleSaveDay}
            onClick={(event) => event.stopPropagation()}
          >
            <h3>{entries.some((entry) => entry.date === editing.date) ? "Editar jornada" : "Nueva jornada"}</h3>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="workday-date">Fecha</label>
                <input
                  id="workday-date"
                  type="date"
                  min={dateBounds.min}
                  max={dateBounds.max}
                  value={editing.date}
                  onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="workday-type">Tipo de día</label>
                <select
                  id="workday-type"
                  value={editing.dayType}
                  onChange={(e) =>
                    setEditing({ ...editing, dayType: e.target.value as DayType })
                  }
                >
                  {DAY_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="workday-start">Entrada</label>
                <input
                  id="workday-start"
                  type="time"
                  value={editing.start}
                  onChange={(e) => setEditing({ ...editing, start: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="workday-end">Salida</label>
                <input
                  id="workday-end"
                  type="time"
                  value={editing.end}
                  onChange={(e) => setEditing({ ...editing, end: e.target.value })}
                  required
                />
              </div>
              <div className="form-group form-grid-full">
                <label htmlFor="workday-notes">Notas</label>
                <textarea
                  id="workday-notes"
                  rows={3}
                  value={editing.notes}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                />
              </div>
            </div>

            {error && <div className="form-message error">{error}</div>}

            <div className="form-actions editor-dialog-actions">
              <button type="button" className="btn btn-ghost" onClick={closeEditor}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Guardando…" : "Guardar jornada"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
