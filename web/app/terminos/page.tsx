import type { Metadata } from "next";
import { absoluteUrl, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terminos y privacidad",
  description:
    "Terminos de uso y politica de privacidad de Vibe Coding Company para solicitudes de cotizacion y contacto.",
  alternates: {
    canonical: absoluteUrl("/terminos"),
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TerminosPage() {
  return (
    <main className="page-main">
      <article className="container prose">
        <h1>Terminos y privacidad</h1>
        <p className="updated">
          Ultima actualizacion: 22 de junio de 2026 · {site.url}
        </p>

        <p>
          Estos terminos regulan el uso del sitio web de <strong>{site.name}</strong>,
          un estudio de desarrollo enfocado en proyectos de inteligencia artificial,
          automatizacion y productos web desplegables en la nube.
        </p>

        <h2>1. Uso del sitio</h2>
        <p>
          Puedes navegar el sitio, conocer nuestros servicios y contactarnos para
          solicitar una cotizacion. No debes usar el formulario para enviar spam,
          contenido ilegal, datos de terceros sin autorizacion o intentos de abuso
          tecnico contra la plataforma.
        </p>

        <h2>2. Solicitudes de cotizacion</h2>
        <p>
          La informacion enviada por el formulario se usa para entender tu
          necesidad, responder a tu correo y preparar una propuesta comercial si
          corresponde. Una solicitud no crea una relacion contractual hasta que
          exista una aceptacion expresa del alcance, precio y condiciones del
          proyecto.
        </p>

        <h2>3. Propiedad intelectual</h2>
        <p>
          La marca, textos, diseno visual y materiales publicados en este sitio son
          propiedad de {site.name} o se usan con autorizacion. Los entregables de
          cada proyecto se regularan por la propuesta o contrato acordado con el
          cliente.
        </p>

        <h2>4. Privacidad y datos personales</h2>
        <p>
          Al contactarnos podemos recibir tu nombre, correo, asunto y descripcion
          del proyecto. Usamos esos datos solo para responderte, hacer seguimiento
          comercial y mantener un registro interno de oportunidades. Puedes
          solicitar actualizacion o eliminacion escribiendo a
          <a href={`mailto:${site.contactEmail}`}> {site.contactEmail}</a>.
        </p>

        <h2>5. Servicios de terceros</h2>
        <p>
          El sitio puede usar proveedores como Vercel para hosting y Resend para
          envio de correos. Estos servicios procesan informacion tecnica necesaria
          para operar el sitio, como solicitudes HTTP, registros de entrega y
          metadatos basicos de seguridad.
        </p>

        <h2>6. Limitacion de responsabilidad</h2>
        <p>
          Procuramos mantener informacion clara y actualizada, pero el contenido
          del sitio es informativo. Las funcionalidades, tiempos de entrega, costos
          y resultados de un proyecto dependen del alcance acordado y de la
          disponibilidad de datos, accesos e integraciones necesarias.
        </p>

        <h2>7. Contacto</h2>
        <p>
          Para preguntas sobre estos terminos, privacidad o una cotizacion,
          escribenos a <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
        </p>
      </article>
    </main>
  );
}
