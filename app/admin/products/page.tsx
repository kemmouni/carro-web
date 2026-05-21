import { supabaseAdmin } from "@/lib/supabase";
import ProductModerationClient from "./ProductModerationClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const { data } = await supabaseAdmin
    .from("products")
    .select(`id, title, price, condition, isActive, isFeatured, approvalStatus, createdAt,
             category:categories(name),
             store:stores(id, name, slug),
             images:product_images(url, isPrimary, sortOrder)`)
    .order("createdAt", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ProductModerationClient initialProducts={(data ?? []) as any} />;
}
