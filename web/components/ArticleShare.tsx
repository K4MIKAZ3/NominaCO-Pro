"use client";

import { useState } from "react";

type ArticleShareProps = {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
};

const SHARE_IMAGE_WIDTH = 1920;
const SHARE_IMAGE_HEIGHT = 1080;

function fileNameFromTitle(title: string): string {
  const normalized = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 58);

  return normalized || "articulo-nominapp";
}

async function imageBlobToHighQualityPngFile(blob: Blob, title: string): Promise<File> {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = new window.Image();
    image.decoding = "async";
    image.src = objectUrl;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = SHARE_IMAGE_WIDTH;
    canvas.height = SHARE_IMAGE_HEIGHT;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas no disponible");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("No se pudo convertir la imagen"));
        }
      }, "image/png");
    });

    return new File([pngBlob], `${fileNameFromTitle(title)}.png`, {
      type: "image/png",
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function fetchShareImage(imageUrl: string, title: string): Promise<File | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const blob = await response.blob();
    return imageBlobToHighQualityPngFile(blob, title);
  } catch {
    return null;
  }
}

export function ArticleShare({ title, description, url, imageUrl }: ArticleShareProps) {
  const [status, setStatus] = useState("");

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
      setStatus("Preparando para compartir...");

      try {
        const imageFile = imageUrl ? await fetchShareImage(imageUrl, title) : null;
        const text = `${title}\n\n${description}\n\n${url}`;
        const textWithSeparateUrl = `${title}\n\n${description}`;

        if (
          imageFile &&
          navigator.canShare?.({ files: [imageFile], title, text })
        ) {
          await navigator.share({ files: [imageFile], title, text });
          setStatus("Artículo compartido con imagen");
          return;
        }

        await navigator.share({ title, text: textWithSeparateUrl, url });
        setStatus("Artículo compartido");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setStatus("");
          return;
        }
      }
    }

    await copyUrl();
  }

  return (
    <section className="article-share" aria-label="Compartir artículo">
      <button type="button" className="share-button share-button-primary" onClick={shareArticle}>
        Compartir artículo
      </button>
      <p className="article-share-status" aria-live="polite">
        {status}
      </p>
    </section>
  );
}
