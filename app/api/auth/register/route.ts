import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase";

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const isSeller = role === "SELLER";

    // 1. Create auth user via admin (email_confirm: true skips confirmation email)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      const msg = authError?.message ?? "Registration failed";
      // Surface friendly messages for common errors
      const friendly = msg.includes("already registered") || msg.includes("already been registered")
        ? "An account with this email already exists."
        : msg;
      return NextResponse.json({ success: false, error: friendly }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Insert into users table
    const { error: userError } = await supabaseAdmin.from("users").insert({
      id:       userId,
      email,
      fullName: name,
      role:     isSeller ? "SELLER" : "BUYER",
    });

    if (userError) {
      console.error("[register] user insert error:", userError);
      // Clean up auth user so there's no orphan
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ success: false, error: "Failed to create user profile" }, { status: 500 });
    }

    // 3. If seller, create a store
    if (isSeller) {
      const slug = `${toSlug(name)}-${Math.random().toString(36).slice(2, 6)}`;
      const { error: storeError } = await supabaseAdmin.from("stores").insert({
        id:      crypto.randomUUID(),
        userId,
        name,
        slug,
        city:    "Doha",
        country: "Qatar",
      });
      if (storeError) console.error("[register] store insert error:", storeError);
    }

    // 4. Auto sign-in so the user doesn't need to log in separately
    const supabase = await createSupabaseServerClient();
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.session) {
      // Registration succeeded but auto-login failed — send to login page
      return NextResponse.json({
        success: true,
        autoLogin: false,
        data: { role: isSeller ? "SELLER" : "BUYER" },
      }, { status: 201 });
    }

    return NextResponse.json({
      success:   true,
      autoLogin: true,
      data: {
        role:     isSeller ? "SELLER" : "BUYER",
        fullName: name,
      },
    }, { status: 201 });

  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
