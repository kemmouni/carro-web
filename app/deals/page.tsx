import Link from "next/link";
import { Tag, ChevronRight, Percent } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import { ProductCard } from "@/components/ui/ProductCard";
import type { Product } from "@/lib/types";

export const revalidate = 60;

export const metadata = {
  title: "Deals & Discounts — Warsha+ Qatar",
  description: "Shop the best deals on auto parts, services and cars in Qatar. Discounted listings from verified sellers.",
};

function normalizeProduct(p: Record<string, unknown>): Product {
  const images = ((p.images as Array<{ sortOrder: number; url: string; id: string; isPrimary: boolean }>) ?? [])
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    ...p,
    images,
    store: {
      ...(p.store as Record<string, unknown>),
      avgRating: 0, responseRate: 0, totalSales: 0,
      logoUrl: "", coverUrl: "", description: "",
      workingHours: "", phone: "", email: "", website: "",
      address: "", lat: 0, lng: 0, country: "Qatar",
      createdAt: new Date().toISOString(),
      _count: { products: 0, reviews: 0 },
    },
  } as unknown as Product;
}

async function getDeals(): Promise<Product[]> {
  const { data } = await supabaseAdmin
    .from("products")
    .select('*, category:categories(id,name,slug), store:stores(id,name,slug,city,"isVerified"), images:product_images(id,url,"isPrimary","sortOrder")')
    .eq("isActive", true)
    .not("originalPrice", "is", null)
    .gt("originalPrice", 0)
    .order("createdAt", { ascending: false });

  // Only keep products where originalPrice > price (genuine discounts)
  const deals = (data ?? []).filter((p) => {
    const orig = p.originalPrice as number;
    const curr = p.price as number;
    return orig > curr;
  });

  return deals.map(normalizeProduct);
}

function calcDiscount(price: number, original: number): number {
  return Math.round(((original - price) / original) * 100);
}

export default async function DealsPage() {
  const deals = await getDeals();

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-orange/15 flex items-center justify-center">
            <Tag size={20} className="text-brand-orange" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">Deals &amp; Discounts</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {deals.length > 0
                ? `${deals.length} discounted listing${deals.length !== 1 ? "s" : ""} from verified sellers`
                : "Check back soon for new deals"}
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] text-gray-500 mt-4">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-gray-300">Deals</span>
        </div>
      </div>

      {deals.length === 0 ? (
        /* Empty state */
        <div className="card flex flex-col items-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center mb-4">
            <Percent size={32} className="text-brand-orange" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No deals right now</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm">
            Sellers haven&apos;t added discounted listings yet. Browse all products or check back soon.
          </p>
          <Link href="/search" className="btn-primary w-fit">
            Browse All Listings <ChevronRight size={15} />
          </Link>
        </div>
      ) : (
        <>
          {/* Discount summary bar */}
          <div className="flex items-center gap-4 mb-6 overflow-x-auto no-scrollbar pb-1">
            {[10, 20, 30, 50].map((pct) => {
              const count = deals.filter(
                (d) => d.originalPrice && calcDiscount(d.price, d.originalPrice) >= pct
              ).length;
              if (count === 0) return null;
              return (
                <div key={pct} className="flex-shrink-0 px-4 py-2 rounded-xl bg-dark-card border border-dark-border text-center">
                  <p className="text-brand-orange font-black text-lg">{pct}%+</p>
                  <p className="text-gray-500 text-[11px]">{count} item{count !== 1 ? "s" : ""}</p>
                </div>
              );
            })}
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {deals.map((product, i) => (
              <div key={product.id} className="relative">
                {/* Discount badge overlay */}
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                    -{calcDiscount(product.price, product.originalPrice)}%
                  </div>
                )}
                <ProductCard product={product} priority={i < 5} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
