import Link from "next/link";
import Image from "next/image";
import { supabaseAdmin } from "@/lib/supabase";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { BrandLogo }    from "@/components/ui/BrandLogo";
import { ListingTypeTabs } from "@/components/sections/ListingTypeTabs";
import { TypedCategories } from "@/components/sections/TypedCategories";
import {
  SERVICE_CATEGORIES,
  CAR_BODY_TYPES,
  listingTypeFromSlug,
} from "@/lib/listing-types";
import type { Category, Brand } from "@/lib/types";

// Categories and brands don't change often — cache for 5 minutes
export const revalidate = 300;

export const metadata = { title: "Browse — Carro Qatar" };

type BrowseProps = {
  searchParams: Promise<{ type?: string }>;
};

export default async function BrowsePage({ searchParams }: BrowseProps) {
  const { type: typeSlug } = await searchParams;
  const type = listingTypeFromSlug(typeSlug);

  const [{ data: cats }, { data: brandsData }] = await Promise.all([
    supabaseAdmin.from("categories").select(`*, products:products(id)`).order("sortOrder"),
    supabaseAdmin.from("brands").select("id,name,slug,logoUrl,country,isPopular,sortOrder,createdAt").eq("isPopular", true).order("sortOrder").limit(20),
  ]);

  const categories: Category[] = (cats ?? []).map((c: Record<string, unknown>) => ({
    ...(c as Category),
    _count: { products: Array.isArray(c.products) ? (c.products as unknown[]).length : 0 },
    products: undefined,
  }));

  const brands: Brand[] = (brandsData ?? []) as Brand[];

  const headerTitle =
    type === "SERVICE" ? "Browse Services" :
    type === "CAR"     ? "Cars for Sale"   :
    "Browse Categories";
  const headerSub =
    type === "SERVICE" ? "Find verified service providers across Qatar" :
    type === "CAR"     ? "New, used, and luxury cars from trusted sellers" :
    "Find the right auto parts for your vehicle in Qatar";

  return (
    <div className="bg-dark-primary min-h-screen">

      {/* Header */}
      <div className="bg-dark-secondary border-b border-dark-border py-10">
        <div className="max-w-screen-xl mx-auto px-6">
          <h1 className="text-3xl font-black mb-1.5 text-white">{headerTitle}</h1>
          <p className="text-[14px] text-gray-400">{headerSub}</p>
        </div>
      </div>

      {/* 3-tab switcher (same as home) */}
      <ListingTypeTabs active={type} basePath="/browse" />

      {/* Category strip (Parts: SVG icons; Services: 18 chips; Cars: 12 body types) */}
      <TypedCategories type={type} />

      <div className="max-w-screen-xl mx-auto px-6 pt-10 pb-16 space-y-14">

        {/* ── PARTS: original category cards + brands + quick links ── */}
        {type === "PART" && (
          <>
            {/* Find parts by car CTA */}
            <a
              href="/search/by-car"
              className="block card p-5 flex items-center gap-4 hover:border-brand-orange transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-orange/20 flex items-center justify-center flex-shrink-0">
                <span className="text-brand-orange text-[22px]">🚗</span>
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-bold text-white group-hover:text-brand-orange transition-colors">
                  Find Parts by Car
                </p>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Pick your make, model and year — see all compatible parts
                </p>
              </div>
              <span className="text-gray-500 group-hover:text-brand-orange text-[12px] transition-colors">
                Search →
              </span>
            </a>

            {categories.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="section-title">All Categories</h2>
                  <Link href="/search" className="orange-link text-[13px]">View all parts →</Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categories.map((cat) => <CategoryCard key={cat.id} category={cat} />)}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── SERVICES: a card per service category ── */}
        {type === "SERVICE" && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title">All Services</h2>
              <Link href="/search?type=services" className="orange-link text-[13px]">View all listings →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {SERVICE_CATEGORIES.map((s) => (
                <Link
                  key={s.slug}
                  href={`/search?type=services&service=${s.slug}`}
                  className="card p-5 flex flex-col items-center gap-3 hover:border-brand-orange transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-orange-light flex items-center justify-center text-brand-orange text-[22px] font-black">
                    {s.name.charAt(0)}
                  </div>
                  <div className="text-center">
                    <p className="text-[14px] font-semibold text-white group-hover:text-brand-orange transition-colors">{s.name}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5" dir="rtl">{s.nameAr}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── CARS: a card per body type ── */}
        {type === "CAR" && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title">Browse by Body Type</h2>
              <Link href="/search?type=cars" className="orange-link text-[13px]">View all cars →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {CAR_BODY_TYPES.map((b) => (
                <Link
                  key={b.slug}
                  href={`/search?type=cars&body=${b.slug}`}
                  className="card p-5 flex flex-col items-center gap-3 hover:border-brand-orange transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-orange-light flex items-center justify-center text-brand-orange text-[22px] font-black">
                    {b.name.charAt(0)}
                  </div>
                  <div className="text-center">
                    <p className="text-[14px] font-semibold text-white group-hover:text-brand-orange transition-colors">{b.name}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5" dir="rtl">{b.nameAr}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Popular Brands — show on Parts and Cars tabs */}
        {(type === "PART" || type === "CAR") && brands.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title">Popular Brands</h2>
              <Link href={`/search${type === "CAR" ? "?type=cars" : ""}`} className="orange-link text-[13px]">View all brands →</Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/search?${type === "CAR" ? "type=cars&" : ""}carMake=${encodeURIComponent(brand.name)}`}
                  className="card py-6 flex flex-col items-center gap-3 hover:border-brand-orange transition-all duration-200 group"
                >
                  <div className="h-10 w-[64px] relative flex items-center justify-center">
                    {brand.logoUrl ? (
                      <Image
                        src={brand.logoUrl}
                        alt={brand.name}
                        fill
                        className="object-contain filter brightness-75 group-hover:brightness-100 transition-all"
                      />
                    ) : (
                      <div className="text-gray-400 group-hover:text-white transition-colors">
                        <BrandLogo name={brand.name} size={42} />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 group-hover:text-brand-orange transition-colors tracking-wide text-center uppercase">
                    {brand.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Quick links — Parts only */}
        {type === "PART" && (
          <section>
            <h2 className="section-title mb-6">Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/search?category=${cat.slug}`}
                  className="card p-4 flex items-center gap-3 hover:border-brand-orange transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-brand-orange-light flex items-center justify-center flex-shrink-0">
                    <svg className="text-brand-orange" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-white group-hover:text-brand-orange transition-colors truncate">{cat.name}</p>
                    <p className="text-[11px] text-gray-500">{cat._count?.products ?? 0} parts</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
