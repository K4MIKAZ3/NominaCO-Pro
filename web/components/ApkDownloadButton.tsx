"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { parseReleasesManifest, type AppRelease } from "@/lib/releases";
import { site } from "@/lib/site";

const FALLBACK_RELEASES: AppRelease[] = [
  {
    versionCode: 12,
    versionName: "1.7.1",
    apkUrl: site.apkDownloadUrl,
    releaseNotes: "Descarga la última versión de Nominapp para Android.",
  },
];

type ApkDownloadButtonProps = {
  children: React.ReactNode;
  className?: string;
};

export function ApkDownloadButton({
  children,
  className = "btn btn-primary",
}: ApkDownloadButtonProps) {
  const [open, setOpen] = useState(false);
  const [releases, setReleases] = useState<AppRelease[]>(FALLBACK_RELEASES);
  const [selectedVersion, setSelectedVersion] = useState(FALLBACK_RELEASES[0].versionName);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedRelease = useMemo(
    () =>
      releases.find((release) => release.versionName === selectedVersion) ??
      releases[0] ??
      null,
    [releases, selectedVersion],
  );

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    fetch("/api/releases", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          return fetch("/releases.json", { cache: "no-store" });
        }
        return response;
      })
      .then(async (response) => {
        if (!response.ok) throw new Error("No se pudo cargar la información de la versión.");
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        const parsed = parseReleasesManifest(data);
        const nextReleases = parsed.length > 0 ? parsed : FALLBACK_RELEASES;
        setReleases(nextReleases);
        setSelectedVersion(nextReleases[0].versionName);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setReleases(FALLBACK_RELEASES);
        setSelectedVersion(FALLBACK_RELEASES[0].versionName);
        setLoadError(
          error instanceof Error
            ? error.message
            : "No se pudo cargar la información de la versión.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  function confirmDownload() {
    if (!selectedRelease) return;
    window.location.href = selectedRelease.apkUrl;
    setOpen(false);
  }

  const dialog =
    open &&
    (
      <div
        className="contact-overlay"
        role="presentation"
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
      >
        <div
          className="contact-dialog download-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="download-dialog-title"
        >
          <button
            type="button"
            className="contact-dialog-close"
            aria-label="Cerrar"
            onClick={() => setOpen(false)}
          >
            ×
          </button>

          <h2 id="download-dialog-title">Descargar Nominapp</h2>
          <p className="subtitle">
            Revisa la versión y los cambios antes de descargar el APK para Android 8+.
          </p>

          {loading ? (
            <p className="download-dialog-status">Cargando versiones…</p>
          ) : (
            <>
              {loadError && <p className="form-message error">{loadError}</p>}

              {releases.length > 1 && (
                <div className="download-version-list" role="tablist" aria-label="Versiones disponibles">
                  {releases.map((release, index) => {
                    const isActive = release.versionName === selectedVersion;
                    return (
                      <button
                        key={release.versionName}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        className={`download-version-option${isActive ? " active" : ""}`}
                        onClick={() => setSelectedVersion(release.versionName)}
                      >
                        <span className="download-version-name">v{release.versionName}</span>
                        {index === 0 && (
                          <span className="download-version-badge">Recomendada</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedRelease && (
                <div className="download-release-card">
                  <p className="download-release-title">
                    Versión {selectedRelease.versionName}
                    {releases[0]?.versionName === selectedRelease.versionName && (
                      <span className="download-version-badge">Recomendada</span>
                    )}
                  </p>
                  {selectedRelease.publishedAt && (
                    <p className="download-release-meta">
                      Publicada el {selectedRelease.publishedAt}
                    </p>
                  )}
                  <h3 className="download-notes-title">Cambios</h3>
                  <p className="download-notes">{selectedRelease.releaseNotes}</p>
                </div>
              )}
            </>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={confirmDownload}
              disabled={loading || !selectedRelease}
            >
              Confirmar descarga
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>

      {mounted && dialog ? createPortal(dialog, document.body) : null}
    </>
  );
}
