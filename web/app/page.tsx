import Image from "next/image";
import Link from "next/link";
import { ApkDownloadButton } from "@/components/ApkDownloadButton";
import { features, legalHighlights, site } from "@/lib/site";

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="hero-badge">Colombia · Normativa 2026</span>
            <h1>Tu nómina personal, clara y al día</h1>
            <p className="hero-lead">
              {site.name} te ayuda a registrar jornadas, calcular devengados y
              descuentos legales, estimar prestaciones y exportar PDFs. Todo desde
              tu Android, con respaldo opcional en la nube.
            </p>
            <div className="hero-actions">
              <ApkDownloadButton>Descargar APK para Android</ApkDownloadButton>
              <Link href="/login" className="btn btn-ghost">
                Acceder a mi cuenta
              </Link>
            </div>
            <p className="hero-note">
              Uso personal · No sustituye asesoría contable ni legal oficial ·
              Requiere Android 8+
            </p>
          </div>
          <div className="hero-image-wrap">
            <Image
              src="/images/hero-phone.webp"
              alt="Vista de liquidación mensual en Nominapp"
              width={480}
              height={480}
              sizes="(max-width: 768px) min(100vw, 360px), 480px"
              quality={85}
              className="hero-image"
              priority
            />
          </div>
        </div>
      </section>

      <section className="legal-strip section">
        <div className="container">
          <div className="legal-pills">
            {legalHighlights.map((item) => (
              <span key={item} className="legal-pill">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="funciones">
        <div className="container">
          <div className="section-title">
            <h2>Todo lo que necesitas en una sola app</h2>
            <p>
              Diseñada para trabajadores que quieren llevar el control de su
              liquidación sin depender de hojas de cálculo.
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                {"image" in feature && feature.image && (
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={400}
                    height={300}
                    sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 360px"
                    quality={85}
                    loading="lazy"
                  />
                )}
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <h2>Empieza hoy mismo</h2>
          <p>
            Descarga la app, configura tu perfil laboral y registra tu primera
            jornada en minutos.
          </p>
          <ApkDownloadButton>Descargar Nominapp</ApkDownloadButton>
        </div>
      </section>
    </main>
  );
}
