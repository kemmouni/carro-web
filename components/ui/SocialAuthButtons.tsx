"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Loader2 } from "lucide-react";
import WhatsAppOtpModal from "./WhatsAppOtpModal";

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
  const [loading, setLoading]           = useState<"google" | null>(null);
  const [showWhatsApp, setShowWhatsApp] = useState(false);

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

  const googleLabel    = mode === "signup" ? "Sign up with Google"    : "Continue with Google";
  const whatsAppLabel  = mode === "signup" ? "Sign up with WhatsApp"  : "Continue with WhatsApp";

  return (
    <>
      <div className="space-y-3">

        {/* ── Google ── */}
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
          {loading === "google" ? "Connecting…" : googleLabel}
        </button>

        {/* ── WhatsApp OTP ── */}
        <button
          type="button"
          onClick={() => setShowWhatsApp(true)}
          className="w-full h-11 flex items-center justify-center gap-3 bg-dark-secondary border border-[#25D366]/40 hover:border-[#25D366] rounded-xl text-[13px] font-semibold text-[#25D366] transition-colors"
        >
          {/* WhatsApp logo */}
          <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-[#25D366]">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {whatsAppLabel}
        </button>

      </div>

      {/* Modal */}
      {showWhatsApp && (
        <WhatsAppOtpModal
          onClose={() => setShowWhatsApp(false)}
          next={next}
        />
      )}
    </>
  );
}
