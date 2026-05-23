import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, createSupabaseServerClient } from "@/lib/supabase";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { status } = await req.json();

    const allowed = ["CONFIRMED", "CANCELLED", "COMPLETED"];
    if (!allowed.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select("id, storeId, customerId, customerName, bookingDate, bookingTime, product:products(title)")
      .eq("id", id)
      .single();

    if (!booking) return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });

    const { data: store } = await supabaseAdmin
      .from("stores").select("id").eq("id", booking.storeId).eq("userId", user.id).single();

    if (!store) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

    await supabaseAdmin.from("bookings")
      .update({ status, updatedAt: new Date().toISOString() })
      .eq("id", id);

    // Notify customer if they have an account
    if (booking.customerId) {
      const prod = booking.product as unknown as { title: string } | null;
    const productTitle = prod?.title ?? "service";
      const msgs: Record<string, string> = {
        CONFIRMED:  `Your appointment for "${productTitle}" on ${booking.bookingDate} at ${booking.bookingTime} is confirmed!`,
        CANCELLED:  `Your appointment for "${productTitle}" on ${booking.bookingDate} has been cancelled.`,
        COMPLETED:  `Your appointment for "${productTitle}" is marked as completed. Thanks for visiting!`,
      };
      await supabaseAdmin.from("notifications").insert({
        id:      crypto.randomUUID(),
        userId:  booking.customerId,
        type:    "booking_update",
        title:   status === "CONFIRMED" ? "Appointment confirmed!" : status === "CANCELLED" ? "Appointment cancelled" : "Appointment completed",
        message: msgs[status],
        link:    "/",
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PUT /api/dashboard/bookings/[id]]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
