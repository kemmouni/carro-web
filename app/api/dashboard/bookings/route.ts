import { NextResponse } from "next/server";
import { supabaseAdmin, createSupabaseServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { data: store } = await supabaseAdmin
      .from("stores").select("id").eq("userId", user.id).single();

    if (!store) return NextResponse.json({ success: true, data: [] });

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select(`*, product:products(id, title, images:product_images(url, isPrimary, sortOrder))`)
      .eq("storeId", store.id)
      .order("bookingDate", { ascending: true })
      .order("bookingTime", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (err) {
    console.error("[GET /api/dashboard/bookings]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
