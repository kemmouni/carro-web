import { supabaseAdmin } from "@/lib/supabase";
import BrandLogoManager from "./BrandLogoManager";

async function getBrands() {
  const { data } = await supabaseAdmin
    .from("brands")
    .select("*")
    .order("sortOrder", { ascending: true });
  return data ?? [];
}

export const metadata = { title: "Brands — Admin" };

export default async function AdminBrandsPage() {
  const brands = await getBrands();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Car Brands</h1>
      <p className="text-gray-400 text-sm mb-8">
        Upload logos for each car brand. Logos appear in the &ldquo;Browse by Brand&rdquo; section.
        Recommended: PNG with transparent background, at least 200×100px.
      </p>

      <BrandLogoManager brands={brands} />
    </div>
  );
}
