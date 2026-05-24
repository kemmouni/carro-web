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
      .from("orders")
      .select(`
        id, status, totalAmount, currency, paymentMethod, paymentStatus,
        buyerName, buyerEmail, buyerPhone, shippingAddress,
        notes, createdAt, updatedAt,
        store:stores(id, name, slug),
        items:order_items(
          id, quantity, price,
          product:products(id, title, images:product_images(url, isPrimary))
        )
      `)
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (err) {
    console.error("[GET /api/admin/orders]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
