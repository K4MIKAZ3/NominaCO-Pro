import Link from "next/link";

export default function MarketingHomePage() {
  return (
    <div className="landing">
      <header className="landing-nav container anim-fade">
        <div className="brand-lockup">
          <span className="brand">Nominapp</span>
          <span className="product">Empresas</span>
        </div>
        <div className="nav-actions">
          <Link href="/login" className="btn btn-ghost">
            Entrar
          </Link>
          <Link href="/dashboard" className="btn btn-primary">
            Ver panel
          </Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero-plane" aria-hidden="true" />
        <div className="hero-copy container anim-rise">
          <p className="eyebrow">Nómina Colombia · multi-empresa</p>
          <h1 className="brand hero-brand">Nominapp Empresas</h1>
          <p className="hero-lead">
            Liquidación laboral con parámetros legales versionados, aislamiento por empresa
            y un solo motor TypeScript para web y app.
          </p>
          <div className="hero-cta">
            <Link href="/login" className="btn btn-primary">
              Empezar
            </Link>
            <Link href="/legal" className="btn btn-ghost">
              Ver marco legal
            </Link>
          </div>
        </div>
      </section>

      <section className="below container anim-rise delay-2">
        <h2>Un panel. Varias empresas.</h2>
        <p className="muted">
          Empleados, períodos de nómina y parámetros legales (SMMLV, festivos, jornada) viven
          en un proyecto Supabase nuevo — separado de Nominapp personal.
        </p>
      </section>

      <style>{`
        .landing {
          min-height: 100vh;
          overflow: hidden;
        }
        .landing-nav {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.25rem 0;
        }
        .brand-lockup {
          display: flex;
          align-items: baseline;
          gap: 0.55rem;
        }
        .brand-lockup .brand {
          font-size: 1.55rem;
          color: var(--forest-900);
        }
        .brand-lockup .product {
          font-size: 0.78rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--cyan-500);
          font-weight: 700;
        }
        .nav-actions {
          display: flex;
          gap: 0.6rem;
        }
        .hero {
          position: relative;
          min-height: calc(100vh - 5.5rem);
          display: grid;
          align-items: end;
          padding: 0 0 4.5rem;
          overflow: hidden;
        }
        .hero-plane {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(105deg, rgba(247, 243, 235, 0.94) 0%, rgba(247, 243, 235, 0.72) 38%, rgba(18, 53, 40, 0.55) 100%),
            linear-gradient(160deg, #123528 0%, #1aa6a0 55%, #2f7a5c 100%);
          animation: plane-drift 10s ease-in-out infinite alternate;
        }
        .hero-plane::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(700px 380px at 78% 35%, rgba(46, 196, 189, 0.45), transparent 70%),
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f7f3eb' fill-opacity='0.07'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          animation: glow-pulse 5s ease-in-out infinite;
        }
        .hero-copy {
          position: relative;
          z-index: 1;
          max-width: 40rem;
          margin-left: auto;
          margin-right: auto;
          width: min(1120px, calc(100% - 2rem));
        }
        .hero-brand {
          margin: 0.4rem 0 0.85rem;
          font-size: clamp(2.8rem, 7vw, 4.8rem);
          line-height: 0.98;
          color: var(--forest-950);
        }
        .hero-lead {
          margin: 0;
          max-width: 34rem;
          font-size: 1.12rem;
          line-height: 1.55;
          color: var(--ink-muted);
        }
        .hero-cta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-top: 1.6rem;
        }
        .hero-cta .btn-ghost {
          background: rgba(247, 243, 235, 0.55);
        }
        .below {
          padding: 3rem 0 4rem;
          max-width: 40rem;
        }
        .below h2 {
          margin: 0 0 0.6rem;
          font-size: 1.7rem;
        }
        @keyframes plane-drift {
          from { transform: scale(1); }
          to { transform: scale(1.03); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }
        @media (max-width: 900px) {
          .hero {
            min-height: 70vh;
            align-items: center;
            padding: 2rem 0 3rem;
          }
        }
      `}</style>
    </div>
  );
}
