import { supabaseAdmin } from "@/lib/supabase";
import StoresClient from "./StoresClient";

export const dynamic = "force-dynamic";

export default async function AdminStoresPage() {
  const { data } = await supabaseAdmin
    .from("stores")
    .select(`
      id, name, slug, description, phone, email, isVerified, createdAt, userId,
      owner:users!stores_userId_fkey(id, name, email),
      products:products(id)
    `)
    .order("createdAt", { ascending: false });

  const enriched = (data ?? []).map((s) => ({
    ...s,
    productCount: Array.isArray(s.products) ? s.products.length : 0,
    products: undefined,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <StoresClient initialStores={enriched as any} />;
}
