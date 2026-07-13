import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/ArticleBody";
import { JsonLd } from "@/components/JsonLd";
import {
  getAllSlugs,
  getArticle,
  getArticleModifiedAt,
} from "@/lib/blog/articles";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo";
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
  const modified = getArticleModifiedAt(article);
  const ogImages = article.heroImage
    ? [
        {
          url: absoluteUrl(article.heroImage),
          width: 960,
          height: 540,
          alt: article.title,
        },
      ]
    : [
        {
          url: absoluteUrl("/images/hero-phone.webp"),
          width: 480,
          height: 480,
          alt: article.title,
        },
      ];

  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    authors: [{ name: site.contentAuthor, url: site.url }],
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: modified,
      locale: "es_CO",
      siteName: site.name,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: ogImages.map((image) => image.url),
    },
  };
}

export default function GuiaArticlePage({ params }: PageProps) {
  const article = getArticle(params.slug);
  if (!article) notFound();

  const jsonLd = [
    buildArticleJsonLd(article),
    buildBreadcrumbJsonLd([
      { name: "Inicio", path: "/" },
      { name: "Guía", path: "/guia" },
      { name: article.title, path: `/guia/${article.slug}` },
    ]),
  ];

  return (
    <main className="page-main">
      <JsonLd data={jsonLd} />
      <ArticleBody article={article} />
    </main>
  );
}
