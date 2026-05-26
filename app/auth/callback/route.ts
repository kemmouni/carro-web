import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase";

/**
 * Universal auth callback handler.
 *
 * Used by:
 *   1. Password-reset / magic-link emails  (?next=/auth/reset-password)
 *   2. OAuth providers (Google)            (?provider=google&next=/)
 *
 * Supabase always redirects here with ?code=... after any auth flow.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code     = searchParams.get("code");
  const next     = searchParams.get("next") ?? "/";
  const isOAuth  = searchParams.get("provider") !== null || !next.startsWith("/auth/reset");

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    console.error("[auth/callback] code exchange failed:", error?.message);
    // For password-reset flows send to reset page with error; for OAuth send to login
    const errorDest = next.startsWith("/auth/reset")
      ? `${origin}/auth/reset-password?error=invalid_link`
      : `${origin}/auth/login?error=oauth_failed`;
    return NextResponse.redirect(errorDest);
  }

  // ── OAuth user provisioning ──────────────────────────────────────────────
  if (isOAuth) {
    const authUser = data.session.user;

    // Upsert the user row so OAuth users have a profile immediately
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id, role")
      .eq("id", authUser.id)
      .maybeSingle();

    if (!existing) {
      const fullName =
        authUser.user_metadata?.full_name ??
        authUser.user_metadata?.name ??
        authUser.email?.split("@")[0] ??
        "User";

      await supabaseAdmin.from("users").insert({
        id:       authUser.id,
        email:    authUser.email,
        fullName,
        role:     "BUYER",
      });
    }

    const role = existing?.role ?? "BUYER";
    const dest =
      next && next !== "/"
        ? next
        : role === "ADMIN"  ? "/admin"
        : role === "SELLER" ? "/dashboard"
        : "/";

    return NextResponse.redirect(`${origin}${dest}`);
  }

  // ── Password-reset / magic-link — redirect to the intended page ──────────
  return NextResponse.redirect(`${origin}${next}`);
}
