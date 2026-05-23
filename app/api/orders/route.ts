import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, createSupabaseServerClient } from "@/lib/supabase";

// GET — buyer sees their own orders
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        items:order_items(
          id, quantity, price,
          product:products(id, title, images:product_images(url, isPrimary, sortOrder))
        )
      `)
      .eq("buyerId", user.id)
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (err) {
    console.error("[GET /api/orders]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST — buyer places a COD order
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Sign in to place an order" }, { status: 401 });

    const body = await req.json();
    const { productId, quantity = 1, buyerName, buyerPhone, deliveryAddress, notes } = body;

    if (!productId || !buyerName || !buyerPhone || !deliveryAddress) {
      return NextResponse.json({ success: false, error: "productId, buyerName, buyerPhone, and deliveryAddress are required" }, { status: 400 });
    }

    // Fetch product + store
    const { data: product, error: pErr } = await supabaseAdmin
      .from("products")
      .select("id, title, price, currency, storeId, isActive")
      .eq("id", productId)
      .single();

    if (pErr || !product) return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    if (!product.isActive) return NextResponse.json({ success: false, error: "Product is no longer available" }, { status: 400 });

    const total = (product.price as number) * quantity;
    const orderId = crypto.randomUUID();

    // Create order
    const { error: oErr } = await supabaseAdmin.from("orders").insert({
      id:              orderId,
      buyerId:         user.id,
      storeId:         product.storeId,
      status:          "PENDING",
      total,
      currency:        product.currency ?? "QAR",
      paymentMethod:   "COD",
      buyerName:       buyerName.trim(),
      buyerPhone:      buyerPhone.trim(),
      deliveryAddress: deliveryAddress.trim(),
      notes:           notes?.trim() ?? null,
      createdAt:       new Date().toISOString(),
      updatedAt:       new Date().toISOString(),
    });
    if (oErr) throw oErr;

    // Create order item
    const { error: iErr } = await supabaseAdmin.from("order_items").insert({
      id:        crypto.randomUUID(),
      orderId,
      productId: product.id,
      quantity,
      price:     product.price,
    });
    if (iErr) throw iErr;

    // Notify store owner
    const { data: store } = await supabaseAdmin.from("stores").select("userId, name").eq("id", product.storeId).single();
    if (store?.userId) {
      await supabaseAdmin.from("notifications").insert({
        id:      crypto.randomUUID(),
        userId:  store.userId,
        type:    "order_placed",
        title:   "New COD order received!",
        message: `${buyerName} ordered "${product.title}" — ${total} ${product.currency}`,
        link:    "/dashboard/orders",
      });
    }

    return NextResponse.json({ success: true, data: { orderId, total, currency: product.currency } }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
