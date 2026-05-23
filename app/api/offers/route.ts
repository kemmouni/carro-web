import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, createSupabaseServerClient } from "@/lib/supabase";

// POST — buyer submits an offer
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Sign in to make an offer" }, { status: 401 });

    const body = await req.json();
    const { productId, buyerName, buyerPhone, proposedPrice, message } = body;

    if (!productId || !buyerName || !buyerPhone || !proposedPrice) {
      return NextResponse.json({ success: false, error: "productId, buyerName, buyerPhone, and proposedPrice are required" }, { status: 400 });
    }

    const { data: product } = await supabaseAdmin
      .from("products")
      .select("id, title, price, storeId, isActive")
      .eq("id", productId)
      .single();

    if (!product) return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    if (!product.isActive) return NextResponse.json({ success: false, error: "Product is no longer available" }, { status: 400 });

    const { error } = await supabaseAdmin.from("offers").insert({
      productId,
      storeId:       product.storeId,
      buyerId:       user.id,
      buyerName:     buyerName.trim(),
      buyerPhone:    buyerPhone.trim(),
      proposedPrice: +proposedPrice,
      message:       message?.trim() ?? null,
      status:        "PENDING",
    });
    if (error) throw error;

    // Notify seller
    const { data: store } = await supabaseAdmin
      .from("stores")
      .select("userId, name")
      .eq("id", product.storeId)
      .single();

    if (store?.userId) {
      await supabaseAdmin.from("notifications").insert({
        id:      crypto.randomUUID(),
        userId:  store.userId,
        type:    "new_offer",
        title:   "New offer received!",
        message: `${buyerName} offered ${proposedPrice} QAR for "${product.title}"`,
        link:    "/dashboard/offers",
      });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/offers]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
