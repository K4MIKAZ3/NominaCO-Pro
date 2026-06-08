import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description:
    "Términos de uso y política de privacidad de Nominapp, aplicación de nómina personal para Colombia.",
};

export default function TerminosPage() {
  return (
    <main className="page-main">
      <article className="container prose">
        <h1>Términos y condiciones de uso</h1>
        <p className="updated">
          Última actualización: 7 de junio de 2026 · {site.url}
        </p>

        <p>
          Los presentes Términos y Condiciones (en adelante, los &quot;Términos&quot;)
          regulan el acceso y uso de la aplicación móvil <strong>{site.name}</strong>,
          del sitio web <strong>{site.url}</strong> y de los servicios asociados de
          respaldo en la nube, ofrecidos por <strong>{site.name}</strong> con
          domicilio en <strong>{site.country}</strong> (en adelante, el
          &quot;Titular&quot; o &quot;nosotros&quot;).
        </p>
        <p>
          Al descargar, instalar, registrarse o utilizar {site.name}, usted (el
          &quot;Usuario&quot;) declara haber leído, comprendido y aceptado estos
          Términos en su totalidad. Si no está de acuerdo, debe abstenerse de usar
          el servicio.
        </p>

        <h2>1. Objeto del servicio</h2>
        <p>
          {site.name} es una herramienta de <strong>uso personal</strong> orientada
          a facilitar el registro de jornadas laborales y la estimación de
          liquidaciones de nómina con base en parámetros del marco legal colombiano
          vigente al momento de la publicación (incluyendo, sin limitarse a ello,
          referencias al Código Sustantivo del Trabajo, Ley 2101, Ley 2466/2025 y
          demás normas aplicables a 2026).
        </p>
        <p>
          El servicio incluye, entre otras funciones: calendario de jornadas,
          cálculo estimado de devengados y descuentos, estimación de prestaciones
          sociales, exportación de documentos PDF y, de forma opcional,
          sincronización de datos mediante cuenta de correo electrónico.
        </p>

        <h2>2. Naturaleza informativa y descargo de responsabilidad profesional</h2>
        <p>
          <strong>
            {site.name} no constituye nómina oficial, certificación laboral,
            asesoría contable, tributaria ni legal.
          </strong>{" "}
          Los resultados mostrados son estimaciones generadas automáticamente a
          partir de la información ingresada por el Usuario y de parámetros legales
          configurados en la aplicación.
        </p>
        <p>
          El Titular no garantiza que los cálculos reflejen con exactitud la
          liquidación que deba efectuar un empleador, contador, revisor fiscal o
          autoridad competente. Cualquier decisión económica, laboral o legal debe
          consultarse con profesionales idóneos.
        </p>
        <p>
          El Usuario es el único responsable de verificar la exactitud de los datos
          que registra (horarios, salarios, deducciones, festivos, bonificaciones,
          etc.) y de las conclusiones que extraiga del uso de la aplicación.
        </p>

        <h2>3. Elegibilidad y registro</h2>
        <p>
          Para crear una cuenta y utilizar la sincronización en la nube, el Usuario
          debe ser mayor de edad según la legislación colombiana y proporcionar un
          correo electrónico válido.
        </p>
        <p>El Usuario se compromete a:</p>
        <ul>
          <li>Proporcionar información veraz, exacta y actualizada.</li>
          <li>Mantener la confidencialidad de su contraseña.</li>
          <li>
            Notificar de inmediato cualquier uso no autorizado de su cuenta a{" "}
            <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
          </li>
        </ul>
        <p>
          El Titular podrá suspender o cancelar cuentas que infrinjan estos Términos
          o que se utilicen con fines fraudulentos o abusivos.
        </p>

        <h2>4. Uso permitido y prohibiciones</h2>
        <p>Está permitido utilizar {site.name} para fines personales de control y estimación de nómina propia.</p>
        <p>Queda expresamente prohibido:</p>
        <ul>
          <li>
            Reproducir, descompilar, modificar o distribuir la aplicación con fines
            comerciales sin autorización escrita del Titular.
          </li>
          <li>
            Intentar acceder a sistemas, bases de datos o cuentas de terceros sin
            autorización.
          </li>
          <li>
            Utilizar el servicio para almacenar o procesar datos de terceros sin
            contar con la legitimación correspondiente conforme a la Ley 1581 de
            2012 y normas complementarias sobre protección de datos personales.
          </li>
          <li>
            Realizar ingeniería inversa con el fin de copiar o replicar el producto,
            sus algoritmos o su interfaz.
          </li>
        </ul>

        <h2>5. Descarga e instalación de la aplicación</h2>
        <p>
          La aplicación se distribuye en formato APK para dispositivos Android. El
          enlace de descarga publicado en {site.url} puede ser actualizado por el
          Titular en cualquier momento.
        </p>
        <p>
          El Usuario es responsable de permitir la instalación desde fuentes
          confiables en su dispositivo y de mantener su sistema operativo
          actualizado. El Titular no se hace responsable por daños derivados de
          instalaciones desde enlaces alterados por terceros ajenos al dominio
          oficial <strong>{site.url}</strong>.
        </p>
        <p>
          Se recomienda descargar la APK únicamente desde el enlace oficial
          publicado en este sitio web.
        </p>

        <h2>6. Modo local y sincronización en la nube</h2>
        <p>
          {site.name} puede utilizarse en modo local sin cuenta. En ese caso, los
          datos permanecen almacenados en el dispositivo del Usuario y el Titular no
          tiene acceso a ellos.
        </p>
        <p>
          Si el Usuario crea una cuenta, sus datos de perfil laboral, jornadas,
          festivos, egresos manuales y preferencias pueden sincronizarse con un
          proveedor de infraestructura en la nube (Supabase), bajo políticas de
          seguridad y aislamiento por usuario.
        </p>
        <p>
          El Usuario reconoce que la disponibilidad del servicio en la nube depende
          de terceros proveedores y de su conexión a internet. El Titular no
          garantiza disponibilidad ininterrumpida ni ausencia total de pérdida de
          datos, aunque adoptará medidas razonables de respaldo y seguridad.
        </p>

        <h2>7. Política de privacidad y tratamiento de datos personales</h2>
        <p>
          En cumplimiento de la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás
          normas aplicables en Colombia, el Titular informa lo siguiente:
        </p>

        <h2>7.1. Responsable del tratamiento</h2>
        <p>
          <strong>{site.name}</strong>
          <br />
          Correo de contacto:{" "}
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
          <br />
          Sitio web: {site.url}
        </p>

        <h2>7.2. Datos que se pueden tratar</h2>
        <ul>
          <li>
            <strong>Datos de cuenta:</strong> correo electrónico, identificador de
            usuario y credenciales cifradas gestionadas por el proveedor de
            autenticación.
          </li>
          <li>
            <strong>Datos laborales:</strong> salario, jornada, tipo de período de
            cobro, vacaciones pendientes y demás información ingresada en el perfil.
          </li>
          <li>
            <strong>Datos de jornada:</strong> fechas, horarios de entrada y salida,
            notas, marcación de festivos y registros de trabajo.
          </li>
          <li>
            <strong>Egresos y bonificaciones:</strong> deducciones, avances y bonos
            registrados manualmente.
          </li>
          <li>
            <strong>Datos técnicos mínimos:</strong> registros necesarios para
            operación del servicio (por ejemplo, marca temporal de sincronización).
          </li>
        </ul>

        <h2>7.3. Finalidades del tratamiento</h2>
        <ul>
          <li>Prestar el servicio de registro y cálculo de nómina personal.</li>
          <li>Autenticar al Usuario y sincronizar su información entre dispositivos.</li>
          <li>Responder solicitudes de soporte o ejercicio de derechos.</li>
          <li>Cumplir obligaciones legales cuando aplique.</li>
        </ul>

        <h2>7.4. Derechos del titular de los datos</h2>
        <p>
          El Usuario puede ejercer sus derechos de conocer, actualizar, rectificar
          y suprimir sus datos personales, así como revocar la autorización
          otorgada, enviando solicitud a{" "}
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
        </p>
        <p>
          La eliminación de la cuenta conlleva la supresión de los datos
          sincronizados en la nube, salvo conservación exigida por ley.
        </p>

        <h2>7.5. Transferencia y almacenamiento</h2>
        <p>
          Los datos en la nube pueden almacenarse en servidores ubicados fuera de
          Colombia, mediante proveedores que aplican estándares de seguridad
          reconocidos. Al utilizar la sincronización, el Usuario autoriza dicho
          tratamiento para las finalidades descritas.
        </p>

        <h2>7.6. Seguridad</h2>
        <p>
          El Titular implementa medidas técnicas y organizativas razonables (incluido
          aislamiento por usuario mediante políticas de seguridad a nivel de fila).
          Ningún sistema es completamente invulnerable; el Usuario debe proteger su
          dispositivo y credenciales.
        </p>

        <h2>8. Propiedad intelectual</h2>
        <p>
          El nombre {site.name}, su diseño, código, textos, iconografía y demás
          elementos distintivos son propiedad del Titular o de sus licenciantes. Queda
          prohibida su reproducción total o parcial con fines comerciales sin
          autorización previa y escrita.
        </p>
        <p>
          Los datos ingresados por el Usuario son de su propiedad. El Titular no
          reclama titularidad sobre la información laboral registrada por el
          Usuario, y solo la trata conforme a estos Términos.
        </p>

        <h2>9. Limitación de responsabilidad</h2>
        <p>
          En la máxima medida permitida por la ley colombiana, el Titular no será
          responsable por:
        </p>
        <ul>
          <li>
            Pérdidas económicas, lucro cesante o perjuicios indirectos derivados del
            uso o imposibilidad de uso del servicio.
          </li>
          <li>
            Errores en cálculos causados por datos incorrectos ingresados por el
            Usuario o por cambios normativos no reflejados aún en la aplicación.
          </li>
          <li>
            Interrupciones del servicio, fallas de red, pérdida de datos local no
            respaldada o incidentes atribuibles a terceros proveedores.
          </li>
        </ul>
        <p>
          El servicio se presta &quot;tal cual&quot; y &quot;según disponibilidad&quot;.
        </p>

        <h2>10. Actualizaciones y cambios normativos</h2>
        <p>
          El Titular podrá actualizar la aplicación, el sitio web y los parámetros
          legales incorporados para reflejar cambios regulatorios o mejoras
          técnicas. Las versiones nuevas pueden requerir reinstalación o
          actualización de la APK.
        </p>
        <p>
          El Titular se reserva el derecho de modificar estos Términos. Los cambios
          relevantes se publicarán en {site.url}/terminos con indicación de la fecha
          de actualización. El uso continuado del servicio después de la publicación
          implica aceptación de los cambios.
        </p>

        <h2>11. Terminación</h2>
        <p>
          El Usuario puede dejar de utilizar el servicio en cualquier momento y
          solicitar la eliminación de su cuenta y datos en la nube. El Titular
          podrá suspender o terminar el acceso ante incumplimiento grave de estos
          Términos, previa notificación cuando sea razonablemente posible.
        </p>

        <h2>12. Ley aplicable y jurisdicción</h2>
        <p>
          Estos Términos se rigen por las leyes de la República de Colombia. Cualquier
          controversia será sometida a los jueces competentes de Colombia, salvo
          norma imperativa en contrario.
        </p>

        <h2>13. Contacto</h2>
        <p>
          Para consultas sobre estos Términos, privacidad o soporte:
          <br />
          <strong>{site.name}</strong>
          <br />
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
          <br />
          {site.url}
        </p>

        <p>
          <em>
            Al utilizar {site.name}, usted confirma que comprende que se trata de
            una herramienta de apoyo personal y que no reemplaza documentos oficiales
            de nómina emitidos por un empleador ni dictámenes de profesionales
            certificados.
          </em>
        </p>
      </article>
    </main>
  );
}
