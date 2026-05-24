import { NextResponse } from "next/server";
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

  try {
    const { data, error } = await supabaseAdmin
      .from("stores")
      .select(`
        id, name, slug, description, phone, email, isVerified, createdAt,
        userId,
        owner:users!stores_userId_fkey(id, name, email),
        products:products(id)
      `)
      .order("createdAt", { ascending: false });

    if (error) throw error;

    const enriched = (data ?? []).map((s) => ({
      ...s,
      productCount: Array.isArray(s.products) ? s.products.length : 0,
      products: undefined,
    }));

    return NextResponse.json({ success: true, data: enriched });
  } catch (err) {
    console.error("[GET /api/admin/stores]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
