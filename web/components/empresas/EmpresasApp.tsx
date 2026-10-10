"use client";

import { useEffect, useState } from "react";
import { BandejaView } from "@/components/empresas/BandejaView";
import { MarcacionView } from "@/components/empresas/MarcacionView";
import { NominaView } from "@/components/empresas/NominaView";
import { ProgramacionView } from "@/components/empresas/ProgramacionView";
import { PropuestaView } from "@/components/empresas/PropuestaView";
import { formatDay } from "@/lib/empresas/format";
import { COMPANY, STAFF, WORKERS } from "@/lib/empresas/seed";
import { EmpresasProvider, useEmpresas } from "@/lib/empresas/store";
import type { Role, WorkerNotification } from "@/lib/empresas/types";

type EmpresasView = "propuesta" | "programacion" | "marcacion" | "nomina" | "bandeja";

const ROLE_LABEL: Record<Role, string> = {
  programador: "Programador",
  marcador: "Marcación",
  administrador: "Administrador",
  trabajador: "Trabajador",
};

function viewsFor(role: Role): EmpresasView[] {
  if (role === "programador") return ["propuesta", "programacion"];
  if (role === "marcador") return ["propuesta", "marcacion"];
  if (role === "trabajador") return ["propuesta", "bandeja", "programacion", "nomina"];
  return ["propuesta", "programacion", "marcacion", "nomina", "bandeja"];
}

function viewLabel(view: EmpresasView, role: Role): string {
  if (view === "propuesta") return "Propuesta";
  if (view === "programacion") return role === "trabajador" ? "Mi horario" : "Programación";
  if (view === "marcacion") return "Marcación";
  if (view === "nomina") return "Nómina";
  return "Avisos";
}

export default function EmpresasApp() {
  return (
    <EmpresasProvider>
      <Shell />
    </EmpresasProvider>
  );
}

