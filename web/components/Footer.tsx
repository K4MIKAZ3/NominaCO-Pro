import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <p>
          © {site.year} {site.developer} · {site.name} · {site.country}
        </p>
        <div className="footer-links">
          <Link href="/terminos">Términos y privacidad</Link>
          <Link href="/login">Iniciar sesión</Link>
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
        </div>
      </div>
    </footer>
  );
}
