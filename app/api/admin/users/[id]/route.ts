import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabaseAdmin.from("users").select("role").eq("id", user.id).single();
  return data?.role === "ADMIN" ? user : null;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const body = await req.json();

    // Prevent admin from banning themselves
    if (id === admin.id && body.isBanned === true) {
      return NextResponse.json({ success: false, error: "Cannot ban yourself" }, { status: 400 });
    }

    const allowed = ["role", "isBanned"];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .update(updates)
      .eq("id", id)
      .select("id, email, name, role, isBanned, createdAt")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[PUT /api/admin/users/[id]]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
