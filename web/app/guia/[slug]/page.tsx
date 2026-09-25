import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/ArticleBody";
import { JsonLd } from "@/components/JsonLd";
import {
  getAllSlugs,
  getArticle,
  getArticleModifiedAt,
  getArticleSeoTitle,
} from "@/lib/blog/articles";
import {
  buildArticleFaqJsonLd,
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
  const seoTitle = getArticleSeoTitle(article);
  const ogImages = [
    {
      url: absoluteUrl("/images/og-default.png"),
      width: 1200,
      height: 630,
      alt: seoTitle,
    },
    ...(article.heroImage
      ? [
          {
            url: absoluteUrl(article.heroImage),
            width: 960,
            height: 540,
            alt: seoTitle,
          },
        ]
      : []),
  ];

  return {
    title: seoTitle,
    description: article.description,
    keywords: article.keywords,
    authors: [{ name: site.contentAuthor, url: site.url }],
    alternates: { canonical: url },
    openGraph: {
      title: seoTitle,
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
      title: seoTitle,
      description: article.description,
      images: [absoluteUrl("/images/og-default.png")],
    },
  };
}

export default function GuiaArticlePage({ params }: PageProps) {
  const article = getArticle(params.slug);
  if (!article) notFound();

  const faqLd = buildArticleFaqJsonLd(article);
  const jsonLd = [
    buildArticleJsonLd(article),
    buildBreadcrumbJsonLd([
      { name: "Inicio", path: "/" },
      { name: "Guía", path: "/guia" },
      { name: article.title, path: `/guia/${article.slug}` },
    ]),
    ...(faqLd ? [faqLd] : []),
  ];

  return (
    <main className="page-main">
      <JsonLd data={jsonLd} />
      <ArticleBody article={article} />
    </main>
  );
}
