import type { Metadata } from "next";
import Link from "next/link";
import { site, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Política de privacidad de Nominapp (app Android y sitio web): cómo recopilamos, usamos, almacenamos y compartimos datos personales.",
  alternates: {
    canonical: absoluteUrl("/privacidad"),
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacidadPage() {
  return (
    <main className="page-main">
      <article className="container prose">
        <h1>Política de privacidad</h1>
        <p className="updated">
          Última actualización: 10 de octubre de 2026 · Aplica a la aplicación
          Android <strong>{site.name}</strong> (nombre de paquete{" "}
          <code>com.vcprojects.nominapp</code>), al sitio web{" "}
          <strong>{site.url}</strong> y a los servicios asociados.
        </p>

        <p>
          Esta Política de privacidad describe de forma específica cómo{" "}
          <strong>{site.name}</strong> (el &quot;Titular&quot;, &quot;nosotros&quot;)
          recopila, usa, almacena, comparte y protege la información de los
          usuarios en Colombia. Al usar la app o el sitio, usted acepta las
          prácticas aquí descritas. Los{" "}
          <Link href="/terminos">Términos y condiciones</Link> complementan este
          documento.
        </p>

        <h2>1. Responsable del tratamiento</h2>
        <p>
          <strong>{site.name}</strong>
          <br />
          País: {site.country}
          <br />
          Correo de contacto (privacidad y derechos ARCO):{" "}
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
          <br />
          Sitio web: <a href={site.url}>{site.url}</a>
        </p>

        <h2>2. Ámbito y a quién aplica</h2>
        <p>Esta política aplica a:</p>
        <ul>
          <li>
            Usuarios de la app Android {site.name} distribuida en Google Play u
            otras fuentes oficiales vinculadas a este sitio.
          </li>
          <li>Visitantes y usuarios del sitio web {site.url}.</li>
          <li>
            Personas que crean una cuenta opcional para sincronización en la
            nube o que nos contactan por correo / formulario.
          </li>
        </ul>
        <p>
          {site.name} <strong>no está dirigida a niños</strong>. No recopilamos
          a sabiendas datos de menores de edad. Si usted es padre, madre o tutor
          y cree que un menor nos ha proporcionado datos, escríbanos para
          eliminarlos.
        </p>

        <h2>3. Resumen: modos de uso</h2>
        <ul>
          <li>
            <strong>Modo local (sin cuenta):</strong> los datos de nómina,
            jornadas y gastos permanecen en su dispositivo. El Titular{" "}
            <strong>no tiene acceso</strong> a ese contenido.
          </li>
          <li>
            <strong>Modo con cuenta / nube (opcional):</strong> si crea una
            cuenta, parte de sus datos se sincroniza con proveedores de
            infraestructura para respaldarlos y usarlos en la web o en otro
            dispositivo, bajo aislamiento por usuario.
          </li>
        </ul>

        <h2>4. Datos que podemos recopilar</h2>
        <p>
          Según cómo use el servicio, podemos tratar las siguientes categorías:
        </p>

        <h3>4.1. Datos de cuenta (solo si se registra)</h3>
        <ul>
          <li>Correo electrónico.</li>
          <li>
            Identificador de usuario y credenciales gestionadas de forma segura
            por el proveedor de autenticación (no almacenamos su contraseña en
            texto plano).
          </li>
          <li>Marcas temporales de creación / último acceso asociadas a la cuenta.</li>
        </ul>

        <h3>4.2. Datos laborales y de uso de la app (ingresados por usted)</h3>
        <ul>
          <li>
            Perfil laboral: nombre o alias que usted indique, documento (si lo
            registra), cargo, salario, tipo de contrato, jornada, período de
            cobro y preferencias similares.
          </li>
          <li>
            Jornadas: fechas, horas de entrada/salida, notas, festivos y
            marcaciones relacionadas.
          </li>
          <li>
            Conceptos manuales: bonificaciones, deducciones, egresos/gastos
            personales y categorías que usted registre.
          </li>
          <li>
            Preferencias de la app (por ejemplo recordatorios, formato de hora).
          </li>
          <li>
            Archivos PDF que usted genere/exporte en el dispositivo (quedan bajo
            su control; no se suben automáticamente a nuestros servidores salvo
            que una función futura lo indique de forma explícita).
          </li>
        </ul>

        <h3>4.3. Datos técnicos y del dispositivo</h3>
        <ul>
          <li>
            Información técnica mínima para operar el servicio: tipo de
            cliente (app/web), eventos de sincronización, códigos de error
            agregados y diagnósticos necesarios para estabilidad.
          </li>
          <li>
            En el sitio web: datos de registro estándar del servidor (por
            ejemplo dirección IP, user-agent, páginas visitadas) y métricas de
            uso agregadas vía analítica de hosting (ver sección 6).
          </li>
          <li>
            Si usa actualizaciones in-app (sideload), la app puede consultar un
            manifiesto público de versión en nuestros dominios; esa consulta no
            incluye su liquidación ni su perfil laboral.
          </li>
        </ul>

        <h3>4.4. Datos de contacto</h3>
        <ul>
          <li>
            Si nos escribe o usa el formulario de contacto: nombre o correo que
            indique y el contenido del mensaje.
          </li>
        </ul>

        <p>
          <strong>No solicitamos</strong> datos de tarjetas de crédito para usar
          la app (el servicio es gratuito). No rastreamos su ubicación precisa
          con GPS para publicidad.
        </p>

        <h2>5. Finalidades del tratamiento</h2>
        <ul>
          <li>
            Prestar la funcionalidad de registro de jornadas y estimación de
            liquidación / gastos de uso personal.
          </li>
          <li>
            Autenticarle, mantener su sesión y sincronizar datos entre
            dispositivos cuando active la nube.
          </li>
          <li>Responder soporte, consultas y ejercicio de derechos.</li>
          <li>
            Operar, asegurar y mejorar la app y el sitio (estabilidad,
            prevención de abuso, métricas agregadas).
          </li>
          <li>Cumplir obligaciones legales cuando aplique.</li>
        </ul>
        <p>
          No vendemos sus datos personales. No usamos el contenido de su nómina
          para publicidad dirigida a terceros.
        </p>

        <h2>6. Con quién compartimos datos (terceros)</h2>
        <p>
          Solo compartimos información con proveedores que nos ayudan a operar el
          servicio, bajo instrucciones contractuales y con finalidades limitadas:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> (autenticación, base de datos y API):
            almacenamiento de cuenta y datos sincronizados en la nube, con
            políticas de seguridad a nivel de fila (aislamiento por usuario).
          </li>
          <li>
            <strong>Vercel</strong> (hosting del sitio web y funciones
            asociadas): despliegue del front y, cuando aplica,{" "}
            <em>Vercel Analytics</em> con métricas de uso del sitio de carácter
            agregado / técnico.
          </li>
          <li>
            <strong>Resend</strong> (u otro proveedor equivalente de correo
            transaccional): envío de mensajes cuando usted usa el formulario de
            contacto u otras notificaciones por correo que habilitemos.
          </li>
          <li>
            <strong>GitHub</strong> (distribución de artefactos APK de
            sideload/releases, si descarga desde nuestros enlaces oficiales):
            la descarga puede pasar por su infraestructura; no les enviamos su
            perfil laboral.
          </li>
          <li>
            <strong>Google Play</strong> (si instala desde Play Store): Google
            trata datos según sus propias políticas como plataforma de
            distribución (instalaciones, actualizaciones, reportes de fallos que
            usted o el sistema envíen a Google).
          </li>
        </ul>
        <p>
          También podremos divulgar información si la ley, una orden judicial o
          una autoridad competente lo exige, o para proteger derechos, seguridad
          e integridad del servicio y de los usuarios.
        </p>

        <h2>7. Transferencias internacionales</h2>
        <p>
          Los proveedores anteriores pueden procesar o almacenar información en
          servidores fuera de Colombia. Al crear una cuenta o usar funciones en
          la nube / el sitio, usted autoriza dichas transferencias para las
          finalidades de esta política, con medidas de seguridad razonables
          aplicadas por esos proveedores.
        </p>

        <h2>8. Conservación</h2>
        <ul>
          <li>
            Datos en el dispositivo (modo local): usted los controla; se
            eliminan al borrar los datos de la app o desinstalarla (según el
            sistema operativo).
          </li>
          <li>
            Datos en la nube: se conservan mientras mantenga la cuenta activa o
            hasta que solicite eliminación, salvo plazos legales de retención.
          </li>
          <li>
            Registros técnicos y de contacto: el tiempo necesario para
            seguridad, soporte y obligaciones legales.
          </li>
        </ul>

        <h2>9. Seguridad</h2>
        <p>
          Aplicamos medidas técnicas y organizativas razonables (cifrado en
          tránsito mediante HTTPS, autenticación, aislamiento por usuario en la
          nube, controles de acceso). Ningún sistema es 100&nbsp;% invulnerable:
          usted debe proteger su dispositivo, pantalla de bloqueo y contraseña.
        </p>

        <h2>10. Sus derechos (Ley 1581 de 2012 y normas complementarias)</h2>
        <p>
          Como titular de datos personales en Colombia, puede solicitar conocer,
          actualizar, rectificar y suprimir sus datos, y revocar la autorización
          otorgada, escribiendo a{" "}
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
        </p>
        <p>
          En la app, cuando esté disponible la función de eliminación de cuenta,
          su uso implica la baja de la cuenta y la supresión de datos
          sincronizados en la nube, salvo conservación exigida por ley.
        </p>

        <h2>11. Permisos del dispositivo</h2>
        <p>
          Según la versión y funciones habilitadas, la app puede solicitar
          permisos del sistema Android, por ejemplo:
        </p>
        <ul>
          <li>Internet / estado de red: sincronización y consultas de versión.</li>
          <li>Notificaciones: recordatorios opcionales de jornada.</li>
          <li>
            Biometría (si usted la activa): desbloqueo local; los datos
            biométricos los gestiona el sistema del dispositivo, no nuestros
            servidores.
          </li>
          <li>
            Instalación de paquetes (en builds sideload): para aplicar
            actualizaciones APK que usted confirme.
          </li>
        </ul>
        <p>
          Puede denegar o revocar permisos en Ajustes del sistema; algunas
          funciones dejarán de estar disponibles.
        </p>

        <h2>12. Enlaces y servicios de terceros</h2>
        <p>
          El sitio o la app pueden enlazar a recursos externos (por ejemplo
          normas oficiales). Su uso se rige por las políticas de esos terceros.
          No controlamos su contenido ni sus prácticas de privacidad.
        </p>

        <h2>13. Cambios a esta política</h2>
        <p>
          Podemos actualizar esta Política de privacidad. Publicaremos la
          versión vigente en{" "}
          <a href={absoluteUrl("/privacidad")}>{absoluteUrl("/privacidad")}</a>{" "}
          con la fecha de &quot;Última actualización&quot;. El uso continuado
          del servicio después de un cambio relevante implica aceptación de la
          nueva versión.
        </p>

        <h2>14. Contacto</h2>
        <p>
          Privacidad, datos personales o soporte:
          <br />
          <strong>{site.name}</strong>
          <br />
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
          <br />
          {site.url}
        </p>
        <p>
          Documento relacionado:{" "}
          <Link href="/terminos">Términos y condiciones de uso</Link>.
        </p>
      </article>
    </main>
  );
}
