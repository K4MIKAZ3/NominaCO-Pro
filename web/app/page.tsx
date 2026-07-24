import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ApkDownloadButton } from "@/components/ApkDownloadButton";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { getArticle } from "@/lib/blog/articles";
import {
  audiencePoints,
  features,
  featuredGuiaSlugs,
  heroStats,
  howItWorks,
  legalHighlights,
  payrollExample,
  primaryAudience,
  productShots,
  site,
  usageModes,
} from "@/lib/site";
import { buildHomeJsonLd, homeMetadata } from "@/lib/seo";

export const metadata: Metadata = homeMetadata;

export default function HomePage() {
  const featuredArticles = featuredGuiaSlugs
    .map((slug) => getArticle(slug))
    .filter((article): article is NonNullable<typeof article> => Boolean(article));

  return (
    <>
      <JsonLd data={buildHomeJsonLd()} />
      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <span className="hero-badge">Para empleados · Colombia 2026</span>
              <h1>Tu nómina personal, clara y al día</h1>
              <p className="hero-lead">
                {site.name} es la app Android para{" "}
                <strong>empleados</strong> que quieren registrar jornadas,
                calcular devengados y descuentos legales, y ver su neto
                estimado. Gratis. Uso personal — no es software de empresas.
              </p>
              <div className="hero-actions">
                <ApkDownloadButton className="btn btn-primary btn-cta-primary">
                  Descargar APK para Android
                </ApkDownloadButton>
                <Link href="/login" className="btn btn-ghost btn-cta-secondary">
                  Acceder a mi cuenta
                </Link>
              </div>
              <ul className="hero-stats" aria-label="Señales de confianza">
                {heroStats.map((stat) => (
                  <li key={stat.label}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </li>
                ))}
              </ul>
              <p className="hero-note">
                Uso personal · No sustituye asesoría contable ni legal oficial ·
                Descarga solo desde {site.url} ·{" "}
                <Link href="/acerca">Qué es Nominapp</Link>
              </p>
            </div>
            <div className="hero-image-wrap">
              <Image
                src="/images/hero-phone.webp"
                alt="App Nominapp: liquidación real con total a pagar $2.106.245"
                width={390}
                height={844}
                sizes="(max-width: 768px) min(100vw, 220px), 280px"
                className="hero-image"
                priority
                unoptimized
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

        <section className="section" id="ejemplo" aria-labelledby="ejemplo-title">
          <div className="container">
            <div className="section-title">
              <h2 id="ejemplo-title">{payrollExample.title}</h2>
              <p>{payrollExample.subtitle}</p>
            </div>
            <div className="example-panel">
              <dl className="example-rows">
                {payrollExample.rows.map((row) => (
                  <div key={row.label} className={`example-row example-row--${row.tone}`}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
                <div className="example-row example-row--net">
                  <dt>{payrollExample.netLabel}</dt>
                  <dd>{payrollExample.netValue}</dd>
                </div>
              </dl>
              <ul className="example-details">
                {payrollExample.details.map((item) => (
                  <li key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </li>
                ))}
              </ul>
              <p className="example-note">{payrollExample.note}</p>
              <div className="hero-actions example-actions">
                <ApkDownloadButton>Descargar y calcular la tuya</ApkDownloadButton>
                <Link href={payrollExample.guideHref} className="btn btn-ghost">
                  {payrollExample.guideLabel}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-muted" id="capturas" aria-labelledby="capturas-title">
          <div className="container">
            <div className="section-title">
              <h2 id="capturas-title">Así se ve en la app</h2>
              <p>
                Capturas de una liquidación real de prueba: calendario, nómina y
                gastos del mismo mes.
              </p>
            </div>
            <div className="shots-grid">
              {productShots.map((shot) => (
                <figure key={shot.src} className="shot-card">
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    width={390}
                    height={844}
                    sizes="(max-width: 768px) min(100vw, 220px), 240px"
                    loading="lazy"
                    decoding="async"
                    unoptimized
                  />
                  <figcaption>{shot.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="como-funciona">
          <div className="container">
            <div className="section-title">
              <h2>Cómo funciona</h2>
              <p>
                En tres pasos pasas de la descarga a tener tu liquidación
                estimada bajo control.
              </p>
            </div>
            <ol className="steps-grid">
              {howItWorks.map((step) => (
                <li key={step.step} className="step-card">
                  <span className="step-number">{step.step}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section section-muted" id="modo-local-nube" aria-labelledby="modos-title">
          <div className="container">
            <div className="section-title">
              <h2 id="modos-title">Modo local o nube</h2>
              <p>
                No necesitas cuenta para empezar. El respaldo en la nube es
                opcional.
              </p>
            </div>
            <div className="modes-grid">
              {usageModes.map((mode) => (
                <article key={mode.title} className="mode-card">
                  <h3>{mode.title}</h3>
                  <p>{mode.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="para-quien">
          <div className="container">
            <div className="section-title">
              <h2>{primaryAudience.title}</h2>
              <p>{primaryAudience.description}</p>
            </div>
            <div className="audience-grid">
              {audiencePoints.map((item) => (
                <article key={item.title} className="audience-card">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-muted" id="funciones">
          <div className="container">
            <div className="section-title">
              <h2>Todo lo que necesitas en una sola app</h2>
              <p>
                Diseñada para empleados que quieren llevar el control de su
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
                      width={390}
                      height={844}
                      sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 280px"
                      loading="lazy"
                      decoding="async"
                      unoptimized
                    />
                  )}
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="guia">
          <div className="container">
            <div className="section-title">
              <h2>Guía de nómina en Colombia</h2>
              <p>
                Artículos específicos con fuentes oficiales: liquidación,
                descuentos, auxilio y recargos.
              </p>
            </div>
            <ul className="home-guia-list">
              {featuredArticles.map((article) => (
                <li key={article.slug}>
                  <Link href={`/guia/${article.slug}`} className="home-guia-link">
                    <span className="home-guia-title">{article.title}</span>
                    <span className="home-guia-meta">
                      {article.readingMinutes} min · leer
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="hero-actions cta-actions">
              <Link href="/guia" className="btn btn-primary">
                Ver todos los artículos
              </Link>
            </div>
          </div>
        </section>

        <FaqSection />

        <section className="cta-band">
          <div className="container">
            <h2>Empieza hoy mismo</h2>
            <p>
              Descarga la app, configura tu perfil de empleado y registra tu
              primera jornada en minutos. También puedes crear cuenta para
              respaldo en la nube.
            </p>
            <div className="hero-actions cta-actions">
              <ApkDownloadButton className="btn btn-primary btn-cta-primary">
                Descargar Nominapp
              </ApkDownloadButton>
              <Link href="/#preguntas" className="btn btn-ghost btn-cta-secondary">
                Ver preguntas frecuentes
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
