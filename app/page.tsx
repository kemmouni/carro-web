import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { HeroBanner }      from "@/components/sections/HeroBanner";
import { QuickCategories } from "@/components/sections/QuickCategories";
import { TrustBadges }     from "@/components/sections/TrustBadges";
import { ProductCard }     from "@/components/ui/ProductCard";
import { supabaseAdmin }   from "@/lib/supabase";
import type { Product } from "@/lib/types";

// ─── Helpers ─────────────────────────────────────────────
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

async function getFeaturedProducts(): Promise<Product[]> {
  const { data } = await supabaseAdmin
    .from("products")
    .select('*, category:categories(id,name,slug), store:stores(id,name,slug,city,"isVerified"), images:product_images(id,url,"isPrimary","sortOrder")')
    .eq("isActive", true).eq("isFeatured", true)
    .order("createdAt", { ascending: false }).limit(8);
  return (data ?? []).map(normalizeProduct);
}

async function getNewArrivals(): Promise<Product[]> {
  const { data } = await supabaseAdmin
    .from("products")
    .select('*, category:categories(id,name,slug), store:stores(id,name,slug,city,"isVerified"), images:product_images(id,url,"isPrimary","sortOrder")')
    .eq("isActive", true)
    .order("createdAt", { ascending: false }).limit(6);
  return (data ?? []).map(normalizeProduct);
}

const BRANDS = ["TOYOTA","NISSAN","BMW","Mercedes-Benz","LEXUS","HONDA","KIA"];

// ─── Section wrapper ──────────────────────────────────────
function Section({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-title">{title}</h2>
        <Link href={href} className="orange-link">View all <ChevronRight size={14} /></Link>
      </div>
      {children}
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────
export default async function HomePage() {
  const [featured, arrivals] = await Promise.all([getFeaturedProducts(), getNewArrivals()]);

  return (
    <>
      <HeroBanner />
      <QuickCategories />

      <div className="max-w-screen-xl mx-auto px-6 pt-10">

        <Section title="Featured Products" href="/search?featured=true">
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
            {featured.length > 0 ? featured.map((p) => (
              <ProductCard key={p.id} product={p} className="min-w-[220px] w-[220px] flex-shrink-0" />
            )) : <p className="text-gray-500 text-sm py-4">No featured products yet.</p>}
          </div>
        </Section>

        <Section title="New Arrivals" href="/search?sort=newest">
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
            {arrivals.length > 0 ? arrivals.map((p) => (
              <ProductCard key={p.id} product={p} variant="compact" className="min-w-[240px] flex-shrink-0" />
            )) : <p className="text-gray-500 text-sm py-4">No products yet.</p>}
          </div>
        </Section>

        <section className="mb-12">
          <h2 className="section-title mb-5">Popular Brands</h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {BRANDS.map((brand) => (
              <Link key={brand} href={`/search?brand=${encodeURIComponent(brand)}`}
                className="card flex items-center gap-3 px-6 py-4 min-w-[160px] flex-shrink-0 hover:border-brand-orange transition-colors group">
                <div className="w-8 h-8 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                  <span className="text-[18px] font-black text-brand-orange">{brand[0]}</span>
                </div>
                <span className="text-[13px] font-bold text-white">{brand}</span>
              </Link>
            ))}
          </div>
        </section>

        <TrustBadges />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mb-12">
          <Section title="Trending Categories" href="/browse">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {arrivals.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} className="" />
              ))}
            </div>
          </Section>

          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="section-title">Recently Viewed</h2>
              <Link href="/account/history" className="orange-link">View All <ChevronRight size={14} /></Link>
            </div>
            <div className="card overflow-hidden divide-y divide-dark-border">
              {featured.slice(0, 3).map((p) => (
                <Link key={p.id} href={`/product/${p.id}`} className="flex items-center gap-3 p-3.5 hover:bg-dark-secondary transition-colors group">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-dark-secondary">
                    {p.images[0] && <Image src={p.images[0].url} alt={p.title} fill className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-white truncate">{p.title}</p>
                    <p className="text-[13px] font-bold text-brand-orange mt-0.5">{p.currency ?? "QAR"} {p.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
