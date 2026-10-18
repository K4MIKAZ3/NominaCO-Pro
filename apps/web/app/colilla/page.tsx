import Link from "next/link";

export const metadata = {
  title: "Colilla",
};

export default function ColillaPage() {
  return (
    <div className="app">
      <header className="app-top">
        <div className="app-bar">
          <div className="brand">
            <div className="brand-mark" aria-hidden />
            nominapp
          </div>
          <span>Marta Rojas</span>
        </div>
        <div className="app-period">Quincena 1 · 1 al 15 de octubre</div>
        <div className="app-net m">$1.034.000</div>
        <span className="chip chip-ok" style={{ marginTop: 10 }}>
          Pagado el 15 de octubre
        </span>
      </header>

      <div className="app-body">
        <section>
          <div className="label-caps" style={{ marginBottom: 8 }}>
            Días laborados · 15 de 15
          </div>
          <div className="days">
            <div className="day">1</div>
            <div className="day">2</div>
            <div className="day">3</div>
            <div className="day off">4</div>
            <div className="day">5</div>
            <div className="day">6</div>
            <div className="day">7</div>
            <div className="day">8</div>
            <div className="day">9</div>
            <div className="day">10</div>
            <div className="day off">11</div>
            <div className="day">12</div>
            <div className="day">13</div>
            <div className="day">14</div>
            <div className="day today">15</div>
            <div className="day off" />
          </div>
        </section>

        <section>
          <div className="line">
            <span>Salario básico</span>
            <span className="m">1.124.000</span>
          </div>
          <div className="line">
            <span>Salud 4%</span>
            <span className="m">−45.000</span>
          </div>
          <div className="line">
            <span>Pensión 4%</span>
            <span className="m">−45.000</span>
          </div>
          <div className="net">
            <b>Neto recibido</b>
            <span className="m" style={{ fontSize: 18 }}>
              $1.034.000
            </span>
          </div>
        </section>

        <section className="benefits">
          <div>
            <span>Prima estimada a la fecha</span>
            <b className="m">$842.000</b>
          </div>
          <div>
            <span>Cesantías</span>
            <b className="m">$1.684.000</b>
          </div>
        </section>

        <div className="app-actions">
          <button type="button" className="btn btn-primary">
            Descargar colilla en PDF
          </button>
          <button type="button" className="btn">
            Solicitar certificado laboral
          </button>
          <Link href="/" className="btn" style={{ textAlign: "center" }}>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
