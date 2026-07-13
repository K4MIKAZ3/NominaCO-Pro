import type { Metadata } from "next";
import Link from "next/link";
import { ApkDownloadButton } from "@/components/ApkDownloadButton";
import { JsonLd } from "@/components/JsonLd";
import {
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildSoftwareApplicationJsonLd,
  buildWebSiteJsonLd,
} from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Qué es Nominapp — app de nómina personal Colombia",
  description:
    "Nominapp es una app gratuita para que empleados en Colombia estimen su liquidación: jornadas, recargos, salud, pensión, auxilio de transporte y PDF. Uso personal, no sustituye el desprendible oficial.",
  keywords: [
    "qué es Nominapp",
    "app nómina personal Colombia",
    "calculadora liquidación empleado",
    "Nominapp Android",
  ],
  alternates: { canonical: absoluteUrl("/acerca") },
  openGraph: {
    title: `Qué es ${site.name}`,
    description:
      "App de nómina personal para trabajadores en Colombia. Estimaciones según normativa 2026.",
    url: absoluteUrl("/acerca"),
    siteName: site.name,
    locale: "es_CO",
    type: "website",
    images: [
      {
        url: "/images/og-default.png",
        width: 1200,
        height: 630,
        alt: "Nominapp — nómina personal Colombia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Qué es ${site.name}`,
    description:
      "Estimá tu liquidación personal en Colombia: jornadas, recargos y descuentos legales.",
    images: ["/images/og-default.png"],
  },
};

function buildAboutJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `Qué es ${site.name}`,
    url: absoluteUrl("/acerca"),
    description: site.description,
    inLanguage: "es-CO",
    isPartOf: {
      "@type": "WebSite",
      name: site.name,
      url: site.url,
    },
    mainEntity: buildSoftwareApplicationJsonLd(),
  };
}

export default function AcercaPage() {
  return (
    <main className="page-main">
      <JsonLd
        data={[
          buildAboutJsonLd(),
          buildOrganizationJsonLd(),
          buildWebSiteJsonLd(),
          buildBreadcrumbJsonLd([
            { name: "Inicio", path: "/" },
            { name: "Qué es Nominapp", path: "/acerca" },
          ]),
        ]}
      />
      <article className="container prose article-prose">
        <nav className="article-breadcrumb" aria-label="Ruta">
          <Link href="/">Inicio</Link>
          <span aria-hidden="true"> / </span>
          <span>Qué es Nominapp</span>
        </nav>
        <h1>Qué es Nominapp</h1>
        <p className="updated">
          Actualizado:{" "}
          <time dateTime="2026-07-13">13 de julio de 2026</time> ·{" "}
          {site.contentAuthor}
        </p>

        <p>
          <strong>{site.name}</strong> es una aplicación gratuita para{" "}
          <strong>trabajadores en Colombia</strong> que quieren entender y
          estimar su nómina personal: días trabajados, recargos, descuentos de
          salud y pensión, auxilio de transporte, gastos y exportación a PDF.
        </p>

        <h2>Qué problema resuelve</h2>
        <p>
          Muchas personas reciben el desprendible pero no tienen una forma clara
          de contrastar horas nocturnas, domingos, festivos o el neto estimado
          del período. Nominapp te deja registrar jornadas día a día y ver una{" "}
          <strong>estimación orientativa</strong> alineada con parámetros
          laborales de {site.year}.
        </p>

        <h2>Hechos clave</h2>
        <ul>
          <li>
            <strong>País:</strong> Colombia (español es-CO).
          </li>
          <li>
            <strong>Público:</strong> empleados / personas naturales. No es
            software de nómina empresarial ni de RR.HH.
          </li>
          <li>
            <strong>Plataformas:</strong> Android 8+ (APK oficial) y web con
            cuenta en <Link href="/inicio">/inicio</Link> (útil en iPhone).
          </li>
          <li>
            <strong>Precio:</strong> gratis, sin suscripción obligatoria.
          </li>
          <li>
            <strong>Cuenta:</strong> opcional; puedes usar la app en modo local.
          </li>
          <li>
            <strong>No sustituye</strong> el desprendible oficial del empleador ni
            asesoría contable o legal.
          </li>
        </ul>

        <h2>Parámetros legales de referencia 2026</h2>
        <p>
          La app incorpora referencias como SMMLV{" "}
          <strong>$1.750.905</strong>, auxilio de transporte{" "}
          <strong>$249.095</strong> (tope 2 SMMLV), recargo nocturno tipico del{" "}
          <strong>35 %</strong> en jornada nocturna (desde las 7:00 p. m.),
          aportes del trabajador a salud y pensión (<strong>4 % + 4 %</strong>),
          y el cronograma de jornada semanal hacia <strong>42 horas</strong>{" "}
          (15 de julio de 2026), conforme a decretos y leyes oficiales citadas
          en nuestra{" "}
          <Link href="/guia">guía de nómina</Link>.
        </p>

        <h2>Dónde leer guías con fuentes</h2>
        <ul>
          <li>
            <Link href="/guia/calcular-liquidacion-quincenal-colombia">
              Cómo calcular tu liquidación quincenal
            </Link>
          </li>
          <li>
            <Link href="/guia/jornada-42-horas-colombia-2026">
              Jornada de 42 horas en 2026
            </Link>
          </li>
          <li>
            <Link href="/guia/auxilio-transporte-salario-minimo-2026">
              Auxilio de transporte y SMMLV 2026
            </Link>
          </li>
          <li>
            <Link href="/guia/recargos-dominicales-nocturnos-colombia-2026">
              Recargos dominicales y nocturnos
            </Link>
          </li>
        </ul>

        <h2>Contacto y transparencia</h2>
        <ul>
          <li>
            Sitio oficial:{" "}
            <a href={site.url}>{site.url.replace("https://", "")}</a>
          </li>
          <li>
            Correo:{" "}
            <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
          </li>
          <li>
            Código abierto del proyecto:{" "}
            <a href={site.githubUrl} rel="noopener noreferrer">
              GitHub
            </a>
          </li>
          <li>
            <Link href="/terminos">Términos y privacidad</Link>
          </li>
          <li>
            Brief para sistemas de IA:{" "}
            <a href="/llms.txt">nominapp.xyz/llms.txt</a>
          </li>
        </ul>

        <aside className="article-callout">
          <p>
            Nominapp explica y estima. Para decisiones legales o reclamaciones,
            consulta el desprendible de tu empleador, el{" "}
            <a
              href="https://www.mintrabajo.gov.co/"
              rel="noopener noreferrer"
            >
              Ministerio del Trabajo
            </a>{" "}
            o un profesional.
          </p>
        </aside>

        <section className="article-cta">
          <h2>Empieza gratis</h2>
          <p>
            Descarga el APK firmado solo desde este sitio o el release oficial
            en GitHub.
          </p>
          <div className="hero-actions">
            <ApkDownloadButton>Descargar Nominapp</ApkDownloadButton>
            <Link href="/guia" className="btn btn-ghost">
              Leer la guía
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
