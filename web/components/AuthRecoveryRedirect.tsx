"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { buildRecoveryRedirectTarget } from "@/lib/auth-recovery";

/**
 * Si Supabase redirige a la home (u otra ruta) con tokens o errores en la URL,
 * reenvía a /restablecer-contrasena para procesar la recuperación.
 */
export function AuthRecoveryRedirect() {
  const pathname = usePathname();

  useEffect(() => {
    const target = buildRecoveryRedirectTarget(
      pathname,
      window.location.search,
      window.location.hash,
    );
    if (target) {
      window.location.replace(target);
    }
  }, [pathname]);

  return null;
}
