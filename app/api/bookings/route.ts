import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, createSupabaseServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const { productId, customerName, customerPhone, bookingDate, bookingTime, notes } = body;

    if (!productId || !customerName || !customerPhone || !bookingDate || !bookingTime) {
      return NextResponse.json({ success: false, error: "All required fields must be provided" }, { status: 400 });
    }

    const { data: product } = await supabaseAdmin
      .from("products")
      .select("id, title, storeId, isActive")
      .eq("id", productId)
      .single();

    if (!product) return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    if (!product.isActive) return NextResponse.json({ success: false, error: "Service is no longer available" }, { status: 400 });

    const { error } = await supabaseAdmin.from("bookings").insert({
      productId,
      storeId:       product.storeId,
      customerId:    user?.id ?? null,
      customerName:  customerName.trim(),
      customerPhone: customerPhone.trim(),
      bookingDate,
      bookingTime,
      notes:         notes?.trim() ?? null,
      status:        "PENDING",
    });
    if (error) throw error;

    // Notify seller
    const { data: store } = await supabaseAdmin
      .from("stores")
      .select("userId")
      .eq("id", product.storeId)
      .single();

    if (store?.userId) {
      await supabaseAdmin.from("notifications").insert({
        id:      crypto.randomUUID(),
        userId:  store.userId,
        type:    "new_booking",
        title:   "New appointment booked!",
        message: `${customerName} booked "${product.title}" on ${bookingDate} at ${bookingTime}`,
        link:    "/dashboard/bookings",
      });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/bookings]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
