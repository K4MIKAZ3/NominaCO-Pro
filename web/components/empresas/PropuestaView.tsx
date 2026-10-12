type PropuestaViewProps = {
  onStart: () => void;
};

const STEPS = [
  {
    title: "Programar",
    text: "Diana elige el día, marca los trabajadores y les pone el turno. Guardar deja el registro en borrador.",
  },
  {
    title: "Publicar",
    text: "Al publicar, el turno queda firme y cada persona de esa lista recibe el aviso en el momento.",
  },
  {
    title: "Marcar",
    text: "Héctor, autorizado para la marcación, registra la hora real de entrada y de salida. Sin esas dos horas el día no se paga.",
  },
  {
    title: "Liquidar",
    text: "Al corte del mes el programa arma la nómina con esas marcas: jornada, recargo nocturno, extras, dominical, auxilio, salud y pensión.",
  },
];

export function PropuestaView({ onStart }: PropuestaViewProps) {
  return (
    <div className="nx-stack">
      <section className="nx-hero">
        <p className="nx-kicker">Propuesta · app aislada</p>
        <h1>Nominapp Empresas</h1>
        <p className="nx-lead">
          La app personal sigue siendo del trabajador y conserva el verde. Empresas es otro programa, en azul, para quien
          tiene gente a cargo. Aquí el empleador programa, alguien autorizado marca, y a los 30 días la nómina sale de
          esos registros.
        </p>
        <button type="button" className="nx-btn nx-btn-primary" onClick={onStart}>
          Probar la programación
        </button>
      </section>

      <section className="nx-card">
        <h2>Quién hace qué</h2>
        <div className="nx-role-grid">
          <article>
            <h3>Programador</h3>
            <p>Diana Castro elige trabajadores y día, guarda el turno y lo publica.</p>
          </article>
          <article>
            <h3>Marcación</h3>
            <p>Héctor Ruiz registra entrada y salida de quienes ya tienen turno publicado. No cambia la programación.</p>
          </article>
          <article>
            <h3>Administrador</h3>
            <p>Elena Vargas ve el mes completo y la liquidación. Puede programar y marcar.</p>
          </article>
          <article>
            <h3>Trabajador</h3>
            <p>Recibe el aviso, consulta su horario y, al corte, su colilla. No edita turnos ni marcas.</p>
          </article>
        </div>
      </section>

      <section className="nx-card">
        <h2>Cómo corre el mes</h2>
        <ol className="nx-steps">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <span>{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="nx-card">
        <h2>Qué entra en el pago</h2>
        <p>
          El demo liquida octubre de 2026 con las reglas que ya usa Nominapp: mes comercial de 30 días, nocturno de
          19:00 a 06:00 con recargo del 35 %, extra diurna del 25 % y nocturna del 75 %, dominical y festivo al 90 %
          en este semestre, auxilio de transporte si el salario no pasa de 2 SMMLV, y descuento de salud y pensión del
          4 %. La hora de almuerzo, de 12:00 a 13:00, no se paga cuando el turno la cubre.
        </p>
        <p>
          Un retardo se ve en la marcación y no se descuenta solo. Una ausencia —turno publicado sin entrada y salida—
          no genera pago ese día. El 12 de octubre está cargado como festivo.
        </p>
      </section>

      <section className="nx-card">
        <h2>Demo de La Aurora</h2>
        <p>
          Panadería La Aurora, en Bogotá, ya tiene turnos publicados y marcados del 1 al 9 de octubre, para que la
          nómina del mes no arranque vacía. El sábado 10 está libre: ahí se arma un turno nuevo, se publica y se ve el
          aviso en el teléfono del trabajador.
        </p>
        <p className="nx-note">
          El programa completo, descrito en la propuesta, suma aportes del empleador, PILA, fondo de solidaridad,
          incapacidades, vacaciones, prima, cesantías, retención en la fuente y liquidación de contrato. Este demo
          cubre el ciclo de programar, avisar, marcar y pagar.
        </p>
      </section>
    </div>
  );
}
