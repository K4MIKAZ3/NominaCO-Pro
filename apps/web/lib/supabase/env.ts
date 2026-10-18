export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://kmkrxyrorksrwmdomfuy.supabase.co";

export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://empresas.nominapp.xyz";

export function assertSupabasePublicConfig(): void {
  if (!supabaseAnonKey) {
    throw new Error(
      "Falta NEXT_PUBLIC_SUPABASE_ANON_KEY (Settings → API → anon / publishable key)",
    );
  }
}