function Shell() {
  const { state, setRole, setWorkerId, reset } = useEmpresas();
  const [view, setView] = useState<EmpresasView>("propuesta");
  const [receipt, setReceipt] = useState<WorkerNotification[] | null>(null);
  const allowed = viewsFor(state.role);
  const activeView = allowed.includes(view) ? view : "propuesta";
  const unread = state.notifications.filter((notice) => notice.workerId === state.workerId && !notice.read).length;
  const actor =
    state.role === "trabajador"
      ? WORKERS.find((worker) => worker.id === state.workerId)
      : null;

  function changeRole(role: Role) {
    setRole(role);
    const nextViews = viewsFor(role);
    if (!nextViews.includes(view)) setView(nextViews[0]);
  }

  return (
    <div className="nx-app">
      <header className="nx-top">
        <div className="nx-brand">
          <BrandMark />
          <div>
            <strong>Nominapp Empresas</strong>
            <small>
              {COMPANY.name} · {COMPANY.city}
            </small>
          </div>
        </div>
        <div className="nx-rolebar">
          <div className="nx-roles" role="group" aria-label="Cambiar de rol">
            {(Object.keys(ROLE_LABEL) as Role[]).map((role) => (
              <button key={role} type="button" aria-pressed={state.role === role} onClick={() => changeRole(role)}>
                {ROLE_LABEL[role]}
              </button>
            ))}
          </div>
          {state.role === "trabajador" ? (
            <label className="nx-worker-pick">
              Ver como
              <select value={state.workerId} onChange={(event) => setWorkerId(event.target.value)}>
                {WORKERS.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="nx-actor">
              {STAFF[state.role].name}
              <small>{STAFF[state.role].title}</small>
            </p>
          )}
        </div>
        <button type="button" className="nx-btn nx-btn-ghost" onClick={reset}>
          Restaurar demo
        </button>
      </header>
      <div className="nx-body">
        <nav className="nx-nav" aria-label="Secciones">
          {allowed.map((item) => (
            <button
              key={item}
              type="button"
              aria-current={activeView === item ? "page" : undefined}
              onClick={() => setView(item)}
            >
              {viewLabel(item, state.role)}
              {item === "bandeja" && state.role === "trabajador" && unread > 0 ? <em>{unread}</em> : null}
            </button>
          ))}
        </nav>
        <main className="nx-main">
          {activeView === "propuesta" ? (
            <PropuestaView
              onStart={() => {
                changeRole("programador");
                setView("programacion");
              }}
            />
          ) : null}
          {activeView === "programacion" ? (
            <ProgramacionView
              readOnly={state.role === "trabajador"}
              onPublished={(notices) => {
                setReceipt(notices);
              }}
            />
          ) : null}
          {activeView === "marcacion" ? <MarcacionView /> : null}
          {activeView === "nomina" ? <NominaView /> : null}
          {activeView === "bandeja" ? <BandejaView /> : null}
        </main>
      </div>
      {receipt ? (
        <PublishReceipt
          notices={receipt}
          onClose={() => setReceipt(null)}
          onSeeWorker={(workerId) => {
            setWorkerId(workerId);
            setRole("trabajador");
            setView("bandeja");
            setReceipt(null);
          }}
        />
      ) : null}
      <p className="nx-sr">
        {state.role === "trabajador"
          ? `Viendo la cuenta de ${actor?.name ?? "un trabajador"}`
          : `Sesión de ${STAFF[state.role].name}`}
      </p>
    </div>
  );
}

function PublishReceipt({
  notices,
  onClose,
  onSeeWorker,
}: {
  notices: WorkerNotification[];
  onClose: () => void;
  onSeeWorker: (workerId: string) => void;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const first = notices[0];
  return (
    <div className="nx-modal" role="presentation" onClick={onClose}>
      <div
        className="nx-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nx-receipt-title"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="nx-kicker">Enviado ahora</p>
        <h2 id="nx-receipt-title">
          {notices.length === 1 ? "1 persona recibió el aviso" : `${notices.length} personas recibieron el aviso`}
        </h2>
        <p>La notificación queda en la bandeja del trabajador en el momento de publicar. No hay que esperar al corte del mes.</p>
        <div className="nx-phones">
          {notices.slice(0, 3).map((notice) => {
            const worker = WORKERS.find((item) => item.id === notice.workerId);
            return (
              <article className="nx-phone" key={notice.id}>
                <header>
                  <span>Nominapp Empresas</span>
                  <time dateTime={notice.createdAt}>Ahora</time>
                </header>
                <h3>{notice.title}</h3>
                <p>{notice.body}</p>
                <footer>
                  {worker?.name} · {formatDay(notice.date)}
                </footer>
              </article>
            );
          })}
        </div>
        {notices.length > 3 ? <p className="nx-muted">Y {notices.length - 3} avisos más, del mismo momento.</p> : null}
        <div className="nx-actions">
          {first ? (
            <button type="button" className="nx-btn nx-btn-primary" onClick={() => onSeeWorker(first.workerId)}>
              Abrir la bandeja del trabajador
            </button>
          ) : null}
          <button type="button" className="nx-btn nx-btn-ghost" onClick={onClose}>
            Seguir programando
          </button>
        </div>
      </div>
    </div>
  );
}

function BrandMark() {
  return (
    <svg className="nx-mark" viewBox="0 0 48 48" aria-hidden="true">
      <rect width="48" height="48" rx="14" fill="#7dd3fc" />
      <circle cx="18" cy="18" r="4" fill="#075985" />
      <circle cx="30" cy="18" r="4" fill="#0369a1" />
      <path d="M12 34c1.5-5 4.2-7 8-7s6.2 2 7.6 6" fill="none" stroke="#075985" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M24 33c1.2-4 3.4-6 6.4-6 2.6 0 4.6 1.4 6 4.2" fill="none" stroke="#0369a1" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
