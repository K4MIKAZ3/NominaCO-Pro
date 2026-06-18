import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { site } from "@/lib/site";
import { seoKeywords } from "@/lib/seo";
import "./globals.css";

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Nómina personal Colombia 2026`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [...seoKeywords],
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  category: "finance",
  alternates: {
    canonical: site.url,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: "es_CO",
    type: "website",
    images: [{ url: "/icon.png", width: 1024, height: 1024, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Nómina personal Colombia`,
    description: site.description,
    images: ["/icon.png"],
  },
  ...(googleSiteVerification
    ? { verification: { google: googleSiteVerification } }
    : {}),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CO">
      <body>
        <Header />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
