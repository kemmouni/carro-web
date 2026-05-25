import { supabaseAdmin } from "@/lib/supabase";
import { getSellerStore } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductForm } from "@/components/dashboard/ProductForm";
import { ListingTypePicker } from "@/components/dashboard/ListingTypePicker";

export const dynamic = "force-dynamic";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const store = await getSellerStore();
  if (!store) redirect("/auth/login");

  const { type } = await searchParams;

  const { data: categories } = await supabaseAdmin
    .from("categories").select("id, name").order("sortOrder");

  // No type selected → show picker
  if (!type || !["part", "service", "car"].includes(type)) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 text-[12px] text-gray-500 mb-6">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <ChevronRight size={12} />
          <span className="text-white">New Listing</span>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">What are you listing?</h1>
          <p className="text-gray-500 text-sm mt-1">Choose the type of listing you want to create.</p>
        </div>

        <ListingTypePicker />
      </div>
    );
  }

  const listingType = type === "service" ? "SERVICE" : type === "car" ? "CAR" : "PART";
  const typeLabel   = type === "service" ? "Service" : type === "car" ? "Car for Sale" : "Auto Part";

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-[12px] text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
        <ChevronRight size={12} />
        <Link href="/dashboard/products" className="hover:text-white">Products</Link>
        <ChevronRight size={12} />
        <Link href="/dashboard/products/new" className="hover:text-white">New Listing</Link>
        <ChevronRight size={12} />
        <span className="text-white">{typeLabel}</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Add {typeLabel}</h1>
        <p className="text-gray-500 text-sm mt-0.5">Fill in the details to list your {typeLabel.toLowerCase()}.</p>
      </div>

      <ProductForm categories={categories ?? []} storeId={store.id} listingType={listingType} />
    </div>
  );
}
