import Link from "next/link";

export default function MarketingHomePage() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="brand" style={{ color: "var(--ink)", padding: 0 }}>
          <div className="brand-mark" aria-hidden />
          nominapp
        </div>
        <div className="actions">
          <Link href="/login" className="btn">
            Entrar
          </Link>
          <Link href="/login" className="btn btn-primary">
            Empezar
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="label-caps">Nómina para empresas en Colombia</div>
        <h1>Liquidación clara, por empresa y por período.</h1>
        <p>
          Administra empleados, cierra quincenas y entrega colillas sin fricción. Un panel
          para el empleador; una vista simple para el trabajador.
        </p>
        <div className="landing-cta">
          <Link href="/login" className="btn btn-primary">
            Abrir panel
          </Link>
          <Link href="/colilla" className="btn">
            Ver colilla
          </Link>
        </div>
      </section>
    </div>
  );
}
