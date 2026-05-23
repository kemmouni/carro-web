import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, createSupabaseServerClient } from "@/lib/supabase";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { status, counterPrice } = body;

    const allowed = ["ACCEPTED", "DECLINED", "COUNTERED"];
    if (!status || !allowed.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    // Verify offer belongs to seller's store
    const { data: offer } = await supabaseAdmin
      .from("offers")
      .select("id, buyerId, buyerName, proposedPrice, productId, storeId, product:products(title)")
      .eq("id", id)
      .single();

    if (!offer) return NextResponse.json({ success: false, error: "Offer not found" }, { status: 404 });

    const { data: store } = await supabaseAdmin
      .from("stores")
      .select("id")
      .eq("id", offer.storeId)
      .eq("userId", user.id)
      .single();

    if (!store) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

    const update: Record<string, unknown> = { status, updatedAt: new Date().toISOString() };
    if (status === "COUNTERED" && counterPrice) update.counterPrice = +counterPrice;

    await supabaseAdmin.from("offers").update(update).eq("id", id);

    // Notify buyer
    const prod = offer.product as unknown as { title: string } | null;
    const productTitle = prod?.title ?? "your item";
    const messages: Record<string, string> = {
      ACCEPTED:  `Your offer of ${offer.proposedPrice} QAR for "${productTitle}" was accepted!`,
      DECLINED:  `Your offer for "${productTitle}" was declined.`,
      COUNTERED: `The seller countered your offer on "${productTitle}" with ${counterPrice} QAR.`,
    };

    await supabaseAdmin.from("notifications").insert({
      id:      crypto.randomUUID(),
      userId:  offer.buyerId,
      type:    "offer_update",
      title:   status === "ACCEPTED" ? "Offer accepted!" : status === "COUNTERED" ? "Counter offer received" : "Offer declined",
      message: messages[status],
      link:    "/dashboard/offers",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PUT /api/dashboard/offers/[id]]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
