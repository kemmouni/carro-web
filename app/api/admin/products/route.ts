import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase";

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
      .from("products")
      .select(`id, title, price, condition, isActive, isFeatured, approvalStatus, createdAt,
               category:categories(name),
               store:stores(id, name, slug),
               images:product_images(url, isPrimary, sortOrder)`)
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (err) {
    console.error("[GET /api/admin/products]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
