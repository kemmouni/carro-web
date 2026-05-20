import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Missing email or password" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    // Fetch role from users table
    const { data: userRecord } = await supabaseAdmin
      .from("users")
      .select("role, fullName")
      .eq("id", data.user.id)
      .single();

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id:       data.user.id,
          email:    data.user.email,
          role:     userRecord?.role ?? "BUYER",
          fullName: userRecord?.fullName ?? null,
        },
      },
    });
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
