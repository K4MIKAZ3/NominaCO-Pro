"use client";

import { FormEvent, useEffect, useState } from "react";
import { site } from "@/lib/site";

type FormStatus = "idle" | "sending" | "success" | "error";

interface ContactDialogProps {
  triggerLabel?: string;
  triggerClassName?: string;
  defaultSubject?: string;
}

export function ContactDialog({
  triggerLabel = "Contacto",
  triggerClassName = "footer-contact-trigger",
  defaultSubject = "",
}: ContactDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  function resetForm() {
    setName("");
    setEmail("");
    setSubject(defaultSubject);
    setMessage("");
    setStatus("idle");
    setErrorText(null);
  }

  function closeDialog() {
    setOpen(false);
    resetForm();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorText(null);

    const company =
      (e.currentTarget.elements.namedItem("company") as HTMLInputElement | null)?.value ?? "";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, company }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "No se pudo enviar el mensaje.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorText(err instanceof Error ? err.message : "Ocurrió un error.");
    }
  }

  return (
    <>
      <button type="button" className={triggerClassName} onClick={() => setOpen(true)}>
        {triggerLabel}
      </button>

      {open && (
        <div
          className="contact-overlay"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDialog();
          }}
        >
          <div
            className="contact-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-dialog-title"
          >
            <button
              type="button"
              className="contact-dialog-close"
              onClick={closeDialog}
              aria-label="Cerrar"
            >
              ×
            </button>

            {status === "success" ? (
              <div className="contact-success">
                <h2 id="contact-dialog-title">Mensaje enviado</h2>
                <p className="subtitle">
                  Gracias por escribirnos. Revisaremos tu solicitud y te responderemos al correo
                  que indicaste.
                </p>
                <button type="button" className="btn btn-primary" onClick={closeDialog}>
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <h2 id="contact-dialog-title">Cotiza tu proyecto</h2>
                <p className="subtitle">
                  Cuéntanos qué quieres construir con {site.name}. Te responderemos a tu correo.
                </p>

                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    name="company"
                    tabIndex={-1}
                    autoComplete="off"
                    className="contact-honeypot"
                    aria-hidden="true"
                  />

                  <div className="form-group">
                    <label htmlFor="contact-name">Nombre</label>
                    <input
                      id="contact-name"
                      type="text"
                      autoComplete="name"
                      required
                      maxLength={120}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-email">Correo electrónico</label>
                    <input
                      id="contact-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-subject">Asunto (opcional)</label>
                    <input
                      id="contact-subject"
                      type="text"
                      maxLength={160}
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-message">Tu solicitud</label>
                    <textarea
                      id="contact-message"
                      required
                      minLength={10}
                      maxLength={4000}
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ej: quiero un chatbot para ventas, automatizar reportes o crear una landing con IA..."
                    />
                  </div>

                  {errorText && <div className="form-message error">{errorText}</div>}

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={status === "sending"}
                    >
                      {status === "sending" ? "Enviando…" : "Enviar mensaje"}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={closeDialog}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
