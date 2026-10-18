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

      <section className="hero container">
        <div className="hero-copy anim-rise">
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
        <div className="hero-visual anim-rise delay-2" aria-hidden="true">
          <div className="hero-plane" />
          <div className="hero-glow" />
        </div>
      </section>

      <section className="below container anim-rise delay-3">
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
          min-height: calc(100vh - 5.5rem);
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 2rem;
          align-items: center;
          padding-bottom: 2rem;
        }
        .hero-brand {
          margin: 0.4rem 0 0.85rem;
          font-size: clamp(2.6rem, 6vw, 4.4rem);
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
        .hero-visual {
          position: relative;
          min-height: 420px;
          border-radius: 0;
        }
        .hero-plane {
          position: absolute;
          inset: 8% -8% -12% 8%;
          background:
            linear-gradient(135deg, rgba(18, 53, 40, 0.95), rgba(26, 166, 160, 0.55)),
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f7f3eb' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          box-shadow: var(--shadow-soft);
          animation: plane-drift 8s ease-in-out infinite alternate;
        }
        .hero-glow {
          position: absolute;
          width: 55%;
          height: 40%;
          right: 4%;
          top: 18%;
          background: radial-gradient(circle, rgba(46, 196, 189, 0.45), transparent 70%);
          filter: blur(8px);
          animation: glow-pulse 4.5s ease-in-out infinite;
        }
        .below {
          padding: 0 0 4rem;
          max-width: 40rem;
        }
        .below h2 {
          margin: 0 0 0.6rem;
          font-size: 1.7rem;
        }
        @keyframes plane-drift {
          from { transform: translateY(0) scale(1); }
          to { transform: translateY(-10px) scale(1.015); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        @media (max-width: 900px) {
          .hero {
            grid-template-columns: 1fr;
            min-height: auto;
            padding-top: 1rem;
          }
          .hero-visual {
            min-height: 240px;
            order: -1;
          }
          .hero-plane {
            inset: 0;
          }
        }
      `}</style>
    </div>
  );
}
