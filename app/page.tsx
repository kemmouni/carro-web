import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { HeroBanner }      from "@/components/sections/HeroBanner";
import { QuickCategories } from "@/components/sections/QuickCategories";
import { TrustBadges }     from "@/components/sections/TrustBadges";
import { RecentlyViewed }  from "@/components/sections/RecentlyViewed";
import { ProductCard }     from "@/components/ui/ProductCard";
import { BrandLogo }       from "@/components/ui/BrandLogo";
import { supabaseAdmin }   from "@/lib/supabase";
import type { Product, Brand } from "@/lib/types";

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

async function getPopularBrands(): Promise<Brand[]> {
  const { data } = await supabaseAdmin
    .from("brands")
    .select("id, name, slug, logoUrl, country, isPopular, sortOrder, createdAt")
    .eq("isPopular", true)
    .order("sortOrder", { ascending: true })
    .limit(16);
  return (data ?? []) as Brand[];
}


// ─── Section wrapper ──────────────────────────────────────
function Section({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 md:mb-12">
      <div className="flex items-center justify-between mb-3 md:mb-5">
        <h2 className="text-[16px] md:text-[22px] font-black text-white tracking-tight">{title}</h2>
        <Link href={href} className="orange-link text-[12px] md:text-[13px]">See all <ChevronRight size={13} /></Link>
      </div>
      {children}
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────
export default async function HomePage() {
  const [featured, arrivals, popularBrands] = await Promise.all([getFeaturedProducts(), getNewArrivals(), getPopularBrands()]);

  return (
    <>
      {/* Desktop hero — hidden on mobile */}
      <div className="hidden md:block">
        <HeroBanner />
      </div>

      {/* Categories — circles on mobile, bar on desktop */}
      <QuickCategories />

      {/* ── MOBILE CONTENT ── */}
      <div className="md:hidden px-4 pt-2 pb-4 space-y-6">

        {/* Featured Products — horizontal scroll */}
        {featured.length > 0 && (
          <Section title="Featured" href="/search?featured=true">
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} className="min-w-[155px] w-[155px] flex-shrink-0" />
              ))}
            </div>
          </Section>
        )}

        {/* New Arrivals — 2-column grid */}
        <Section title="New Arrivals" href="/search?sort=newest">
          {arrivals.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {arrivals.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm py-4">No products yet.</p>
          )}
        </Section>

        {/* Popular Brands — horizontal scroll */}
        {popularBrands.length > 0 && (
          <section className="mb-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[16px] font-black text-white">Brands</h2>
              <Link href="/search" className="orange-link text-[12px]">See all <ChevronRight size={13} /></Link>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {popularBrands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/search?carMake=${encodeURIComponent(brand.name)}`}
                  className="flex flex-col items-center gap-2 flex-shrink-0 w-16"
                >
                  <div className="w-12 h-12 rounded-full bg-dark-secondary border border-dark-border flex items-center justify-center overflow-hidden">
                    {brand.logoUrl ? (
                      <Image src={brand.logoUrl} alt={brand.name} width={40} height={40} className="object-contain p-1" />
                    ) : (
                      <BrandLogo name={brand.name} size={28} />
                    )}
                  </div>
                  <span className="text-[9px] font-semibold text-gray-500 text-center uppercase tracking-wide truncate w-full text-center">
                    {brand.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── DESKTOP CONTENT ── */}
      <div className="hidden md:block max-w-screen-xl mx-auto px-6 pt-10">

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

        {/* Popular Brands */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Popular Brands</h2>
            <Link href="/search" className="orange-link text-[13px]">View all <ChevronRight size={14} /></Link>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
            {popularBrands.map((brand) => (
              <Link
                key={brand.id}
                href={`/search?carMake=${encodeURIComponent(brand.name)}`}
                className="card flex flex-col items-center gap-3 px-6 py-5 min-w-[130px] flex-shrink-0 hover:border-brand-orange transition-all duration-200 group"
              >
                <div className="h-10 w-[72px] flex items-center justify-center relative">
                  {brand.logoUrl ? (
                    <Image
                      src={brand.logoUrl}
                      alt={brand.name}
                      fill
                      className="object-contain filter brightness-75 group-hover:brightness-100 transition-all"
                    />
                  ) : (
                    <div className="text-gray-400 group-hover:text-white transition-colors">
                      <BrandLogo name={brand.name} size={44} />
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-bold text-gray-500 group-hover:text-brand-orange tracking-wide uppercase transition-colors">
                  {brand.name}
                </span>
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

          <RecentlyViewed />
        </div>
      </div>
    </>
  );
}
