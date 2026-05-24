import { createBrowserClient } from "@supabase/ssr";

// Strip BOM (U+FEFF) and whitespace that can sneak in when copying keys
function cleanEnv(value: string | undefined): string {
  return (value ?? "").replace(/^﻿/, "").trim();
}

const supabaseUrl  = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnon = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/**
 * Browser-only Supabase client.
 * Import this in Client Components instead of lib/supabase to avoid
 * pulling in the next/headers dependency (which is server-only).
 */
export const createSupabaseBrowserClient = () =>
  createBrowserClient(supabaseUrl, supabaseAnon);
