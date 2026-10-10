"use client";

import { useState } from "react";
import { formatDay, formatHours, formatStamp } from "@/lib/empresas/format";
import { classifyHours, extraHoursOf, isRestDay, toMinutes } from "@/lib/empresas/payroll";
import { DEMO_TODAY, WORKERS } from "@/lib/empresas/seed";
import { useEmpresas } from "@/lib/empresas/store";
import type { Assignment, ClockRecord } from "@/lib/empresas/types";

function shiftDate(iso: string, delta: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + delta);
  const next = date.toISOString().slice(0, 10);
  if (next < "2026-10-01" || next > "2026-10-31") return iso;
  return next;
}

export function MarcacionView() {
  const { state, markTime } = useEmpresas();
  const [date, setDate] = useState(DEMO_TODAY);
  const published = state.assignments
    .filter((assignment) => assignment.date === date && assignment.status === "publicado")
    .sort((a, b) => a.plannedStart.localeCompare(b.plannedStart));

  return (
    <div className="nx-stack">
      <section className="nx-card">
        <h2>Marcación del día</h2>
        <p className="nx-muted">
          Solo aparecen personas con turno publicado. La nómina usa la hora real de entrada y de salida, no la hora
          planeada.
        </p>
        <div className="nx-datebar">
          <button type="button" className="nx-btn nx-btn-ghost" onClick={() => setDate((current) => shiftDate(current, -1))}>
            Día anterior
          </button>
          <label>
            Fecha
            <input
              type="date"
              min="2026-10-01"
              max="2026-10-31"
              value={date}
              onChange={(event) => {
                const value = event.target.value;
                if (value >= "2026-10-01" && value <= "2026-10-31") setDate(value);
              }}
            />
          </label>
          <button type="button" className="nx-btn nx-btn-ghost" onClick={() => setDate((current) => shiftDate(current, 1))}>
            Día siguiente
          </button>
        </div>
        <p className="nx-kicker">{formatDay(date)}</p>
      </section>
      {published.length === 0 ? (
        <section className="nx-card">
          <h2>Sin turnos publicados</h2>
          <p>Cuando la programación de este día se publique, aquí se podrá marcar la entrada y la salida.</p>
        </section>
      ) : (
        published.map((assignment) => (
          <MarkCard
            key={assignment.id}
            assignment={assignment}
            clock={state.clocks.find((clock) => clock.assignmentId === assignment.id)}
            onSave={(clockIn, clockOut) => markTime(assignment.id, clockIn, clockOut)}
          />
        ))
      )}
    </div>
  );
}

function MarkCard({
  assignment,
  clock,
  onSave,
}: {
  assignment: Assignment;
  clock: ClockRecord | undefined;
  onSave: (clockIn: string, clockOut: string) => void;
}) {
  const worker = WORKERS.find((item) => item.id === assignment.workerId);
  const [clockIn, setClockIn] = useState(clock?.clockIn || assignment.plannedStart);
  const [clockOut, setClockOut] = useState(clock?.clockOut || "");
  const [message, setMessage] = useState("");
  const late = clockIn ? toMinutes(clockIn) - toMinutes(assignment.plannedStart) : 0;
  const preview =
    clockIn && clockOut && worker
      ? classifyHours(clockIn, clockOut, worker.dailyHours, isRestDay(assignment.date))
      : null;

  return (
    <form
      className="nx-card nx-mark"
      onSubmit={(event) => {
        event.preventDefault();
        if (!clockIn || !clockOut) {
          setMessage("Faltan la entrada y la salida.");
          return;
        }
        onSave(clockIn, clockOut);
        setMessage("Marcación guardada. Ya entra en la nómina del mes.");
      }}
    >
      <div>
        <h2>{worker?.name}</h2>
        <p className="nx-muted">
          {worker?.jobTitle} · programado {assignment.plannedStart}–{assignment.plannedEnd}
        </p>
        {late >= 10 ? <p className="nx-pill is-late">Retardo de {late} min. No se descuenta solo.</p> : null}
        {isRestDay(assignment.date) ? <p className="nx-pill is-live">Domingo o festivo</p> : null}
      </div>
      <div className="nx-times">
        <label>
          Hora de entrada
          <input type="time" required value={clockIn} onChange={(event) => setClockIn(event.target.value)} />
        </label>
        <label>
          Hora de salida
          <input type="time" required value={clockOut} onChange={(event) => setClockOut(event.target.value)} />
        </label>
      </div>
      {preview ? (
        <p className="nx-note">
          Jornada ordinaria {formatHours(worker?.dailyHours ?? 8)}. Extra detectada: {formatHours(extraHoursOf(preview))}.
        </p>
      ) : null}
      {clock?.markedAt ? (
        <p className="nx-muted">
          Última marca de {clock.markedBy}, {formatStamp(clock.markedAt)}.
        </p>
      ) : null}
      <div className="nx-actions">
        <button type="submit" className="nx-btn nx-btn-primary">
          Guardar marcación
        </button>
      </div>
      {message ? <p className="nx-note">{message}</p> : null}
    </form>
  );
}
