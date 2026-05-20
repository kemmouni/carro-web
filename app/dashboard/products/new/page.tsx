import { supabaseAdmin } from "@/lib/supabase";
import { getSellerStore } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProductForm } from "@/components/dashboard/ProductForm";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function NewProductPage() {
  const store = await getSellerStore();
  if (!store) redirect("/auth/login");

  const { data: categories } = await supabaseAdmin
    .from("categories").select("id, name").order("sortOrder");

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
        <ChevronRight size={12} />
        <Link href="/dashboard/products" className="hover:text-white transition-colors">Products</Link>
        <ChevronRight size={12} />
        <span className="text-white">New Product</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Add New Product</h1>
        <p className="text-gray-500 text-sm mt-0.5">Fill in the details to list your product for sale.</p>
      </div>

      <ProductForm categories={categories ?? []} storeId={store.id} />
    </div>
  );
}
