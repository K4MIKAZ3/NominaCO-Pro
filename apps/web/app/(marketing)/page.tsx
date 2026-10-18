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

      <section className="landing-hero-plane" aria-label="Nominapp Empresas">
        <div className="landing-hero-glow" aria-hidden />
        <div className="landing-hero-inner">
          <div className="landing-brand-hero anim-rise">
            <div className="brand-mark" aria-hidden />
            nominapp
          </div>
          <h1 className="anim-rise delay-1">Nómina clara para tu empresa</h1>
          <p className="anim-rise delay-2">
            Liquidación por período, colillas al instante y parámetros laborales de
            Colombia siempre al día.
          </p>
          <div className="landing-cta anim-rise delay-3">
            <Link href="/login" className="btn btn-accent">
              Abrir panel
            </Link>
            <Link href="/colilla" className="btn">
              Ver colilla
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
