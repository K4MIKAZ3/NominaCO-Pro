import { site } from "@/lib/site";

export function resetPasswordPath(): string {
  return site.auth.resetPasswordPath;
}

/** Parámetros de callback de Supabase en query string (PKCE / verifyOtp). */
export function hasRecoveryQuery(search: string): boolean {
  const params = new URLSearchParams(search);
  if (params.get("code")) return true;
  return params.get("type") === "recovery" && !!params.get("token_hash");
}

/** Tokens o errores de Supabase en el hash (#access_token=… o #error=…). */
export function hasRecoveryHash(hash: string): boolean {
  if (!hash || hash === "#") return false;
  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  if (params.get("error") || params.get("error_code")) return true;
  if (params.get("access_token") && params.get("type") === "recovery") return true;
  return params.get("type") === "recovery" && !!params.get("access_token");
}

export function parseRecoveryHashError(hash: string): string | null {
  if (!hash) return null;
  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const code = params.get("error_code") ?? params.get("error");
  const description = params.get("error_description")?.replace(/\+/g, " ");
  if (!code && !description) return null;

  if (code === "otp_expired" || description?.toLowerCase().includes("expired")) {
    return "El enlace expiró o ya fue usado. Los enlaces duran poco; solicita uno nuevo y ábrelo de inmediato.";
  }
  if (code === "access_denied") {
    return description ?? "No se pudo validar el enlace. Solicita uno nuevo.";
  }
  return description ?? "No se pudo validar el enlace de recuperación.";
}

export function buildRecoveryRedirectTarget(pathname: string, search: string, hash: string): string | null {
  if (pathname === resetPasswordPath()) return null;
  if (!hasRecoveryQuery(search) && !hasRecoveryHash(hash)) return null;
  return `${resetPasswordPath()}${search}${hash}`;
}
