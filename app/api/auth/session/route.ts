import { NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    // Fetch user record + store
    const [userRes, storeRes] = await Promise.all([
      supabaseAdmin.from("users").select("role, fullName").eq("id", user.id).single(),
      supabaseAdmin.from("stores").select("id, name, slug").eq("userId", user.id).single(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        id:       user.id,
        email:    user.email,
        role:     userRes.data?.role     ?? "BUYER",
        fullName: userRes.data?.fullName ?? null,
        storeId:  storeRes.data?.id      ?? null,
        storeName:storeRes.data?.name    ?? null,
      },
    });
  } catch (err) {
    console.error("[GET /api/auth/session]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
