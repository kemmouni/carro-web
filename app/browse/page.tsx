import { Search, ChevronDown } from "lucide-react";
import Link from "next/link";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { ProductCard }  from "@/components/ui/ProductCard";
import type { Category, Product } from "@/lib/types";

// ── Mock data ──────────────────────────────────────────────
const CATEGORIES: Category[] = [
  { id:"c1", name:"Engine & Drivetrain",     slug:"engine",      imageUrl:"/images/cat-engine.png",    _count:{products:1240} },
  { id:"c2", name:"Brakes & Suspension",     slug:"brakes",      imageUrl:"/images/cat-brakes.png",    _count:{products:1240} },
  { id:"c3", name:"Electrical & Lighting",   slug:"electrical",  imageUrl:"/images/cat-electrical.png",_count:{products:1240} },
  { id:"c4", name:"AC & Heating",            slug:"ac-heating",  imageUrl:"/images/cat-ac.png",        _count:{products:1240} },
  { id:"c5", name:"Filters & Fluids",        slug:"filters",     imageUrl:"/images/cat-filters.png",   _count:{products:1240} },
  { id:"c6", name:"Body & Exterior",         slug:"body",        imageUrl:"/images/cat-body.png",      _count:{products:1240} },
  { id:"c7", name:"Interior & Accessories",  slug:"interior",    imageUrl:"/images/cat-interior.png",  _count:{products:1240} },
  { id:"c8", name:"Wheels & Tires",          slug:"wheels",      imageUrl:"/images/cat-wheels.png",    _count:{products:1240} },
];

const BRANDS = ["TOYOTA","NISSAN","BMW","MERCEDES","LEXUS","HONDA"];

const TRENDING_CATEGORIES = [
  { label:"Brake Kits",          img:"/images/brake-disc.jpg",       count:2890 },
  { label:"Cold Air Intakes",    img:"/images/cold-air-intake.jpg",  count:1756 },
  { label:"LED Headlight Bulbs", img:"/images/led-bulbs.jpg",        count:3412 },
  { label:"Suspension Kits",     img:"/images/suspension-kits.jpg",  count:2101 },
];

export const metadata = { title: "Browse Categories" };

export default function BrowsePage() {
  return (
    <div className="bg-dark-primary min-h-screen">

      {/* Page header */}
      <div className="bg-dark-secondary border-b border-dark-border py-8">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <h1 className="text-3xl font-black mb-1.5">Browse Categories</h1>
              <p className="text-[13px] text-gray-400">Find the right auto parts for your vehicle</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-[360px]">
                <input
                  type="text"
                  placeholder="Search for parts, categories, or brands..."
                  className="input pr-10"
                />
                <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
              <button className="flex items-center gap-2 h-11 px-4 bg-dark-card border border-dark-border rounded-xl text-[13px] font-medium text-white hover:border-brand-orange transition-colors whitespace-nowrap">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                Filter by Car Model
                <ChevronDown size={13} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 pt-8 pb-16">

        {/* All categories grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>

        {/* Popular Brands */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Popular Brands</h2>
            <Link href="/brands" className="orange-link">View All Brands <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {BRANDS.map((b) => (
              <Link
                key={b}
                href={`/search?brand=${b}`}
                className="card py-5 flex flex-col items-center gap-2 hover:border-brand-orange transition-colors group"
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <span className="text-sm font-black text-gray-400 group-hover:text-white transition-colors">{b[0]}</span>
                </div>
                <span className="text-[11px] font-bold text-gray-400 group-hover:text-white tracking-wide">{b}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending categories */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Trending Categories</h2>
            <Link href="/search?sort=trending" className="orange-link">View All <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TRENDING_CATEGORIES.map((t) => (
              <Link
                key={t.label}
                href={`/search?q=${encodeURIComponent(t.label)}`}
                className="card card-hover group overflow-hidden"
              >
                <div className="relative aspect-square bg-dark-secondary overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/images/placeholder.jpg')] bg-cover bg-center opacity-60 transition-transform duration-300 group-hover:scale-105" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-orange text-white uppercase">Trending</span>
                </div>
                <div className="p-3">
                  <p className="text-[13px] font-semibold text-white mb-0.5">{t.label}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] text-gray-400">{t.count.toLocaleString()} parts</p>
                    <svg className="text-brand-orange" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
