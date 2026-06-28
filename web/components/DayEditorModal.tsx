"use client";

import { useMemo, useState } from "react";
import * as Law from "@/lib/payroll/colombiaLaborLaw2026";
import { calculateHours } from "@/lib/payroll/hourCalculator";
import { deleteWorkDay, upsertManualHoliday, upsertWorkDay } from "@/lib/dashboard-api";
import { formatHours, formatTime } from "@/lib/format";
import type { AppPreferences } from "@/lib/payroll/models";
import type { DayType, WorkDayEntry } from "@/lib/payroll/models";
import type { LocalDate } from "@/lib/payroll/dates";

interface DayEditorModalProps {
  userId: string;
  date: LocalDate;
  existingEntry: WorkDayEntry | null;
  preferences: AppPreferences;
  dailyHours: number;
  isManualHoliday: boolean;
  isOfficialHoliday: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function padTime(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function DayEditorModal({
  userId,
  date,
  existingEntry,
  preferences,
  dailyHours,
  isManualHoliday,
  isOfficialHoliday,
  onClose,
  onSaved,
}: DayEditorModalProps) {
  const defaultStart = padTime(preferences.defaultStartHour, preferences.defaultStartMinute);
  const defaultEnd = padTime(preferences.defaultEndHour, preferences.defaultEndMinute);
  const use24h = preferences.use24HourFormat;

  const [start, setStart] = useState(existingEntry?.start ?? defaultStart);
  const [end, setEnd] = useState(existingEntry?.end ?? defaultEnd);
  const [notes, setNotes] = useState(existingEntry?.notes ?? "");
  const [manual, setManual] = useState(isManualHoliday);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSunday = Law.isSunday(date);
  const isRestDay = isOfficialHoliday || isSunday || manual;

  const preview = useMemo(() => {
    const entry: WorkDayEntry = { date, start, end, dayType: "NORMAL", notes };
    const breakdown = calculateHours(entry, dailyHours, isRestDay);
    return { breakdown, total: formatHours(
      breakdown.normalDiurna +
        breakdown.nocturnaOrdinaria +
        breakdown.extraDiurna +
        breakdown.extraNocturna +
        breakdown.dominicalDiurna +
        breakdown.dominicalNocturna +
        breakdown.extraDominicalDiurna +
        breakdown.extraDominicalNocturna,
    ) };
  }, [date, start, end, dailyHours, isRestDay, notes]);

  const overnightHint = end <= start;

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (!isOfficialHoliday) {
        if (manual) {
          await upsertManualHoliday(userId, date);
        } else if (isManualHoliday) {
          const { deleteManualHoliday } = await import("@/lib/dashboard-api");
          await deleteManualHoliday(userId, date);
        }
      }
      const manualSet = manual ? new Set([date]) : new Set<LocalDate>();
      const dayType: DayType = Law.isRestDay(date, manualSet) ? "FESTIVO_DOMINICAL" : "NORMAL";
      await upsertWorkDay(userId, { date, start, end, dayType, notes: notes.trim() });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!existingEntry) return;
    if (!window.confirm(`¿Eliminar la jornada del ${date}?`)) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteWorkDay(userId, date);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar.");
    } finally {
      setDeleting(false);
    }
  }

  const [y, m, d] = date.split("-");

  return (
    <div className="editor-dialog-backdrop" onClick={onClose}>
      <form
        className="editor-dialog editor-dialog--touch"
        onSubmit={handleSave}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>
          Día {d}/{m}/{y}
        </h3>

        {isOfficialHoliday && (
          <p className="editor-hint">Festivo oficial Colombia 2026</p>
        )}
        {isSunday && !isOfficialHoliday && (
          <p className="editor-hint">Domingo — recargo dominical si trabajas</p>
        )}
        {manual && !isOfficialHoliday && (
          <p className="editor-hint">Festivo manual — descanso remunerado</p>
        )}
        {!existingEntry && (
          <p className="editor-hint editor-hint--accent">
            Horario default: {formatTime(defaultStart, use24h)} – {formatTime(defaultEnd, use24h)}
          </p>
        )}

        {!isOfficialHoliday && (
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={manual}
              onChange={(e) => setManual(e.target.checked)}
            />
            <span>Marcar como festivo manual</span>
          </label>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="day-start">Entrada{use24h ? " (24 h)" : ""}</label>
            <input
              id="day-start"
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="day-end">Salida{use24h ? " (24 h)" : ""}</label>
            <input
              id="day-end"
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="preview-card">
          <strong>Vista previa</strong>
          <p>Horas netas: {preview.total} h</p>
          {preview.breakdown.extraDiurna > 0 && (
            <p>Extra diurna: {formatHours(preview.breakdown.extraDiurna)} h</p>
          )}
          {preview.breakdown.extraNocturna > 0 && (
            <p>Extra nocturna: {formatHours(preview.breakdown.extraNocturna)} h</p>
          )}
          {overnightHint && Number(preview.total) > dailyHours && (
            <p className="editor-hint editor-hint--accent">
              Turno cruza medianoche (válido si trabajaste de noche).
            </p>
          )}
        </div>

        <div className="form-group form-grid-full">
          <label htmlFor="day-notes">Notas</label>
          <textarea
            id="day-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <p className="editor-hint">Se descuenta 1 h de almuerzo (12:00–13:00) si aplica.</p>
        {isRestDay && (
          <p className="editor-hint editor-hint--accent">
            Recargos dominical/festivo según Ley 2466/2025.
          </p>
        )}

        {error && <div className="form-message error">{error}</div>}

        <div className="form-actions editor-dialog-actions">
          {existingEntry && (
            <button
              type="button"
              className="btn btn-ghost workday-delete"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "…" : "Borrar"}
            </button>
          )}
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
