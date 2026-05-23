import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, createSupabaseServerClient } from "@/lib/supabase";

const VALID_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

// PUT — seller updates order status
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { data: store } = await supabaseAdmin.from("stores").select("id").eq("userId", user.id).maybeSingle();
    if (!store) return NextResponse.json({ success: false, error: "No store" }, { status: 403 });

    const body = await req.json();
    const { status } = body;

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({ status, updatedAt: new Date().toISOString() })
      .eq("id", id)
      .eq("storeId", store.id)
      .select()
      .single();

    if (error) throw error;

    // Notify buyer
    if (data) {
      const notifTitle   = status === "CONFIRMED" ? "Order confirmed!" : status === "SHIPPED" ? "Your order is on the way!" : status === "DELIVERED" ? "Order delivered!" : "Order update";
      const notifMessage = status === "CONFIRMED" ? "Your order has been confirmed by the seller." : status === "SHIPPED" ? "Your order has been shipped and is on its way." : status === "DELIVERED" ? "Your order has been marked as delivered." : `Your order status changed to ${status.toLowerCase()}.`;

      await supabaseAdmin.from("notifications").insert({
        id:      crypto.randomUUID(),
        userId:  data.buyerId,
        type:    `order_${status.toLowerCase()}`,
        title:   notifTitle,
        message: notifMessage,
        link:    "/dashboard/orders",
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[PUT /api/dashboard/orders/:id]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
