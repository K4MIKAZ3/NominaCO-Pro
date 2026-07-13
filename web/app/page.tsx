import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ApkDownloadButton } from "@/components/ApkDownloadButton";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import {
  audiencePoints,
  features,
  heroStats,
  howItWorks,
  legalHighlights,
  site,
} from "@/lib/site";
import { buildHomeJsonLd, homeMetadata } from "@/lib/seo";

export const metadata: Metadata = homeMetadata;

export default function HomePage() {
  return (
    <>
      <JsonLd data={buildHomeJsonLd()} />
      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <span className="hero-badge">Colombia · Normativa 2026</span>
              <h1>Tu nómina personal, clara y al día</h1>
              <p className="hero-lead">
                {site.name} es la app Android para registrar jornadas, calcular
                devengados y descuentos legales, estimar prestaciones, controlar
                gastos y exportar PDFs. Gratis y pensada para trabajadores en
                Colombia.
              </p>
              <div className="hero-actions">
                <ApkDownloadButton>Descargar APK para Android</ApkDownloadButton>
                <Link href="/login" className="btn btn-ghost">
                  Acceder a mi cuenta
                </Link>
              </div>
              <ul className="hero-stats" aria-label="Ventajas principales">
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
                alt="App Nominapp mostrando liquidación de nómina personal en Colombia"
                width={480}
                height={480}
                sizes="(max-width: 768px) min(100vw, 360px), 480px"
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

        <section className="section section-muted" id="para-quien">
          <div className="container">
            <div className="section-title">
              <h2>¿Para quién es Nominapp?</h2>
              <p>
                Si buscas una calculadora de nómina personal en Colombia, esta
                app está hecha para ti.
              </p>
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
                      loading="lazy"
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

        <FaqSection />

        <section className="section section-muted" id="guia">
          <div className="container">
            <div className="section-title">
              <h2>Guía de nómina en Colombia</h2>
              <p>
                Aprende a calcular tu liquidación, recargos y prestaciones con
                artículos claros y actualizados.
              </p>
            </div>
            <div className="hero-actions cta-actions">
              <Link href="/guia" className="btn btn-primary">
                Ver todos los artículos
              </Link>
            </div>
          </div>
        </section>

        <section className="cta-band">
          <div className="container">
            <h2>Empieza hoy mismo</h2>
            <p>
              Descarga la app, configura tu perfil laboral y registra tu primera
              jornada en minutos. También puedes crear cuenta para respaldo en la
              nube.
            </p>
            <div className="hero-actions cta-actions">
              <ApkDownloadButton>Descargar Nominapp</ApkDownloadButton>
              <Link href="/#preguntas" className="btn btn-ghost">
                Ver preguntas frecuentes
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
