import { NextResponse } from "next/server";
import { supabaseAdmin, createSupabaseServerClient } from "@/lib/supabase";

// GET — seller sees orders for their store
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { data: store } = await supabaseAdmin.from("stores").select("id").eq("userId", user.id).maybeSingle();
    if (!store) return NextResponse.json({ success: false, error: "No store" }, { status: 403 });

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        items:order_items(
          id, quantity, price,
          product:products(id, title, images:product_images(url, isPrimary, sortOrder))
        )
      `)
      .eq("storeId", store.id)
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (err) {
    console.error("[GET /api/dashboard/orders]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
