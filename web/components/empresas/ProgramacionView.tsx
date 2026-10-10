"use client";

import { useState } from "react";
import { formatDay } from "@/lib/empresas/format";
import { isRestDay } from "@/lib/empresas/payroll";
import { DEMO_DAYS, DEMO_TODAY, WORKERS } from "@/lib/empresas/seed";
import { useEmpresas } from "@/lib/empresas/store";
import type { Assignment, ShiftRow, WorkerNotification } from "@/lib/empresas/types";

const PRESETS = [
  { id: "madrugada", label: "Madrugada", start: "04:00", end: "12:00" },
  { id: "mostrador", label: "Mostrador", start: "08:00", end: "17:00" },
  { id: "tarde", label: "Tarde", start: "13:00", end: "21:00" },
] as const;

type EditorRow = {
  workerId: string;
  checked: boolean;
  start: string;
  end: string;
};

type ProgramacionViewProps = {
  readOnly: boolean;
  onPublished: (notices: WorkerNotification[]) => void;
};

function isoDay(day: number): string {
  return `2026-10-${String(day).padStart(2, "0")}`;
}

function weekdayOffset(iso: string): number {
  const [year, month, day] = iso.split("-").map(Number);
  const js = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return js === 0 ? 6 : js - 1;
}

function buildRows(date: string, assignments: Assignment[]): EditorRow[] {
  return WORKERS.map((worker) => {
    const existing = assignments.find((assignment) => assignment.date === date && assignment.workerId === worker.id);
    return {
      workerId: worker.id,
      checked: Boolean(existing),
      start: existing?.plannedStart ?? "04:00",
      end: existing?.plannedEnd ?? "12:00",
    };
  });
}

function selectedRows(rows: EditorRow[]): ShiftRow[] {
  return rows
    .filter((row) => row.checked)
    .map((row) => ({ workerId: row.workerId, plannedStart: row.start, plannedEnd: row.end }));
}

function differsFromStored(date: string, rows: EditorRow[], assignments: Assignment[]): boolean {
  const stored = assignments.filter((assignment) => assignment.date === date);
  const checked = rows.filter((row) => row.checked);
  if (stored.length !== checked.length) return true;
  return checked.some((row) => {
    const match = stored.find((assignment) => assignment.workerId === row.workerId);
    return !match || match.plannedStart !== row.start || match.plannedEnd !== row.end;
  });
}

function needsPublish(date: string, rows: EditorRow[], assignments: Assignment[], pendingDates: string[]): boolean {
  if (pendingDates.includes(date)) return true;
  const published = assignments.filter((assignment) => assignment.date === date && assignment.status === "publicado");
  const checked = rows.filter((row) => row.checked);
  if (published.length !== checked.length) return true;
  return checked.some((row) => {
    const match = published.find((assignment) => assignment.workerId === row.workerId);
    return !match || match.plannedStart !== row.start || match.plannedEnd !== row.end;
  });
}

