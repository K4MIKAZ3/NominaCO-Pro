import type { Metadata } from "next";
import type { BlogArticle } from "@/lib/blog/articles";
import {
  estimateArticleWordCount,
  getArticleModifiedAt,
} from "@/lib/blog/articles";
import { absoluteUrl, faqItems, site } from "@/lib/site";

export const seoKeywords = [
  "nómina personal Colombia",
  "calcular liquidación nómina",
  "app nómina Android Colombia",
  "liquidación quincenal",
  "devengados y descuentos",
  "recargo nocturno Colombia",
  "auxilio de transporte 2026",
  "control de gastos personales",
  "prestaciones sociales estimadas",
  "calendario jornadas laborales",
] as const;

export const homeMetadata: Metadata = {
  title: "Calculadora de nómina personal Colombia 2026",
  description:
    "Descarga Nominapp gratis para Android. Registra jornadas, calcula devengados, descuentos legales, prestaciones y gastos personales según la normativa laboral colombiana.",
  keywords: [...seoKeywords],
  alternates: {
    canonical: site.url,
    types: {
      "application/rss+xml": absoluteUrl("/feed.xml"),
      "text/plain": absoluteUrl("/llms.txt"),
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: "es_CO",
    type: "website",
    images: [
      {
        url: "/images/og-default.png",
        width: 1200,
        height: 630,
        alt: "Liquidación de nómina personal en Nominapp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Nómina personal Colombia`,
    description: site.description,
    images: ["/images/og-default.png"],
  },
};

export const privatePageRobots: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: absoluteUrl("/icon.png"),
    email: site.contactEmail,
    description: site.description,
    foundingDate: "2026",
    sameAs: [site.githubUrl],
    areaServed: {
      "@type": "Country",
      name: site.country,
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: site.contactEmail,
      contactType: "customer support",
      availableLanguage: ["es-CO", "es"],
    },
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: "es-CO",
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
  };
}

export function buildSoftwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: site.name,
    applicationCategory: "FinanceApplication",
    applicationSubCategory: "Payroll estimation",
    operatingSystem: "Android 8.0+",
    description: site.description,
    url: site.url,
    downloadUrl: site.apkDownloadUrl,
    screenshot: absoluteUrl("/images/hero-phone.webp"),
    inLanguage: "es-CO",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "COP",
    },
    featureList: site.featuresList,
    author: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
  };
}

export function buildFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path === "/" ? site.url : absoluteUrl(item.path),
    })),
  };
}

export function buildArticleJsonLd(article: BlogArticle) {
  const url = absoluteUrl(`/guia/${article.slug}`);
  const modified = getArticleModifiedAt(article);
  const image = article.heroImage
    ? absoluteUrl(article.heroImage)
    : absoluteUrl("/images/og-default.png");

  const citation = (article.sources ?? []).map((source) => ({
    "@type": "CreativeWork",
    name: source.title,
    url: source.url,
    publisher: source.publisher,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    keywords: article.keywords.join(", "),
    datePublished: article.publishedAt,
    dateModified: modified,
    inLanguage: "es-CO",
    wordCount: estimateArticleWordCount(article),
    timeRequired: `PT${article.readingMinutes}M`,
    image: [image],
    author: {
      "@type": "Organization",
      name: site.contentAuthor,
      url: site.url,
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/icon.png"),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    isAccessibleForFree: true,
    ...(citation.length > 0 ? { citation } : {}),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".article-faq-item h3", ".article-faq-item p"],
    },
  };
}

export function buildArticleFaqJsonLd(article: BlogArticle) {
  if (!article.faq?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildGuiaIndexJsonLd(articles: BlogArticle[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Guía de nómina personal Colombia",
    description:
      "Artículos sobre liquidación quincenal, recargos, auxilio de transporte, reforma laboral y derechos de empleados en Colombia.",
    url: absoluteUrl("/guia"),
    inLanguage: "es-CO",
    isPartOf: {
      "@type": "WebSite",
      name: site.name,
      url: site.url,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: articles.length,
      itemListElement: articles.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/guia/${article.slug}`),
        name: article.title,
      })),
    },
  };
}

export function buildHomeJsonLd() {
  return [
    buildOrganizationJsonLd(),
    buildWebSiteJsonLd(),
    buildSoftwareApplicationJsonLd(),
    buildFaqJsonLd(),
  ];
}
