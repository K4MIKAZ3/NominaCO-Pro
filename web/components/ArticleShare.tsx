"use client";

import { useState } from "react";

type ArticleShareProps = {
  title: string;
  description: string;
  url: string;
};

export function ArticleShare({ title, description, url }: ArticleShareProps) {
  const [status, setStatus] = useState("");
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedShareText = encodeURIComponent(`${title}\n${url}`);
  const encodedEmailBody = encodeURIComponent(`${description}\n\n${url}`);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Enlace copiado");
    } catch {
      setStatus("No se pudo copiar. Copia la URL desde la barra del navegador.");
    }
  }

  async function shareArticle() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
        setStatus("Artículo compartido");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    await copyUrl();
  }

  return (
    <section className="article-share" aria-labelledby="article-share-title">
      <div>
        <h2 id="article-share-title">Compartir artículo</h2>
        <p>Envía esta guía por WhatsApp, correo o copia el enlace.</p>
      </div>
      <div className="article-share-actions">
        <button type="button" className="share-button share-button-primary" onClick={shareArticle}>
          Compartir
        </button>
        <a
          className="share-button"
          href={`https://wa.me/?text=${encodedShareText}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
        <a
          className="share-button"
          href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Telegram
        </a>
        <a
          className="share-button"
          href={`mailto:?subject=${encodedTitle}&body=${encodedEmailBody}`}
        >
          Correo
        </a>
        <button type="button" className="share-button" onClick={copyUrl}>
          Copiar enlace
        </button>
      </div>
      <p className="article-share-url" title={url}>
        {url}
      </p>
      <p className="article-share-status" aria-live="polite">
        {status}
      </p>
    </section>
  );
}
