import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

// ── POST /api/auth/password ── Send password-reset email ──────────────────────
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://warsha.plus";
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      // Redirect to the callback route which exchanges the PKCE code server-side,
      // then forwards to /auth/reset-password where the user sets a new password.
      redirectTo: `${siteUrl}/auth/callback?next=/auth/reset-password`,
    });

    if (error) {
      console.error("[POST /api/auth/password]", error);
      return NextResponse.json({ success: false, error: "Failed to send reset email" }, { status: 500 });
    }

    // Always return success to avoid email enumeration
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/auth/password]", err);
    return NextResponse.json({ success: false, error: "Failed to send reset email" }, { status: 500 });
  }
}

// ── PUT /api/auth/password ── Change password (authenticated) ─────────────────
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    // Verify current password by attempting sign-in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email:    user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json({ success: false, error: "Current password is incorrect" }, { status: 400 });
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PUT /api/auth/password]", err);
    return NextResponse.json({ success: false, error: "Failed to update password" }, { status: 500 });
  }
}
