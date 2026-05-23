import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, createSupabaseServerClient } from "@/lib/supabase";

function genCode(userId: string) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seed  = userId.replace(/-/g, "").slice(0, 8);
  let code    = "CRO-";
  for (let i = 0; i < 6; i++) {
    code += chars[parseInt(seed.slice(i * 1, i * 1 + 2), 16) % chars.length];
  }
  return code;
}

// GET — get or create the user's referral code + stats
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    let { data: rc } = await supabaseAdmin
      .from("referral_codes")
      .select("*")
      .eq("userId", user.id)
      .maybeSingle();

    if (!rc) {
      const code = genCode(user.id);
      const { data } = await supabaseAdmin
        .from("referral_codes")
        .insert({ userId: user.id, code })
        .select()
        .single();
      rc = data;
    }

    // Count accepted referrals
    const { count: referrals } = await supabaseAdmin
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrerId", user.id);

    return NextResponse.json({ success: true, data: { ...rc, referrals: referrals ?? 0 } });
  } catch (err) {
    console.error("[GET /api/referral]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST — redeem a referral code during signup
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Sign in first" }, { status: 401 });

    const { code } = await req.json();
    if (!code) return NextResponse.json({ success: false, error: "Code required" }, { status: 400 });

    const { data: rc } = await supabaseAdmin
      .from("referral_codes")
      .select("userId")
      .eq("code", code.trim().toUpperCase())
      .maybeSingle();

    if (!rc) return NextResponse.json({ success: false, error: "Invalid referral code" }, { status: 404 });
    if (rc.userId === user.id) return NextResponse.json({ success: false, error: "Cannot use your own code" }, { status: 400 });

    // Check not already referred
    const { data: existing } = await supabaseAdmin
      .from("referrals").select("id").eq("referredId", user.id).maybeSingle();
    if (existing) return NextResponse.json({ success: false, error: "You've already used a referral code" }, { status: 400 });

    await supabaseAdmin.from("referrals").insert({
      referrerId: rc.userId,
      referredId: user.id,
      code:       code.trim().toUpperCase(),
    });

    // Increment uses (best-effort)
    const { data: rc2 } = await supabaseAdmin
      .from("referral_codes").select("uses").eq("code", code.trim().toUpperCase()).single();
    if (rc2) {
      await supabaseAdmin.from("referral_codes")
        .update({ uses: (rc2.uses as number) + 1 })
        .eq("code", code.trim().toUpperCase());
    }

    // Notify referrer
    await supabaseAdmin.from("notifications").insert({
      id:      crypto.randomUUID(),
      userId:  rc.userId,
      type:    "referral_joined",
      title:   "Friend joined via your link!",
      message: "You've earned 1 free featured listing slot. It will be applied to your store.",
      link:    "/dashboard/subscriptions",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/referral]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
