import { supabaseAdmin } from "@/lib/supabase";
import { getSellerStore } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { ProductForm } from "@/components/dashboard/ProductForm";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const store = await getSellerStore();
  if (!store) redirect("/auth/login");

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabaseAdmin
      .from("products")
      .select(`*, images:product_images(id, url, "isPrimary", "sortOrder")`)
      .eq("id", id)
      .eq("storeId", store.id)   // scope to current seller's store
      .single(),
    supabaseAdmin.from("categories").select("id, name").order("sortOrder"),
  ]);

  if (!product) notFound();

  const productData = {
    ...product,
    images: ((product as { images: Array<{ sortOrder: number }> }).images ?? [])
      .sort((a, b) => a.sortOrder - b.sortOrder),
  };

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
        <ChevronRight size={12} />
        <Link href="/dashboard/products" className="hover:text-white transition-colors">Products</Link>
        <ChevronRight size={12} />
        <span className="text-white truncate max-w-[200px]">{(product as { title: string }).title}</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Edit Product</h1>
        <p className="text-gray-500 text-sm mt-0.5">Update your product details.</p>
      </div>

      <ProductForm categories={categories ?? []} product={productData} storeId={store.id} />
    </div>
  );
}
