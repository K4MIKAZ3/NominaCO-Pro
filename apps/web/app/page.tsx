export default function HomePage() {
  return (
    <main style={{ padding: "3rem 1.5rem", maxWidth: 720, margin: "0 auto" }}>
      <p style={{ letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.6 }}>
        Nominapp Empresas
      </p>
      <h1 style={{ fontSize: "2.4rem", lineHeight: 1.15 }}>
        Nómina multi-empresa para Colombia
      </h1>
      <p style={{ fontSize: "1.1rem", opacity: 0.8 }}>
        Panel empleador en <strong>empresas.nominapp.xyz</strong>. Motor único TypeScript,
        parámetros legales versionados y aislamiento por empresa.
      </p>
    </main>
  );
}
