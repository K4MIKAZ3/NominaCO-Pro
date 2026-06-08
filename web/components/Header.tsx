import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";

export function Header() {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="logo">
          <Image
            src="/icon.png"
            alt={`${site.name} logo`}
            width={36}
            height={36}
            sizes="36px"
            className="logo-mark"
            priority
          />
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
