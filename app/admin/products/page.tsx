import { supabaseAdmin } from "@/lib/supabase";
import ProductModerationClient from "./ProductModerationClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const { data } = await supabaseAdmin
    .from("products")
    .select(`id, title, price, currency, condition, brand, carMake, carModel,
             description, isActive, isFeatured, approvalStatus, "listingType", createdAt,
             category:categories(id, name, slug),
             store:stores(id, name, slug),
             images:product_images(url, isPrimary, sortOrder)`)
    .order("createdAt", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ProductModerationClient initialProducts={(data ?? []) as any} />;
}
