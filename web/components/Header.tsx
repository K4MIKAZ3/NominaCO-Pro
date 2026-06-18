import Link from "next/link";
import Image from "next/image";
import { ApkDownloadButton } from "@/components/ApkDownloadButton";
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
            unoptimized
          />
          <span className="logo-text">{site.name}</span>
        </Link>
        <nav className="nav">
          <Link href="/guia" className="hide-mobile">
            Guía
          </Link>
          <Link href="/#funciones" className="hide-mobile">
            Funciones
          </Link>
          <Link href="/#preguntas" className="hide-mobile">
            FAQ
          </Link>
          <Link href={site.auth.homePath} className="nav-account">
            Cuenta
          </Link>
          <Link href="/terminos" className="hide-mobile">
            Términos
          </Link>
          <ApkDownloadButton className="btn btn-primary nav-apk-btn">
            <span className="hide-narrow">Descargar APK</span>
            <span className="show-narrow">APK</span>
          </ApkDownloadButton>
        </nav>
      </div>
    </header>
  );
}
