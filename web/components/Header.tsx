import Link from "next/link";
import { site } from "@/lib/site";

export function Header() {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="logo">
          <span className="logo-mark">N</span>
          {site.name}
        </Link>
        <nav className="nav">
          <Link href="/#funciones" className="hide-mobile">
            Funciones
          </Link>
          <Link href="/login">Cuenta</Link>
          <Link href="/terminos" className="hide-mobile">
            Términos
          </Link>
          <a href={site.apkDownloadUrl} className="btn btn-primary">
            Descargar APK
          </a>
        </nav>
      </div>
    </header>
  );
}
