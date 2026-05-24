import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

/**
 * Auth callback handler — exchanges the PKCE `code` from Supabase email links
 * for a real session (stored in cookies), then redirects to the `next` URL.
 *
 * Used by: password-reset email, magic-link email.
 * The redirectTo in the email is: <site>/auth/callback?next=/auth/reset-password
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to the intended destination (e.g. /auth/reset-password)
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("[auth/callback] code exchange failed:", error.message);
  }

  // Something went wrong — send to reset-password with an error flag
  return NextResponse.redirect(`${origin}/auth/reset-password?error=invalid_link`);
}
