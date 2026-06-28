import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/ArticleBody";
import { JsonLd } from "@/components/JsonLd";
import { getAllSlugs, getArticle } from "@/lib/blog/articles";
import { absoluteUrl, site } from "@/lib/site";

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const article = getArticle(params.slug);
  if (!article) return {};

  const url = absoluteUrl(`/guia/${article.slug}`);
  const ogImages = article.heroImage
    ? [{ url: absoluteUrl(article.heroImage), width: 960, height: 540, alt: article.title }]
    : undefined;

  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      type: "article",
      publishedTime: article.publishedAt,
      locale: "es_CO",
      siteName: site.name,
      ...(ogImages ? { images: ogImages } : {}),
    },
  };
}

function buildArticleJsonLd(slug: string) {
  const article = getArticle(slug);
  if (!article) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    inLanguage: "es-CO",
    author: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/icon.png"),
      },
    },
    mainEntityOfPage: absoluteUrl(`/guia/${article.slug}`),
  };
}

export default function GuiaArticlePage({ params }: PageProps) {
  const article = getArticle(params.slug);
  if (!article) notFound();

  const jsonLd = buildArticleJsonLd(params.slug);

  return (
    <main className="page-main">
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <ArticleBody article={article} />
    </main>
  );
}
