import { createBrowserClient } from "@supabase/ssr";
import { assertSupabasePublicConfig, supabaseAnonKey, supabaseUrl } from "./env";

export function createClient() {
  assertSupabasePublicConfig();
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
