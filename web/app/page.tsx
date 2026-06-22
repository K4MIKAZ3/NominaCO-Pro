import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContactDialog } from "@/components/ContactDialog";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import {
  heroStats,
  processSteps,
  projectHighlights,
  services,
  site,
  techHighlights,
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
            <div className="hero-copy">
              <span className="hero-badge">Vibe Coding · AI products studio</span>
              <h1>
                Creamos proyectos de IA que convierten ideas en productos reales.
              </h1>
              <p className="hero-lead">
                {site.name} diseña y desarrolla agentes, automatizaciones,
                dashboards y webs inteligentes para que tu negocio venda,
                responda y opere mejor.
              </p>
              <div className="hero-actions">
                <ContactDialog
                  triggerLabel="Cotizar mi proyecto"
                  triggerClassName="btn btn-primary"
                  defaultSubject="Cotización de proyecto IA"
                />
                <Link href="/#proyectos" className="btn btn-ghost">
                  Ver proyectos
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
            </div>

            <div className="hero-visual" aria-label="Identidad visual de Vibe Coding Company">
              <div className="hero-logo-card">
                <Image
                  src="/icon.svg"
                  alt={`${site.name} logo`}
                  width={420}
                  height={420}
                  sizes="(max-width: 768px) 82vw, 420px"
                  priority
                  unoptimized
                />
              </div>
              <div className="floating-card floating-card-top">
                <span>AI Agent</span>
                <strong>Lead scoring</strong>
              </div>
              <div className="floating-card floating-card-bottom">
                <span>Automation</span>
                <strong>Reportes 24/7</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="tech-strip section">
          <div className="container">
            <div className="tech-pills">
              {techHighlights.map((item) => (
                <span key={item} className="tech-pill">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="proyectos">
          <div className="container">
            <div className="section-title">
              <span className="eyebrow">Qué construimos</span>
              <h2>Proyectos de IA para lanzar, vender y automatizar</h2>
              <p>
                Presenta tus soluciones o cuéntanos qué necesitas: convertimos
                oportunidades de IA en productos claros y usables.
              </p>
            </div>
            <div className="projects-grid">
              {projectHighlights.map((project) => (
                <article key={project.title} className="project-card">
                  <span className="project-tag">{project.tag}</span>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-muted" id="servicios">
          <div className="container">
            <div className="section-title">
              <span className="eyebrow">Servicios</span>
              <h2>Desde la idea hasta el despliegue en Vercel</h2>
              <p>
                Creamos soluciones modernas con foco en experiencia, velocidad
                y valor de negocio.
              </p>
            </div>
            <div className="services-grid">
              {services.map((item) => (
                <article key={item.title} className="service-card">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="proceso">
          <div className="container">
            <div className="section-title">
              <span className="eyebrow">Proceso</span>
              <h2>Una forma simple de crear sin perder el foco</h2>
              <p>
                Trabajamos con entregables concretos para que puedas validar,
                medir y seguir iterando.
              </p>
            </div>
            <ol className="steps-grid">
              {processSteps.map((step) => (
                <li key={step.step} className="step-card">
                  <span className="step-number">{step.step}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <FaqSection />

        <section className="section section-muted" id="contacto">
          <div className="container">
            <div className="contact-panel">
              <div>
                <span className="eyebrow">Hablemos</span>
                <h2>¿Tienes una idea o un proceso que quieres automatizar?</h2>
                <p>
                  Cuéntanos el objetivo, el flujo actual y lo que esperas lograr.
                  Te ayudamos a definir una solución de IA viable para tu negocio.
                </p>
              </div>
              <ContactDialog
                triggerLabel="Solicitar cotización"
                triggerClassName="btn btn-primary"
                defaultSubject="Solicitud de cotización"
              />
            </div>
          </div>
        </section>

        <section className="cta-band">
          <div className="container">
            <h2>{site.tagline}</h2>
            <p>
              Dale una nueva forma a tu desarrollo: más rápida, automatizada y
              preparada para crecer en la nube.
            </p>
            <div className="hero-actions cta-actions">
              <ContactDialog
                triggerLabel="Cotizar ahora"
                triggerClassName="btn btn-primary"
                defaultSubject="Cotización de proyecto IA"
              />
              <a href={`mailto:${site.contactEmail}`} className="btn btn-ghost">
                Escribir por correo
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