export function ProgramacionView({ readOnly, onPublished }: ProgramacionViewProps) {
  const { state } = useEmpresas();
  const [selected, setSelected] = useState(DEMO_TODAY);
  const visibleWorkers = readOnly ? WORKERS.filter((worker) => worker.id === state.workerId) : WORKERS;
  const signature = state.assignments
    .filter((assignment) => assignment.date === selected)
    .map((assignment) => `${assignment.workerId}:${assignment.plannedStart}:${assignment.plannedEnd}:${assignment.status}`)
    .join("|");

  return (
    <div className="nx-split">
      <section className="nx-card">
        <h2>{readOnly ? "Mi horario de octubre" : "Octubre 2026"}</h2>
        <p className="nx-muted">
          {readOnly
            ? "Estos son los días que te publicaron. El aviso llega en cuanto el turno se publica."
            : "El 1 al 9 ya está publicado. El 10 está libre para armar un turno nuevo."}
        </p>
        <div className="nx-weekdays" aria-hidden="true">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="nx-cal" role="grid" aria-label="Calendario de octubre 2026">
          {Array.from({ length: weekdayOffset("2026-10-01") }, (_, index) => (
            <span key={`blank-${index}`} />
          ))}
          {Array.from({ length: DEMO_DAYS }, (_, index) => {
            const date = isoDay(index + 1);
            const dayAssignments = state.assignments.filter(
              (assignment) => assignment.date === date && (!readOnly || assignment.workerId === state.workerId),
            );
            const published = dayAssignments.filter((assignment) => assignment.status === "publicado").length;
            const drafts = dayAssignments.length - published;
            return (
              <button
                key={date}
                type="button"
                role="gridcell"
                className={selected === date ? "is-selected" : ""}
                aria-pressed={selected === date}
                aria-label={formatDay(date)}
                onClick={() => setSelected(date)}
              >
                <strong>{index + 1}</strong>
                {date === "2026-10-12" ? <em>Festivo</em> : isRestDay(date) ? <em>Domingo</em> : null}
                {dayAssignments.length > 0 ? (
                  <span className="nx-dots">
                    {published > 0 ? <i className="is-live" title="Publicado" /> : null}
                    {drafts > 0 ? <i className="is-draft" title="Borrador" /> : null}
                    <small>{dayAssignments.length}</small>
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>
      {readOnly ? (
        <ReadOnlyDay date={selected} workerId={state.workerId} assignments={state.assignments} />
      ) : (
        <DayEditor
          key={`${selected}|${signature}|${state.pendingRemovals.length}`}
          date={selected}
          assignments={state.assignments}
          pendingDates={state.pendingRemovals.map((item) => item.date)}
          workers={visibleWorkers}
          onPublished={onPublished}
        />
      )}
    </div>
  );
}

function ReadOnlyDay({
  date,
  workerId,
  assignments,
}: {
  date: string;
  workerId: string;
  assignments: Assignment[];
}) {
  const assignment = assignments.find((item) => item.date === date && item.workerId === workerId);
  return (
    <section className="nx-card">
      <h2>{formatDay(date)}</h2>
      {assignment ? (
        <>
          <p className={assignment.status === "publicado" ? "nx-pill is-live" : "nx-pill is-draft"}>
            {assignment.status === "publicado" ? "Publicado" : "Borrador, todavía no te llega aviso"}
          </p>
          <p className="nx-shift">
            {assignment.plannedStart} – {assignment.plannedEnd}
          </p>
          {isRestDay(date) ? <p className="nx-note">Este día tiene recargo dominical o festivo.</p> : null}
        </>
      ) : (
        <p>Este día no tienes turno.</p>
      )}
    </section>
  );
}

function DayEditor({
  date,
  assignments,
  pendingDates,
  workers,
  onPublished,
}: {
  date: string;
  assignments: Assignment[];
  pendingDates: string[];
  workers: typeof WORKERS;
  onPublished: (notices: WorkerNotification[]) => void;
}) {
  const { saveDay, publishDay } = useEmpresas();
  const [rows, setRows] = useState<EditorRow[]>(() => buildRows(date, assignments));
  const [savedNote, setSavedNote] = useState("");
  const dirty = differsFromStored(date, rows, assignments);
  const canPublish = needsPublish(date, rows, assignments, pendingDates);
  const checkedCount = rows.filter((row) => row.checked).length;

  function applyPreset(start: string, end: string) {
    setSavedNote("");
    setRows((current) => current.map((row) => (row.checked ? { ...row, start, end } : row)));
  }

  function toggle(workerId: string) {
    setSavedNote("");
    setRows((current) =>
      current.map((row) => {
        if (row.workerId !== workerId) return row;
        if (row.checked) return { ...row, checked: false };
        return { ...row, checked: true };
      }),
    );
  }

  function updateTime(workerId: string, field: "start" | "end", value: string) {
    setSavedNote("");
    setRows((current) => current.map((row) => (row.workerId === workerId ? { ...row, [field]: value } : row)));
  }

  return (
    <section className="nx-card">
      <h2>{formatDay(date)}</h2>
      <p className="nx-muted">Marca las personas de este día y confirma la hora de entrada y salida.</p>
      <div className="nx-presets" role="group" aria-label="Turnos frecuentes">
        {PRESETS.map((preset) => (
          <button key={preset.id} type="button" className="nx-btn nx-btn-ghost" onClick={() => applyPreset(preset.start, preset.end)}>
            {preset.label}
            <small>
              {preset.start}–{preset.end}
            </small>
          </button>
        ))}
      </div>
      <ul className="nx-people">
        {workers.map((worker) => {
          const row = rows.find((item) => item.workerId === worker.id);
          if (!row) return null;
          return (
            <li key={worker.id} className={row.checked ? "is-on" : ""}>
              <label>
                <input type="checkbox" checked={row.checked} onChange={() => toggle(worker.id)} />
                <span>
                  <strong>{worker.name}</strong>
                  <small>{worker.jobTitle}</small>
                </span>
              </label>
              {row.checked ? (
                <div className="nx-times">
                  <label>
                    Entra
                    <input type="time" value={row.start} onChange={(event) => updateTime(worker.id, "start", event.target.value)} />
                  </label>
                  <label>
                    Sale
                    <input type="time" value={row.end} onChange={(event) => updateTime(worker.id, "end", event.target.value)} />
                  </label>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      <div className="nx-actions">
        <button
          type="button"
          className="nx-btn nx-btn-ghost"
          disabled={!dirty}
          onClick={() => {
            saveDay(date, selectedRows(rows));
            setSavedNote(checkedCount === 0 ? "Día guardado sin turnos." : "Borrador guardado. Falta publicarlo para avisar.");
          }}
        >
          Guardar borrador
        </button>
        <button
          type="button"
          className="nx-btn nx-btn-primary"
          disabled={!canPublish}
          onClick={() => {
            const notices = publishDay(date, selectedRows(rows));
            setSavedNote("");
            if (notices.length > 0) onPublished(notices);
          }}
        >
          Publicar y avisar
        </button>
      </div>
      {savedNote ? <p className="nx-note">{savedNote}</p> : null}
      {!canPublish && checkedCount > 0 ? <p className="nx-muted">Este día ya está publicado con estos turnos.</p> : null}
    </section>
  );
}
