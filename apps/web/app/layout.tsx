import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nominapp Empresas",
  description: "Nómina multi-empresa para Colombia",
  metadataBase: new URL("https://empresas.nominapp.xyz"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
