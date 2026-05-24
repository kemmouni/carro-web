import { supabaseAdmin } from "@/lib/supabase";
import BookingsClient from "./BookingsClient";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const { data } = await supabaseAdmin
    .from("bookings")
    .select(`
      id, status, customerName, customerPhone, bookingDate, bookingTime, notes, createdAt,
      store:stores(id, name, slug),
      product:products(id, title)
    `)
    .order("createdAt", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <BookingsClient initialBookings={(data ?? []) as any} />;
}
