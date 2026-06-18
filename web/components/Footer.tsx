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
          <Link href="/guia">Guía de nómina</Link>
          <Link href="/#funciones">Funciones</Link>
          <Link href="/#preguntas">Preguntas frecuentes</Link>
          <Link href="/terminos">Términos y privacidad</Link>
          <Link href="/login">Iniciar sesión</Link>
          <ContactDialog />
        </div>
      </div>
    </footer>
  );
}
