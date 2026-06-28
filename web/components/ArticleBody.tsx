import Image from "next/image";
import Link from "next/link";
import { ApkDownloadButton } from "@/components/ApkDownloadButton";
import type { BlogArticle, BlogSection } from "@/lib/blog/articles";
import { site } from "@/lib/site";

function renderSection(section: BlogSection, index: number) {
  switch (section.type) {
    case "h2":
      return <h2 key={index}>{section.text}</h2>;
    case "p":
      return <p key={index}>{section.text}</p>;
    case "ul":
      return (
        <ul key={index}>
          {section.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <aside key={index} className="article-callout">
          <p>{section.text}</p>
        </aside>
      );
    case "image":
      return (
        <figure key={index} className="article-figure">
          <Image
            src={section.src}
            alt={section.alt}
            width={800}
            height={450}
            className="article-inline-image"
          />
          {section.caption ? (
            <figcaption>{section.caption}</figcaption>
          ) : null}
        </figure>
      );
    default:
      return null;
  }
}

type ArticleBodyProps = {
  article: BlogArticle;
};

export function ArticleBody({ article }: ArticleBodyProps) {
  return (
    <article className="container prose article-prose">
      <nav className="article-breadcrumb" aria-label="Ruta">
        <Link href="/">Inicio</Link>
        <span aria-hidden="true"> / </span>
        <Link href="/guia">Guía</Link>
        <span aria-hidden="true"> / </span>
        <span>{article.title}</span>
      </nav>
      <h1>{article.title}</h1>
      <p className="updated">
        Publicado:{" "}
        {new Date(article.publishedAt).toLocaleDateString("es-CO", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}{" "}
        · {article.readingMinutes} min de lectura
      </p>
      {article.heroImage ? (
        <figure className="article-hero-image">
          <Image
            src={article.heroImage}
            alt=""
            width={960}
            height={540}
            priority
            className="article-hero-img"
          />
        </figure>
      ) : null}
      {article.sections.map((section, index) => renderSection(section, index))}
      <section className="article-cta">
        <h2>Lleva el control con {site.name}</h2>
        <p>
          Descarga la app gratis para Android, registra tus jornadas y consulta
          tu liquidación estimada según la normativa colombiana {site.year}.
        </p>
        <div className="hero-actions">
          <ApkDownloadButton>Descargar Nominapp</ApkDownloadButton>
          <Link href="/#preguntas" className="btn btn-ghost">
            Ver preguntas frecuentes
          </Link>
        </div>
      </section>
    </article>
  );
}
