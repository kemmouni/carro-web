import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, createSupabaseServerClient } from "@/lib/supabase";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabaseAdmin.from("users").select("role").eq("id", user.id).single();
  return data?.role === "ADMIN" ? user : null;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from("hero_banners")
    .select("*")
    .order("sortOrder", { ascending: true });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data ?? [] });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { title, subtitle, ctaText, ctaLink, imageUrl, isActive, sortOrder } = body;

    if (!title) return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("hero_banners")
      .insert({ title, subtitle, ctaText, ctaLink, imageUrl, isActive: isActive ?? true, sortOrder: sortOrder ?? 0 })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[POST /api/admin/banners]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
