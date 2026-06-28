import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllArticles } from "@/lib/blog/articles";
import { absoluteUrl, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Guía de nómina personal Colombia",
  description:
    "Artículos sobre liquidación quincenal, recargo nocturno, auxilio de transporte, reforma laboral 2026, jornada de 42 horas, contratos y derechos de empleados en Colombia.",
  alternates: {
    canonical: absoluteUrl("/guia"),
  },
  openGraph: {
    title: `Guía de nómina · ${site.name}`,
    description:
      "Aprende a calcular tu liquidación, entender la reforma laboral y tus derechos como empleado en Colombia.",
    url: absoluteUrl("/guia"),
  },
};

export default function GuiaIndexPage() {
  const articles = getAllArticles();

  return (
    <main className="page-main">
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
                    alt=""
                    width={400}
                    height={225}
                    className="blog-card-img"
                  />
                </div>
              ) : null}
              <span className="blog-card-meta">
                {article.readingMinutes} min · {site.year}
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
