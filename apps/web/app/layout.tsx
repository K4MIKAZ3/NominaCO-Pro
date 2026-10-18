import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "@/styles/globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-ui-loaded",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-brand-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nominapp Empresas",
    template: "%s · Nominapp Empresas",
  },
  description: "Nómina multi-empresa para Colombia. Panel empleador con motor legal versionado.",
  metadataBase: new URL("https://empresas.nominapp.xyz"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body
        style={
          {
            ["--font-ui" as string]: "var(--font-ui-loaded), 'Helvetica Neue', sans-serif",
            ["--font-brand" as string]: "var(--font-brand-loaded), Georgia, serif",
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
