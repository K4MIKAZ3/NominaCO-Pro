"use client";

import { formatDay, formatStamp } from "@/lib/empresas/format";
import { WORKERS } from "@/lib/empresas/seed";
import { useEmpresas } from "@/lib/empresas/store";

export function BandejaView() {
  const { state, markAllRead } = useEmpresas();
  const own = state.role === "trabajador";
  const notices = state.notifications.filter((notice) => !own || notice.workerId === state.workerId);
  const unread = notices.filter((notice) => !notice.read).length;

  return (
    <div className="nx-stack">
      <section className="nx-card">
        <h2>{own ? "Avisos de tu turno" : "Avisos enviados"}</h2>
        <p className="nx-muted">
          {own
            ? "El aviso se crea en el instante en que publican tu programación."
            : "Cada publicación deja aquí el mismo mensaje que recibió la persona."}
        </p>
        {own && unread > 0 ? (
          <button type="button" className="nx-btn nx-btn-ghost" onClick={() => markAllRead(state.workerId)}>
            Marcar {unread} como leídos
          </button>
        ) : null}
      </section>
      {notices.length === 0 ? (
        <section className="nx-card">
          <h2>Bandeja en blanco</h2>
          <p>Publica un turno y el aviso aparece aquí sin recargar.</p>
        </section>
      ) : (
        <ul className="nx-inbox">
          {notices.map((notice) => {
            const worker = WORKERS.find((item) => item.id === notice.workerId);
            return (
              <li key={notice.id} className={notice.read ? "" : "is-new"}>
                <article className="nx-phone">
                  <header>
                    <span>Nominapp Empresas</span>
                    <time dateTime={notice.createdAt}>{formatStamp(notice.createdAt)}</time>
                  </header>
                  <h3>{notice.title}</h3>
                  <p>{notice.body}</p>
                  <footer>
                    {worker?.name} · {formatDay(notice.date)}
                  </footer>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
