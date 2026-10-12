"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { STAFF, createEmptyState, createSeedState } from "./seed";
import { employeeName } from "./types";
import { formatDay } from "./format";
import type { Company, Employee, EmpresasState, Novelty, Period, Role, ShiftRow, WorkerNotification } from "./types";

const STORAGE_KEY = "nominapp-empresas:v2";

type EmpresasStore = {
  state: EmpresasState;
  setRole: (role: Role) => void;
  setWorkerId: (workerId: string) => void;
  setPeriod: (period: Period) => void;
  saveCompany: (company: Company) => void;
  saveEmployee: (employee: Employee) => void;
  addNovelty: (novelty: Novelty) => void;
  removeNovelty: (id: string) => void;
  saveDay: (date: string, rows: ShiftRow[]) => void;
  publishDay: (date: string, rows: ShiftRow[]) => WorkerNotification[];
  markTime: (assignmentId: string, clockIn: string, clockOut: string) => void;
  markAllRead: (workerId: string) => void;
  loadExample: () => void;
  startBlank: () => void;
};

const EmpresasContext = createContext<EmpresasStore | null>(null);

function isState(value: unknown): value is EmpresasState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as EmpresasState;
  return (
    Array.isArray(candidate.employees) &&
    Array.isArray(candidate.assignments) &&
    Array.isArray(candidate.clocks) &&
    Array.isArray(candidate.notifications) &&
    Array.isArray(candidate.pendingRemovals) &&
    Array.isArray(candidate.novedades) &&
    typeof candidate.role === "string" &&
    typeof candidate.workerId === "string" &&
    Boolean(candidate.period)
  );
}

function loadState(): EmpresasState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function actorName(current: EmpresasState): string {
  if (current.role === "trabajador") {
    const employee = current.employees.find((worker) => worker.id === current.workerId);
    return employee ? employeeName(employee) : "Trabajador";
  }
  return STAFF[current.role].name;
}

function workerFirstName(current: EmpresasState, workerId: string): string {
  const employee = current.employees.find((worker) => worker.id === workerId);
  return employee?.firstName ?? "Hola";
}

function noticesForPublish(current: EmpresasState, date: string, now: string): WorkerNotification[] {
  const drafts = current.assignments.filter(
    (assignment) => assignment.date === date && assignment.status === "borrador",
  );
  const removals = current.pendingRemovals.filter((item) => item.date === date);
  const created: WorkerNotification[] = [];
  for (const assignment of drafts) {
    const companyName = current.company?.name ?? "la empresa";
    created.push({
      id: `n-${now}-${assignment.workerId}`,
      workerId: assignment.workerId,
      date,
      title: "Turno publicado",
      body: `${workerFirstName(current, assignment.workerId)}, tu turno del ${formatDay(date)} en ${companyName} quedó publicado: entras a las ${assignment.plannedStart} y sales a las ${assignment.plannedEnd}.`,
      createdAt: now,
      read: false,
    });
  }
  for (const removal of removals) {
    created.push({
      id: `n-${now}-out-${removal.workerId}`,
      workerId: removal.workerId,
      date,
      title: "Turno retirado",
      body: `${workerFirstName(current, removal.workerId)}, tu turno del ${formatDay(date)} (${removal.plannedStart}–${removal.plannedEnd}) se retiró de la programación.`,
      createdAt: now,
      read: false,
    });
  }
  return created;
}

