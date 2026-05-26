import Link from "next/link";
import Image from "next/image";
import { ChevronRight, PackageSearch } from "lucide-react";
import JsonLd, { organizationSchema, websiteSchema } from "@/components/JsonLd";
import { HeroBanner, type BannerSlide } from "@/components/sections/HeroBanner";
import { ListingTypeTabs }   from "@/components/sections/ListingTypeTabs";
import { TypedCategories }   from "@/components/sections/TypedCategories";
import { TrustBadges }       from "@/components/sections/TrustBadges";
import { RecentlyViewed }    from "@/components/sections/RecentlyViewed";
import { ProductCard }       from "@/components/ui/ProductCard";
import { BrandLogo }         from "@/components/ui/BrandLogo";
import { supabaseAdmin }     from "@/lib/supabase";
import type { Product, Brand } from "@/lib/types";
import {
  listingTypeFromSlug,
  type ListingType,
} from "@/lib/listing-types";

// Cache homepage for 60 seconds — products don't need to be real-time
export const revalidate = 60;

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

/**
 * Add listingType filter. Treat null (legacy rows) as PART for back-compat,
 * matching mobile's behavior.
 */
function applyTypeFilter<T extends { or: (q: string) => T; eq: (col: string, v: unknown) => T }>(
  q: T,
  type: ListingType,
): T {
  if (type === "PART") return q.or('"listingType".eq.PART,"listingType".is.null');
  return q.eq('"listingType"', type);
}

async function getFeaturedProducts(type: ListingType): Promise<Product[]> {
  let q = supabaseAdmin
    .from("products")
    .select('*, category:categories(id,name,slug), store:stores(id,name,slug,city,"isVerified"), images:product_images(id,url,"isPrimary","sortOrder")')
    .eq("isActive", true).eq("isFeatured", true);
  q = applyTypeFilter(q, type);
  const { data } = await q.order("createdAt", { ascending: false }).limit(8);
  return (data ?? []).map(normalizeProduct);
}

async function getNewArrivals(type: ListingType): Promise<Product[]> {
  let q = supabaseAdmin
    .from("products")
    .select('*, category:categories(id,name,slug), store:stores(id,name,slug,city,"isVerified"), images:product_images(id,url,"isPrimary","sortOrder")')
    .eq("isActive", true);
  q = applyTypeFilter(q, type);
  const { data } = await q.order("createdAt", { ascending: false }).limit(6);
  return (data ?? []).map(normalizeProduct);
}

