import Link from "next/link";
import Image from "next/image";
import { supabaseAdmin } from "@/lib/supabase";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { BrandLogo }    from "@/components/ui/BrandLogo";
import type { Category, Brand } from "@/lib/types";

export const dynamic = "force-dynamic"; // always fetch fresh data

export const metadata = { title: "Browse Parts — Carro Qatar" };

export default async function BrowsePage() {
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

  return (
    <div className="bg-dark-primary min-h-screen">

      {/* Header */}
      <div className="bg-dark-secondary border-b border-dark-border py-10">
        <div className="max-w-screen-xl mx-auto px-6">
          <h1 className="text-3xl font-black mb-1.5 text-white">Browse Categories</h1>
          <p className="text-[14px] text-gray-400">Find the right auto parts for your vehicle in Qatar</p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 pt-10 pb-16 space-y-14">

        {/* All categories */}
        {categories.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title">All Categories</h2>
              <Link href="/search" className="orange-link text-[13px]">View all parts →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          </section>
        )}

        {/* Popular Brands */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">Popular Brands</h2>
            <Link href="/search" className="orange-link text-[13px]">View all brands →</Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/search?carMake=${encodeURIComponent(brand.name)}`}
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

        {/* Quick links row */}
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

      </div>
    </div>
  );
}
