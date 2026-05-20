import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, MapPin, Shield, BadgeCheck, Lock } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import { formatPrice, conditionLabel } from "@/lib/utils";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ContactPanel }   from "@/components/product/ContactPanel";
import { ProductCard }    from "@/components/ui/ProductCard";
import type { Product }   from "@/lib/types";

// ── Data fetching ─────────────────────────────────────────
async function getProduct(id: string) {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(`
      *,
      images:product_images(id, url, "isPrimary", "sortOrder"),
      category:categories(id, name, slug),
      store:stores(id, name, slug, city, country, phone, "isVerified", "workingHours", "responseRate")
    `)
    .eq("id", id)
    .eq("isActive", true)
    .single();

  if (error || !data) return null;

  // Sort images
  return {
    ...data,
    images: ((data as unknown as { images: Array<{ sortOrder: number }> }).images ?? [])
      .sort((a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder),
  };
}

async function getRelated(categoryId: string, productId: string) {
  const { data } = await supabaseAdmin
    .from("products")
    .select(`
      *,
      images:product_images(id, url, "isPrimary", "sortOrder"),
      category:categories(id, name, slug),
      store:stores(id, name, slug, city, "isVerified")
    `)
    .eq("categoryId", categoryId)
    .eq("isActive", true)
    .neq("id", productId)
    .limit(6);

  return (data ?? []).map((p: Record<string, unknown>) => ({
    ...p,
    images: ((p.images as Array<{ sortOrder: number }>) ?? []).sort((a, b) => a.sortOrder - b.sortOrder),
  }));
}

// ── Page ──────────────────────────────────────────────────
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  // Increment view count (fire and forget)
  supabaseAdmin
    .from("products")
    .update({ viewCount: ((product as Record<string, unknown>).viewCount as number ?? 0) + 1 })
    .eq("id", id)
    .then(() => {});

  const p     = product as unknown as Product;
  const store = p.store as typeof p.store & { phone?: string };

  const related = await getRelated(p.categoryId, p.id);

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-6 pb-16">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand-orange transition-colors">Home</Link>
        <ChevronRight size={12} />
        <Link href={`/search?category=${p.category?.slug}`} className="hover:text-brand-orange transition-colors">
          {p.category?.name ?? "Parts"}
        </Link>
        <ChevronRight size={12} />
        <span className="text-gray-300 truncate max-w-[200px]">{p.title}</span>
      </nav>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

        {/* ── Left column ── */}
        <div className="space-y-5">
          <ProductGallery images={p.images} />

          {/* Description + Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="text-[14px] font-bold mb-3 pb-3 border-b border-dark-border">Description</h3>
              <p className="text-[13px] text-gray-300 leading-relaxed whitespace-pre-line">
                {p.description || "No description provided."}
              </p>
            </div>
            <div className="card p-5">
              <h3 className="text-[14px] font-bold mb-3 pb-3 border-b border-dark-border">Specifications</h3>
              <div className="space-y-0">
                {([
                  ["Condition",     conditionLabel(p.condition)],
                  ["Category",      p.category?.name],
                  ["Part Number",   p.partNumber],
                  ["Brand",         p.brand],
                  p.carMake && ["Car Make", p.carMake],
                  p.carModel && ["Car Model", p.carModel],
                  (p.carYear || p.carYearTo) && ["Years", `${p.carYear ?? ""}${p.carYearTo && p.carYearTo !== p.carYear ? `–${p.carYearTo}` : ""}`],
                ] as [string, string | undefined | false][]).filter(Boolean).map(([k, v]) => v && (
                  <div key={k as string} className="flex gap-3 py-2 border-b border-dark-border last:border-none text-[13px]">
                    <span className="text-gray-400 min-w-[110px]">{k}</span>
                    <span className="text-white font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div>
              <h2 className="section-title mb-4">More in {p.category?.name}</h2>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
                {related.map((rp) => (
                  <ProductCard key={(rp as Product).id} product={rp as Product} className="min-w-[180px] w-[180px] flex-shrink-0" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right column — sticky ── */}
        <div className="space-y-4 lg:sticky lg:top-[84px] self-start">

          <ContactPanel
            productId={p.id}
            title={p.title}
            price={p.price}
            originalPrice={p.originalPrice}
            currency={p.currency}
            condition={p.condition}
            partNumber={p.partNumber}
            storeSlug={store.slug}
            storeName={store.name}
            storePhone={store.phone}
          />

          {/* Location */}
          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-dark-border text-[12px] font-semibold">
              <MapPin size={13} className="text-brand-orange" />
              {store.city}, Qatar
            </div>
            <Link
              href={`/store/${store.slug}`}
              className="w-full py-3 text-brand-orange text-[13px] font-bold flex items-center justify-center hover:bg-brand-orange-light transition-colors"
            >
              View Full Store
            </Link>
          </div>

          {/* Trust badges */}
          <div className="card p-3.5 flex items-center justify-between">
            {([
              [Shield,     "Genuine OEM"],
              [BadgeCheck, "Quality Checked"],
              [Lock,       "Safe Deal"],
            ] as const).map(([Icon, label]) => (
              <div key={label} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <Icon size={13} className="text-green-400" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product Not Found" };
  const p = product as unknown as Product;
  return {
    title: `${p.title} — ${formatPrice(p.price, p.currency)}`,
    description: p.description ?? `${p.title} for sale in Qatar`,
  };
}
