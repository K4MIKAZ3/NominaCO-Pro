import Image from "next/image";
import Link from "next/link";
import { ApkDownloadButton } from "@/components/ApkDownloadButton";
import { ArticleShare } from "@/components/ArticleShare";
import type { BlogArticle, BlogSection } from "@/lib/blog/articles";
import { getArticle } from "@/lib/blog/articles";
import { absoluteUrl, site } from "@/lib/site";

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
  const articleUrl = absoluteUrl(`/guia/${article.slug}`);
  const articleImageUrl = article.heroImage ? absoluteUrl(article.heroImage) : undefined;
  const related =
    article.relatedSlugs
      ?.map((slug) => getArticle(slug))
      .filter((item): item is BlogArticle => Boolean(item)) ?? [];

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
        Por {site.contentAuthor} · Publicado:{" "}
        <time dateTime={article.publishedAt}>
          {new Date(article.publishedAt).toLocaleDateString("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        {article.updatedAt && article.updatedAt !== article.publishedAt ? (
          <>
            {" "}
            · Actualizado:{" "}
            <time dateTime={article.updatedAt}>
              {new Date(article.updatedAt).toLocaleDateString("es-CO", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </>
        ) : null}{" "}
        · {article.readingMinutes} min de lectura
      </p>
      <ArticleShare
        title={article.title}
        description={article.description}
        url={articleUrl}
        imageUrl={articleImageUrl}
      />
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

      {article.faq && article.faq.length > 0 ? (
        <section className="article-faq" aria-labelledby="faq-heading">
          <h2 id="faq-heading">Preguntas frecuentes</h2>
          {article.faq.map((item) => (
            <div key={item.question} className="article-faq-item">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </section>
      ) : null}

      {article.sources && article.sources.length > 0 ? (
        <section className="article-sources" aria-labelledby="sources-heading">
          <h2 id="sources-heading">Fuentes oficiales</h2>
          <p className="article-sources-lead">
            Consulta siempre el texto oficial. Nominapp resume para empleados;
            no sustituye asesoría legal.
          </p>
          <ol>
            {article.sources.map((source) => (
              <li key={source.id}>
                <a href={source.url} rel="noopener noreferrer">
                  {source.title}
                </a>
                <span className="article-source-publisher">
                  {" "}
                  — {source.publisher}
                </span>
                {source.note ? (
                  <p className="article-source-note">{source.note}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="article-related" aria-labelledby="related-heading">
          <h2 id="related-heading">Sigue leyendo</h2>
          <ul className="article-related-list">
            {related.map((item) => (
              <li key={item.slug}>
                <Link href={`/guia/${item.slug}`}>{item.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="article-cta">
        <h2>Lleva el control con {site.name}</h2>
        <p>
          Descarga la app gratis para Android, registra tus jornadas y consulta
          tu liquidación estimada según la normativa colombiana {site.year}.
        </p>
        <div className="hero-actions">
          <ApkDownloadButton>Descargar Nominapp</ApkDownloadButton>
          <Link href="/acerca" className="btn btn-ghost">
            Qué es Nominapp
          </Link>
        </div>
      </section>
    </article>
  );
}
