export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://empresas.nominapp.xyz";

export function assertSupabasePublicConfig(): void {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Configuración de autenticación incompleta.");
  }
}