function withDay(current: EmpresasState, date: string, rows: ShiftRow[]): EmpresasState {
  const previous = current.assignments.filter((assignment) => assignment.date === date);
  const selected = new Set(rows.map((row) => row.workerId));
  const removed = previous.filter(
    (assignment) => assignment.status === "publicado" && !selected.has(assignment.workerId),
  );
  const pendingRemovals = [
    ...current.pendingRemovals.filter((item) => item.date !== date || !selected.has(item.workerId)),
    ...removed.map((assignment) => ({
      workerId: assignment.workerId,
      date,
      plannedStart: assignment.plannedStart,
      plannedEnd: assignment.plannedEnd,
    })),
  ];
  const keptIds = new Set(rows.map((row) => `a-${date}-${row.workerId}`));
  const assignments = [
    ...current.assignments.filter((assignment) => assignment.date !== date),
    ...rows.map((row) => {
      const id = `a-${date}-${row.workerId}`;
      const old = previous.find((assignment) => assignment.id === id);
      const changed = !old || old.plannedStart !== row.plannedStart || old.plannedEnd !== row.plannedEnd;
      return {
        id,
        date,
        workerId: row.workerId,
        plannedStart: row.plannedStart,
        plannedEnd: row.plannedEnd,
        status: changed ? ("borrador" as const) : old.status,
        publishedAt: changed ? null : old.publishedAt,
      };
    }),
  ];
  const clocks = current.clocks.filter((clock) => {
    const assignment = current.assignments.find((item) => item.id === clock.assignmentId);
    if (!assignment || assignment.date !== date) return true;
    return keptIds.has(clock.assignmentId);
  });
  return { ...current, assignments, clocks, pendingRemovals };
}

export function EmpresasProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EmpresasState>(() => loadState() ?? createEmptyState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* Demo sin almacenamiento disponible. */
    }
  }, [state]);

  const store = useMemo<EmpresasStore>(() => {
    return {
      state,
      setRole: (role) => setState((current) => ({ ...current, role })),
      setWorkerId: (workerId) => setState((current) => ({ ...current, workerId })),
      setPeriod: (period) => setState((current) => ({ ...current, period })),
      saveCompany: (company) => setState((current) => ({ ...current, company })),
      saveEmployee: (employee) =>
        setState((current) => {
          const exists = current.employees.some((item) => item.id === employee.id);
          const employees = exists
            ? current.employees.map((item) => (item.id === employee.id ? employee : item))
            : [...current.employees, employee];
          return {
            ...current,
            employees,
            workerId: current.workerId || employee.id,
          };
        }),
      addNovelty: (novelty) => setState((current) => ({ ...current, novedades: [novelty, ...current.novedades] })),
      removeNovelty: (id) =>
        setState((current) => ({ ...current, novedades: current.novedades.filter((item) => item.id !== id) })),
      saveDay: (date, rows) => setState((current) => withDay(current, date, rows)),
      publishDay: (date, rows) => {
        const now = new Date().toISOString();
        const drafted = withDay(state, date, rows);
        const notices = noticesForPublish(drafted, date, now);
        const createdIds = new Set(notices.map((notice) => notice.id));
        setState({
          ...drafted,
          notifications: [...notices, ...drafted.notifications.filter((notice) => !createdIds.has(notice.id))],
          pendingRemovals: drafted.pendingRemovals.filter((item) => item.date !== date),
          assignments: drafted.assignments.map((assignment) =>
            assignment.date === date && assignment.status === "borrador"
              ? { ...assignment, status: "publicado" as const, publishedAt: now }
              : assignment,
          ),
        });
        return notices;
      },
      markTime: (assignmentId, clockIn, clockOut) => {
        setState((current) => {
          const markedBy = actorName(current);
          const next = {
            assignmentId,
            clockIn,
            clockOut,
            markedBy,
            markedAt: new Date().toISOString(),
          };
          const exists = current.clocks.some((clock) => clock.assignmentId === assignmentId);
          return {
            ...current,
            clocks: exists
              ? current.clocks.map((clock) => (clock.assignmentId === assignmentId ? next : clock))
              : [...current.clocks, next],
          };
        });
      },
      markAllRead: (workerId) => {
        setState((current) => ({
          ...current,
          notifications: current.notifications.map((notice) =>
            notice.workerId === workerId ? { ...notice, read: true } : notice,
          ),
        }));
      },
      loadExample: () => setState(createSeedState()),
      startBlank: () => setState(createEmptyState()),
    };
  }, [state]);

  return <EmpresasContext.Provider value={store}>{children}</EmpresasContext.Provider>;
}

export function useEmpresas(): EmpresasStore {
  const store = useContext(EmpresasContext);
  if (!store) throw new Error("useEmpresas debe usarse dentro de EmpresasProvider");
  return store;
}
