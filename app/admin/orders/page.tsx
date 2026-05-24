import { supabaseAdmin } from "@/lib/supabase";
import OrdersClient from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const { data } = await supabaseAdmin
    .from("orders")
    .select(`
      id, status, totalAmount, currency, paymentMethod, paymentStatus,
      buyerName, buyerEmail, buyerPhone, shippingAddress, notes, createdAt, updatedAt,
      store:stores(id, name, slug),
      items:order_items(
        id, quantity, price,
        product:products(id, title, images:product_images(url, isPrimary))
      )
    `)
    .order("createdAt", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <OrdersClient initialOrders={(data ?? []) as any} />;
}
