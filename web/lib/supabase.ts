import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { site } from "@/lib/site";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("YOUR_PROJECT")) return null;
  if (!client) {
    client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}

export function authUrl(path: string): string {
  return `${site.url.replace(/\/$/, "")}${path}`;
}

export function isSupabaseConfigured(): boolean {
  return getSupabase() !== null;
}
