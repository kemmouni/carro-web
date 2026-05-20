import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabaseAdmin.from("users").select("role").eq("id", user.id).single();
  if (data?.role !== "ADMIN") return null;
  return user;
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("brands")
      .select("*")
      .order("sortOrder", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (err) {
    console.error("[GET /api/admin/brands]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { name, slug, country, isPopular, sortOrder } = body;
    if (!name || !slug) return NextResponse.json({ success: false, error: "name and slug required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("brands")
      .insert({ id: crypto.randomUUID(), name, slug, country, isPopular: !!isPopular, sortOrder: sortOrder ?? 999 })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[POST /api/admin/brands]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
