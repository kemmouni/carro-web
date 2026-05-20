import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/auth/logout]", err);
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 });
  }
}
