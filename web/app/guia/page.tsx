import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { getAllArticles, getArticleModifiedAt } from "@/lib/blog/articles";
import { buildBreadcrumbJsonLd, buildGuiaIndexJsonLd } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Guía de nómina personal Colombia",
  description:
    "Artículos sobre liquidación quincenal, festivos remunerados, recargo nocturno, auxilio de transporte, reforma laboral 2026, jornada de 42 horas, contratos y derechos de empleados en Colombia.",
  alternates: {
    canonical: absoluteUrl("/guia"),
    types: {
      "application/rss+xml": absoluteUrl("/feed.xml"),
    },
  },
  openGraph: {
    title: `Guía de nómina · ${site.name}`,
    description:
      "Aprende a calcular tu liquidación, entender la reforma laboral y tus derechos como empleado en Colombia.",
    url: absoluteUrl("/guia"),
    siteName: site.name,
    locale: "es_CO",
    type: "website",
    images: [
      {
        url: "/images/og-default.png",
        width: 1200,
        height: 630,
        alt: "Guía de nómina personal Nominapp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Guía de nómina · ${site.name}`,
    description:
      "Liquidación, festivos remunerados, recargos, auxilio de transporte y reforma laboral 2026 explicados para empleados.",
    images: ["/images/og-default.png"],
  },
};

export default function GuiaIndexPage() {
  const articles = getAllArticles();

  return (
    <main className="page-main">
      <JsonLd
        data={[
          buildGuiaIndexJsonLd(articles),
          buildBreadcrumbJsonLd([
            { name: "Inicio", path: "/" },
            { name: "Guía", path: "/guia" },
          ]),
        ]}
      />
      <div className="container">
        <div className="section-title blog-index-header">
          <h1>Guía de nómina personal</h1>
          <p>
            Artículos claros sobre liquidación, recargos, reforma laboral y
            prestaciones en Colombia. Herramientas útiles si buscas entender tu
            pago antes de descargar {site.name}.
          </p>
        </div>
        <div className="blog-grid">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/guia/${article.slug}`}
              className="blog-card"
            >
              {article.heroImage ? (
                <div className="blog-card-thumbnail">
                  <Image
                    src={article.heroImage}
                    alt={`Portada: ${article.title}`}
                    width={400}
                    height={225}
                    className="blog-card-img"
                  />
                </div>
              ) : null}
              <span className="blog-card-meta">
                {article.readingMinutes} min ·{" "}
                {new Date(getArticleModifiedAt(article)).toLocaleDateString(
                  "es-CO",
                  { year: "numeric", month: "short", day: "numeric" },
                )}
              </span>
              <h2>{article.title}</h2>
              <p>{article.description}</p>
              <span className="blog-card-link">Leer artículo →</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
