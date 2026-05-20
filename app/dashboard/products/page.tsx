import { supabaseAdmin } from "@/lib/supabase";
import { getSellerStore } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Pencil, Eye, Package } from "lucide-react";
import { DeleteProductButton } from "@/components/dashboard/DeleteProductButton";

const CONDITION_BADGE: Record<string, string> = {
  NEW:      "bg-green-500/15 text-green-400",
  LIKE_NEW: "bg-blue-500/15 text-blue-400",
  USED:     "bg-gray-500/15 text-gray-400",
};

export default async function DashboardProductsPage() {
  const store = await getSellerStore();
  if (!store) redirect("/auth/login");

  const { data: products } = await supabaseAdmin
    .from("products")
    .select(`*, category:categories(name), images:product_images(url, "isPrimary", "sortOrder")`)
    .eq("storeId", store.id)
    .order("createdAt", { ascending: false });

  const items = (products ?? []).map((p: Record<string, unknown>) => ({
    ...p,
    images: ((p.images as Array<{ sortOrder: number }>) ?? []).sort((a, b) => a.sortOrder - b.sortOrder),
  }));

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">{items.length} product{items.length !== 1 ? "s" : ""} in your store</p>
        </div>
        <Link href="/dashboard/products/new" className="btn-primary">
          <PlusCircle size={16} />
          Add Product
        </Link>
      </div>

      {/* Products table */}
      {items.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <Package size={48} className="text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No products yet</h3>
          <p className="text-gray-500 text-sm mb-6">Start selling by adding your first product.</p>
          <Link href="/dashboard/products/new" className="btn-primary">Add First Product</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Product</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5 hidden md:table-cell">Category</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5">Price</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5 hidden lg:table-cell">Condition</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5 hidden lg:table-cell">Status</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5 hidden lg:table-cell">Views</th>
                <th className="px-4 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {items.map((p) => {
                const product = p as unknown as {
                  id: string; title: string; price: number; originalPrice?: number;
                  condition: string; isActive: boolean; viewCount: number;
                  category: { name: string };
                  images: Array<{ url: string }>;
                };
                const img = product.images[0]?.url;
                return (
                  <tr key={product.id} className="hover:bg-dark-secondary/50 transition-colors group">
                    {/* Product */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-dark-input flex-shrink-0 overflow-hidden">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={14} className="text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-white truncate max-w-[200px]">{product.title}</p>
                          {product.originalPrice && (
                            <p className="text-[11px] text-gray-600 line-through">{product.originalPrice} QAR</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-[12px] text-gray-400">{product.category?.name ?? "—"}</span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3.5">
                      <span className="text-[14px] font-bold text-brand-orange">{product.price.toLocaleString()} QAR</span>
                    </td>

                    {/* Condition */}
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${CONDITION_BADGE[product.condition] ?? ""}`}>
                        {product.condition.replace("_", " ")}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${product.isActive ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Views */}
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-[12px] text-gray-400 flex items-center gap-1">
                        <Eye size={11} /> {product.viewCount}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/dashboard/products/${product.id}`} className="p-1.5 rounded-lg hover:bg-dark-input text-gray-400 hover:text-white transition-colors" title="Edit">
                          <Pencil size={14} />
                        </Link>
                        <Link href={`/product/${product.id}`} target="_blank" className="p-1.5 rounded-lg hover:bg-dark-input text-gray-400 hover:text-white transition-colors" title="View">
                          <Eye size={14} />
                        </Link>
                        <DeleteProductButton productId={product.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
