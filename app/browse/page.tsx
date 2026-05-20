import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { CategoryCard } from "@/components/ui/CategoryCard";
import type { Category } from "@/lib/types";

const BRANDS = ["Toyota", "Nissan", "BMW", "Mercedes-Benz", "Lexus", "Honda", "KIA", "Hyundai", "Ford"];

export const metadata = { title: "Browse Parts — Carro Qatar" };

export default async function BrowsePage() {
  const { data: cats } = await supabaseAdmin
    .from("categories")
    .select(`*, products:products(id)`)
    .order("sortOrder");

  const categories: Category[] = (cats ?? []).map((c: Record<string, unknown>) => ({
    ...(c as Category),
    _count: { products: Array.isArray(c.products) ? (c.products as unknown[]).length : 0 },
    products: undefined,
  }));

  return (
    <div className="bg-dark-primary min-h-screen">

      {/* Header */}
      <div className="bg-dark-secondary border-b border-dark-border py-8">
        <div className="max-w-screen-xl mx-auto px-6">
          <h1 className="text-3xl font-black mb-1.5">Browse Categories</h1>
          <p className="text-[13px] text-gray-400">Find the right auto parts for your vehicle in Qatar</p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 pt-8 pb-16">

        {/* All categories */}
        {categories.length > 0 && (
          <section className="mb-12">
            <h2 className="section-title mb-5">All Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          </section>
        )}

        {/* Browse all */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Browse All Listings</h2>
            <Link href="/search" className="orange-link">
              View All
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                href={`/search?category=${cat.slug}`}
                className="card p-5 flex items-center gap-3 hover:border-brand-orange transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-orange-light flex items-center justify-center flex-shrink-0">
                  <svg className="text-brand-orange" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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

        {/* Popular Brands */}
        <section className="mb-12">
          <h2 className="section-title mb-5">Popular Brands</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
            {BRANDS.map((b) => (
              <Link
                key={b}
                href={`/search?carMake=${encodeURIComponent(b)}`}
                className="card py-5 flex flex-col items-center gap-2 hover:border-brand-orange transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-dark-input flex items-center justify-center">
                  <span className="text-[16px] font-black text-gray-400 group-hover:text-brand-orange transition-colors">{b[0]}</span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 group-hover:text-white tracking-wide text-center">{b}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
