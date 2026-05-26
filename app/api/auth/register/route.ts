import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create auth user via admin (email_confirm: true skips confirmation email)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      const msg = authError?.message ?? "Registration failed";
      const friendly = msg.includes("already registered") || msg.includes("already been registered")
        ? "An account with this email already exists."
        : msg;
      return NextResponse.json({ success: false, error: friendly }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Insert into users table as BUYER — store setup happens later when they choose to sell
    const { error: userError } = await supabaseAdmin.from("users").insert({
      id:       userId,
      email,
      fullName: name,
      role:     "BUYER",
    });

    if (userError) {
      console.error("[register] user insert error:", userError);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ success: false, error: "Failed to create user profile" }, { status: 500 });
    }

    // 3. Auto sign-in so the user doesn't need to log in separately
    const supabase = await createSupabaseServerClient();
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.session) {
      return NextResponse.json({
        success: true,
        autoLogin: false,
        data: { role: "BUYER" },
      }, { status: 201 });
    }

    return NextResponse.json({
      success:   true,
      autoLogin: true,
      data: {
        role:     "BUYER",
        fullName: name,
      },
    }, { status: 201 });

  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
