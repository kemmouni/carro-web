import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";

const HMAC_SECRET = process.env.OTP_HMAC_SECRET ?? "warsha-otp-default-secret-change-me";

function checkHmac(phone: string, otp: string, windowTs: string, token: string): boolean {
  try {
    const expected = createHmac("sha256", HMAC_SECRET)
      .update(`${phone}:${otp}:${windowTs}`)
      .digest("base64");
    return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { phone, token, otp_token } = await req.json();
    if (!phone || !token || !otp_token) {
      return NextResponse.json(
        { success: false, error: "phone, token, and otp_token are required" },
        { status: 400 }
      );
    }

    // ── 1. Verify HMAC (current + previous 10-min window for clock skew) ─────
    const nowWindow  = Math.floor(Date.now() / 600000).toString();
    const prevWindow = (Math.floor(Date.now() / 600000) - 1).toString();

    const valid =
      checkHmac(phone, token, nowWindow,  otp_token) ||
      checkHmac(phone, token, prevWindow, otp_token);

    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired code. Please try again." },
        { status: 400 }
      );
    }

    // ── 2. Resolve or create Supabase user ────────────────────────────────────
    const virtualEmail = `${phone.replace(/\D/g, "")}@wa.warsha.plus`;

    await supabaseAdmin.auth.admin.createUser({
      email:         virtualEmail,
      phone,
      phone_confirm: true,
      email_confirm: true,
      user_metadata: { phone, auth_method: "whatsapp_otp" },
    });

    // Ensure public.users row exists
    const { data: authList } = await supabaseAdmin.auth.admin.listUsers();
    const supaUser = authList?.users?.find((u) => u.email === virtualEmail);
    if (supaUser) {
      const { data: existing } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("id", supaUser.id)
        .maybeSingle();

      if (!existing) {
        await supabaseAdmin.from("users").insert({
          id:       supaUser.id,
          email:    virtualEmail,
          fullName: phone,
          role:     "BUYER",
        });
      }
    }

    // ── 3. Generate magic-link token_hash ─────────────────────────────────────
    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type:  "magiclink",
        email: virtualEmail,
      });

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error("[whatsapp/verify] generateLink error:", linkError);
      return NextResponse.json(
        { success: false, error: "Failed to create session. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success:    true,
      token_hash: linkData.properties.hashed_token,
      email:      virtualEmail,
    });
  } catch (err) {
    console.error("[whatsapp/verify]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
