"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2 } from "lucide-react";

// Inline browser client — avoids importing lib/supabase.ts which pulls in next/headers
function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

interface Props {
  /** URL to redirect back to after OAuth (e.g. "/dashboard") */
  next?: string;
  /** Label prefix: "Sign in" or "Sign up" */
  mode?: "signin" | "signup";
}

export default function SocialAuthButtons({ next, mode = "signin" }: Props) {
  const [loading, setLoading] = useState<"google" | null>(null);

  async function handleGoogle() {
    setLoading("google");
    const supabase  = getSupabase();
    const redirectTo =
      `${window.location.origin}/auth/callback?provider=google` +
      (next ? `&next=${encodeURIComponent(next)}` : "");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options:  { redirectTo, queryParams: { access_type: "offline", prompt: "consent" } },
    });

    if (error) {
      console.error("[Google OAuth]", error);
      setLoading(null);
    }
    // On success, Supabase redirects the browser — no need to reset loading
  }

  const label = mode === "signup" ? "Sign up with Google" : "Continue with Google";

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading === "google"}
        className="w-full h-11 flex items-center justify-center gap-3 bg-dark-secondary border border-dark-border hover:border-gray-500 rounded-xl text-[13px] font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading === "google" ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          /* Google "G" SVG */
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        {loading === "google" ? "Connecting…" : label}
      </button>
    </div>
  );
}
