import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import { StoreContent } from "@/components/store/StoreContent";
import type { Product, Review, Store } from "@/lib/types";

// Cache store pages for 60 seconds
export const revalidate = 60;

// ── Data fetching ─────────────────────────────────────────
async function getStore(slug: string) {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  const field  = isUUID ? "id" : "slug";

  const { data: store, error } = await supabaseAdmin
    .from("stores").select("*").eq(field, slug).single();

  if (error || !store) return null;

  const [reviewsRes, productsRes] = await Promise.all([
    supabaseAdmin
      .from("reviews")
      .select(`*, user:users("fullName", "avatarUrl")`)
      .eq("storeId", store.id)
      .order("createdAt", { ascending: false }),
    supabaseAdmin
      .from("products")
      .select(`
        *,
        images:product_images(id, url, "isPrimary", "sortOrder"),
        category:categories(id, name, slug),
        store:stores(id, name, slug, city, "isVerified")
      `)
      .eq("storeId", store.id)
      .eq("isActive", true)
      .order("createdAt", { ascending: false }),
  ]);

  const reviews  = reviewsRes.data  ?? [];
  const products = (productsRes.data ?? []).map((p: Record<string, unknown>) => ({
    ...p,
    images: ((p.images as Array<{ sortOrder: number }>) ?? [])
      .sort((a, b) => a.sortOrder - b.sortOrder),
  }));

  const avgRating = reviews.length
    ? Math.round(reviews.reduce((s, r: { rating: number }) => s + r.rating, 0) / reviews.length * 10) / 10
    : 0;

  return {
    ...store,
    reviews,
    avgRating,
    _count: { products: products.length, reviews: reviews.length },
    products,
  };
}

// ── Page ──────────────────────────────────────────────────
export default async function StorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result  = await getStore(id);
  if (!result) notFound();

  const { products, reviews, avgRating, _count, ...store } = result;

  return (
    <div className="bg-dark-primary min-h-screen">

      {/* Cover */}
      <div className="relative h-[200px] sm:h-[260px] bg-dark-secondary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-primary/80" />
        {store.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={store.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        )}
        {!store.coverUrl && (
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, #ff5500 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        )}
        {/* Breadcrumb */}
        <nav className="absolute top-4 left-6 flex items-center gap-1.5 text-[12px] text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href="/search" className="hover:text-white transition-colors">Sellers</Link>
          <ChevronRight size={12} />
          <span className="text-white">{store.name}</span>
        </nav>
      </div>

      <StoreContent
        store={{ ...store, reviews, avgRating, _count } as Store & { avgRating?: number; reviews?: Review[] }}
        products={products as Product[]}
      />
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = await params;
  const result  = await getStore(id);
  if (!result) return { title: "Store Not Found" };
  return {
    title: `${result.name} — Auto Parts Store in Qatar`,
    description: result.description ?? `Browse ${result._count.products} listings from ${result.name} on Warsha+.`,
  };
}
