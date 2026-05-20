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

    // 1. Create Supabase Auth user
    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: authError?.message ?? "Registration failed" },
        { status: 400 }
      );
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
      // Best-effort cleanup
      console.error("[register] user insert error:", userError);
      return NextResponse.json({ success: false, error: "Failed to create user profile" }, { status: 500 });
    }

    // 3. If seller, create a store
    if (isSeller) {
      let slug = toSlug(name);
      // Ensure slug uniqueness by appending a short random suffix
      const suffix = Math.random().toString(36).slice(2, 7);
      slug = `${slug}-${suffix}`;

      const { error: storeError } = await supabaseAdmin.from("stores").insert({
        id:     crypto.randomUUID(),
        userId,
        name,
        slug,
        city:   "Doha",
        country: "Qatar",
      });

      if (storeError) {
        console.error("[register] store insert error:", storeError);
        // Non-fatal — user can set up store later
      }
    }

    return NextResponse.json(
      { success: true, data: { id: userId, email, fullName: name, role: isSeller ? "SELLER" : "BUYER" } },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
