import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const AUTH_TOKEN  = process.env.TWILIO_AUTH_TOKEN!;
const VERIFY_SID  = process.env.TWILIO_VERIFY_SID!;

export async function POST(req: NextRequest) {
  try {
    const { phone, token } = await req.json();
    if (!phone || !token) {
      return NextResponse.json(
        { success: false, error: "Phone and token required" },
        { status: 400 }
      );
    }

    // ── 1. Verify the OTP with Twilio ────────────────────────────────────────
    const credentials = Buffer.from(`${ACCOUNT_SID}:${AUTH_TOKEN}`).toString("base64");

    const twilioRes = await fetch(
      `https://verify.twilio.com/v2/Services/${VERIFY_SID}/VerificationChecks`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: phone, Code: token }),
      }
    );

    const twilioData = await twilioRes.json();

    if (!twilioRes.ok || twilioData.status !== "approved") {
      return NextResponse.json(
        { success: false, error: "Invalid or expired code. Please try again." },
        { status: 400 }
      );
    }

    // ── 2. Resolve or create the Supabase user ───────────────────────────────
    // Use a virtual email so the user has a stable Supabase identity.
    const digits       = phone.replace(/\D/g, "");
    const virtualEmail = `${digits}@wa.warsha.plus`;

    // Try to create – ignore "already registered" error
    await supabaseAdmin.auth.admin.createUser({
      email:         virtualEmail,
      phone,
      phone_confirm: true,
      email_confirm: true,
      user_metadata: { phone, auth_method: "whatsapp_otp" },
    });

    // Ensure the user row exists in the public.users table
    const { data: authUser } = await supabaseAdmin.auth.admin.listUsers();
    const supaUser = authUser?.users?.find((u) => u.email === virtualEmail);
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

    // ── 3. Generate a magic-link token so the client can sign in ─────────────
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
