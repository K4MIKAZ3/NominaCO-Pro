import Link from "next/link";
import Image from "next/image";
import { ContactDialog } from "@/components/ContactDialog";
import { site } from "@/lib/site";

export function Header() {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="logo">
          <Image
            src="/icon.svg"
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
          <Link href="/#proyectos" className="hide-mobile">
            Proyectos
          </Link>
          <Link href="/#servicios" className="hide-mobile">
            Servicios
          </Link>
          <Link href="/#preguntas" className="hide-mobile">
            FAQ
          </Link>
          <ContactDialog
            triggerLabel="Cotizar"
            triggerClassName="btn btn-primary nav-quote-btn"
            defaultSubject="Cotización de proyecto IA"
          />
        </nav>
      </div>
    </header>
  );
}
