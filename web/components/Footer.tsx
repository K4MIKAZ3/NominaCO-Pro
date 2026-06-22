import Link from "next/link";
import { ContactDialog } from "@/components/ContactDialog";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <p>
          © {site.year} {site.name} · {site.country}
        </p>
        <div className="footer-links">
          <Link href="/#proyectos">Proyectos</Link>
          <Link href="/#servicios">Servicios</Link>
          <Link href="/#preguntas">Preguntas frecuentes</Link>
          <Link href="/terminos">Términos</Link>
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
          <ContactDialog triggerLabel="Cotizar proyecto" />
        </div>
      </div>
    </footer>
  );
}
