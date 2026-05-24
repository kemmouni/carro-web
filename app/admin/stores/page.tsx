import { supabaseAdmin } from "@/lib/supabase";
import StoresClient from "./StoresClient";

export const dynamic = "force-dynamic";

export default async function AdminStoresPage() {
  // Step 1: get all stores
  const { data: stores } = await supabaseAdmin
    .from("stores")
    .select("id, name, slug, description, phone, email, isVerified, createdAt, userId, products:products(id)")
    .order("createdAt", { ascending: false });

  // Step 2: get all user profiles for those stores
  const userIds = [...new Set((stores ?? []).map((s) => s.userId).filter(Boolean))];
  const { data: owners } = userIds.length
    ? await supabaseAdmin.from("users").select("id, fullName, email").in("id", userIds)
    : { data: [] };

  const ownerMap = Object.fromEntries((owners ?? []).map((u) => [u.id, u]));

  const enriched = (stores ?? []).map((s) => ({
    id:           s.id,
    name:         s.name,
    slug:         s.slug,
    description:  s.description,
    phone:        s.phone,
    email:        s.email,
    isVerified:   s.isVerified,
    createdAt:    s.createdAt,
    userId:       s.userId,
    productCount: Array.isArray(s.products) ? s.products.length : 0,
    owner:        ownerMap[s.userId] ? {
      id:       ownerMap[s.userId].id,
      fullName: ownerMap[s.userId].fullName,
      email:    ownerMap[s.userId].email,
    } : null,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <StoresClient initialStores={enriched as any} />;
}
