import type { Metadata } from "next";
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
        url: "/images/hero-phone.webp",
        width: 480,
        height: 480,
        alt: "Liquidación de nómina personal en Nominapp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Nómina personal Colombia`,
    description: site.description,
    images: ["/images/hero-phone.webp"],
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
    areaServed: {
      "@type": "Country",
      name: site.country,
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
  };
}

export function buildSoftwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: site.name,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Android 8.0+",
    description: site.description,
    url: site.url,
    downloadUrl: site.apkDownloadUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "COP",
    },
    featureList: site.featuresList,
    author: {
      "@type": "Organization",
      name: site.name,
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

export function buildHomeJsonLd() {
  return [
    buildOrganizationJsonLd(),
    buildWebSiteJsonLd(),
    buildSoftwareApplicationJsonLd(),
    buildFaqJsonLd(),
  ];
}