async function getHeroBanners(): Promise<BannerSlide[]> {
  try {
    const { data } = await supabaseAdmin
      .from("hero_banners")
      .select("*")
      .eq("isActive", true)
      .order("sortOrder", { ascending: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((data ?? []) as any[]).map((r) => ({
      id:       r.id,
      title:    r.title,
      subtitle: r.subtitle ?? null,
      ctaText:  r.ctaText ?? null,
      ctaLink:  r.ctaLink ?? null,
      imageUrl: r.imageUrl ?? null,
    }));
  } catch {
    // hero_banners table may not exist yet — fall back to empty (uses static slides)
    return [];
  }
}

async function getHotDeals(type: ListingType): Promise<Product[]> {
  let q = supabaseAdmin
    .from("products")
    .select('*, category:categories(id,name,slug), store:stores(id,name,slug,city,"isVerified"), images:product_images(id,url,"isPrimary","sortOrder")')
    .eq("isActive", true)
    .not("originalPrice", "is", null);
  q = applyTypeFilter(q, type);
  const { data } = await q.order("createdAt", { ascending: false }).limit(16);
  // Client-side: only keep rows where originalPrice > price (genuine discounts)
  return ((data ?? []) as Record<string, unknown>[])
    .filter((p) => (p.originalPrice as number) > (p.price as number))
    .slice(0, 8)
    .map(normalizeProduct);
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


// ─── Empty state ─────────────────────────────────────────
function EmptyState({ message, href, cta }: { message: string; href?: string; cta?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <PackageSearch size={36} className="text-gray-700" />
      <p className="text-gray-500 text-sm text-center">{message}</p>
      {href && cta && (
        <Link href={href} className="text-[13px] text-brand-orange font-semibold hover:opacity-80">{cta} →</Link>
      )}
    </div>
  );
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
type HomeProps = {
  searchParams: Promise<{ type?: string }>;
};

export default async function HomePage({ searchParams }: HomeProps) {
  const { type: typeSlug } = await searchParams;
  const type = listingTypeFromSlug(typeSlug);

  const [featured, arrivals, deals, popularBrands, heroBanners] = await Promise.all([
    getFeaturedProducts(type),
    getNewArrivals(type),
    getHotDeals(type),
    getPopularBrands(),
    getHeroBanners(),
  ]);

  // Adapt the "new arrivals" section title to the selected type
  const arrivalsTitle =
    type === "PART"
      ? "New Arrivals"
      : type === "SERVICE"
      ? "Available Services"
      : "Latest Cars for Sale";
  const arrivalsHref =
    type === "PART"
      ? "/search?sort=newest"
      : type === "SERVICE"
      ? "/search?type=services&sort=newest"
      : "/search?type=cars&sort=newest";
  const featuredHref =
    type === "PART"
      ? "/search?featured=true"
      : type === "SERVICE"
      ? "/search?type=services&featured=true"
      : "/search?type=cars&featured=true";

  return (
    <>
      {/* Structured data */}
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />

      {/* Desktop hero — hidden on mobile */}
      <div className="hidden md:block">
        <HeroBanner slides={heroBanners} />
      </div>

      {/* Listing type switcher (Parts / Services / Cars) */}
      <ListingTypeTabs active={type} />

      {/* Categories — content swaps per selected type */}
      <TypedCategories type={type} />

      {/* ── MOBILE CONTENT ── */}
      <div className="md:hidden px-4 pt-2 pb-4 space-y-6">

        {/* Featured — horizontal scroll */}
        {featured.length > 0 && (
          <Section title="Featured" href={featuredHref}>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} className="min-w-[155px] w-[155px] flex-shrink-0" />
              ))}
            </div>
          </Section>
        )}

        {/* Hot Deals — horizontal scroll, only shown when there are discounted listings */}
        {deals.length > 0 && (
          <Section title="🔥 Hot Deals" href="/search?sort=newest">
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {deals.map((p) => (
                <ProductCard key={p.id} product={p} className="min-w-[155px] w-[155px] flex-shrink-0" />
              ))}
            </div>
          </Section>
        )}

        {/* New Arrivals / Available Services / Latest Cars — 2-column grid */}
        <Section title={arrivalsTitle} href={arrivalsHref}>
          {arrivals.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {arrivals.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
            </div>
          ) : (
            <EmptyState
              message="No listings yet — check back soon!"
              href="/search"
              cta="Browse all"
            />
          )}
        </Section>

        {/* Popular Brands — horizontal scroll */}
        {popularBrands.length > 0 && (
          <section className="mb-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[16px] font-black text-white">Brands</h2>
              <Link href="/search" className="orange-link text-[12px]">See all <ChevronRight size={13} /></Link>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {popularBrands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/search?carMake=${encodeURIComponent(brand.name)}`}
                  title={brand.name}
                  className="flex-shrink-0"
                >
                  <div className="w-14 h-14 rounded-xl bg-dark-secondary border border-dark-border flex items-center justify-center overflow-hidden p-2 hover:border-brand-orange transition-colors">
                    {brand.logoUrl ? (
                      <Image src={brand.logoUrl} alt={brand.name} width={44} height={44} className="object-contain w-full h-full" />
                    ) : (
                      <BrandLogo name={brand.name} size={28} />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── DESKTOP CONTENT ── */}
      <div className="hidden md:block max-w-screen-xl mx-auto px-6 pt-10">

        <Section title="Featured" href={featuredHref}>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
            {featured.length > 0 ? featured.map((p) => (
              <ProductCard key={p.id} product={p} className="min-w-[220px] w-[220px] flex-shrink-0" />
            )) : <EmptyState message="No featured listings yet." />}
          </div>
        </Section>

        {deals.length > 0 && (
          <Section title="🔥 Hot Deals" href="/search?sort=newest">
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
              {deals.map((p) => (
                <ProductCard key={p.id} product={p} className="min-w-[220px] w-[220px] flex-shrink-0" />
              ))}
            </div>
          </Section>
        )}

        <Section title={arrivalsTitle} href={arrivalsHref}>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
            {arrivals.length > 0 ? arrivals.map((p) => (
              <ProductCard key={p.id} product={p} variant="compact" className="min-w-[240px] flex-shrink-0" />
            )) : <EmptyState message="No listings yet — check back soon!" href="/search" cta="Browse all" />}
          </div>
        </Section>

        {/* Popular Brands */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Popular Brands</h2>
            <Link href="/search" className="orange-link text-[13px]">View all <ChevronRight size={14} /></Link>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {popularBrands.map((brand) => (
              <Link
                key={brand.id}
                href={`/search?carMake=${encodeURIComponent(brand.name)}`}
                title={brand.name}
                className="card flex items-center justify-center w-[100px] h-[64px] flex-shrink-0 p-3 hover:border-brand-orange transition-all duration-200 group"
              >
                {brand.logoUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={brand.logoUrl}
                      alt={brand.name}
                      fill
                      className="object-contain filter brightness-75 group-hover:brightness-110 transition-all"
                    />
                  </div>
                ) : (
                  <div className="text-gray-400 group-hover:text-white transition-colors">
                    <BrandLogo name={brand.name} size={40} />
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>

        <TrustBadges />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mb-12">
          <Section title="More Listings" href={arrivalsHref}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(arrivals.length > 0 ? arrivals : []).slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
              {arrivals.length === 0 && (
                <div className="col-span-4">
                  <EmptyState message="No listings yet — check back soon!" href="/search" cta="Browse all" />
                </div>
              )}
            </div>
          </Section>

          <RecentlyViewed />
        </div>
      </div>
    </>
  );
}
