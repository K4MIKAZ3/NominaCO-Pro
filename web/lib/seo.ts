import type { Metadata } from "next";
import { absoluteUrl, faqItems, site } from "@/lib/site";

export const seoKeywords = [
  "vibe coding",
  "proyectos de inteligencia artificial",
  "desarrollo con IA",
  "agentes de IA",
  "chatbots para empresas",
  "automatización de procesos",
  "landing pages con IA",
  "MVP con inteligencia artificial",
  "desarrollo web en Vercel",
  "consultoría IA Colombia",
] as const;

export const homeMetadata: Metadata = {
  title: "Proyectos de IA, automatización y desarrollo web",
  description: site.description,
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
        url: "/images/vibe-og.svg",
        width: 1200,
        height: 630,
        alt: `${site.name} — proyectos de IA`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Desarrollo con IA`,
    description: site.description,
    images: ["/images/vibe-og.svg"],
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
    logo: absoluteUrl("/icon.svg"),
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

export function buildProfessionalServiceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name,
    description: site.description,
    url: site.url,
    areaServed: site.country,
    serviceType: site.featuresList,
    slogan: site.tagline,
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
    buildProfessionalServiceJsonLd(),
    buildFaqJsonLd(),
  ];
}
