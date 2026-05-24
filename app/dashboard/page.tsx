import { supabaseAdmin } from "@/lib/supabase";
import { getSellerStore } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Package, Eye, ShoppingBag, Star,
  TrendingUp, TrendingDown, ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

async function getDashboardStats(storeId: string) {
  const [productsRes, reviewsRes, topRes] = await Promise.all([
    supabaseAdmin.from("products").select("id, viewCount, price, isActive", { count: "exact" }).eq("storeId", storeId),
    supabaseAdmin.from("reviews").select("rating", { count: "exact" }).eq("storeId", storeId),
    supabaseAdmin.from("products")
      .select("id, title, price, viewCount, condition, images:product_images(url, isPrimary)")
      .eq("storeId", storeId)
      .order("viewCount", { ascending: false })
      .limit(5),
  ]);

  const products    = productsRes.data ?? [];
  const reviews     = reviewsRes.data ?? [];
  const topProducts = topRes.data ?? [];

  const totalViews  = products.reduce((s, p) => s + (p.viewCount ?? 0), 0);
  const activeCount = products.filter(p => p.isActive).length;
  const avgRating   = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  return { totalProducts: products.length, activeCount, totalViews, reviewCount: reviews.length, avgRating, topProducts };
}

export default async function DashboardPage() {
  const store = await getSellerStore();
  if (!store) redirect("/seller/setup");

  const stats = await getDashboardStats(store.id);

  const STATS = [
    { label: "Total Products", value: stats.totalProducts, sub: `${stats.activeCount} active`, icon: Package, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Total Views",    value: stats.totalViews.toLocaleString(), sub: "all time", icon: Eye, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Orders",         value: "—",   sub: "coming soon", icon: ShoppingBag, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Avg. Rating",    value: stats.avgRating, sub: `${stats.reviewCount} reviews`, icon: Star, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  ];

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white">Dashboard</h1>
          <p className="text-gray-500 text-[12px] md:text-sm mt-0.5">Welcome back! Here&apos;s your store overview.</p>
        </div>
        <Link href="/dashboard/products/new" className="btn-primary h-9 md:h-12 px-3 md:px-6 text-[13px] md:text-base">
          + Add Product
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={18} className={color} />
              </div>
              <ArrowUpRight size={16} className="text-gray-600" />
            </div>
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-[12px] text-gray-500 mt-0.5">{label}</p>
            <p className="text-[11px] text-gray-600 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Top products */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
            <h2 className="text-[15px] font-bold text-white">Top Products by Views</h2>
            <Link href="/dashboard/products" className="text-[12px] text-brand-orange hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-dark-border">
            {stats.topProducts.length === 0 ? (
              <p className="text-gray-500 text-sm p-5">
                No products yet.{" "}
                <Link href="/dashboard/products/new" className="text-brand-orange hover:underline">Add your first product →</Link>
              </p>
            ) : stats.topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
                <span className="text-[13px] font-bold text-gray-600 w-5">{i + 1}</span>
                <div className="w-10 h-10 rounded-lg bg-dark-input flex-shrink-0 overflow-hidden">
                  {(p as { images: Array<{ url: string }> }).images?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={(p as { images: Array<{ url: string }> }).images[0].url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-white truncate">{p.title}</p>
                  <p className="text-[11px] text-gray-500">{p.condition} · {p.price} QAR</p>
                </div>
                <div className="flex items-center gap-1 text-[12px] text-gray-400">
                  <Eye size={12} />
                  {p.viewCount}
                </div>
                <Link href={`/dashboard/products/${p.id}`} className="text-[12px] text-brand-orange hover:underline">Edit</Link>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="text-[15px] font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: "Add New Product",  href: "/dashboard/products/new", color: "bg-brand-orange text-white hover:bg-brand-orange-hover" },
                { label: "View My Store",    href: `/store/${store.slug}`,    color: "bg-dark-input text-white hover:bg-dark-card" },
                { label: "Manage Products",  href: "/dashboard/products",     color: "bg-dark-input text-white hover:bg-dark-card" },
                { label: "Store Settings",   href: "/dashboard/store",        color: "bg-dark-input text-white hover:bg-dark-card" },
              ].map(({ label, href, color }) => (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <Link key={label} href={href as any} className={`block px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${color}`}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-[15px] font-bold text-white mb-3">Store Health</h2>
            <div className="space-y-3">
              {[
                { label: "Products Active", val: `${stats.activeCount}/${stats.totalProducts}`, ok: stats.activeCount > 0 },
                { label: "Verified Store",  val: store.isVerified ? "Yes" : "Pending",          ok: !!store.isVerified },
                { label: "Response Rate",   val: "—",  ok: true },
                { label: "Avg. Rating",     val: `${stats.avgRating} ★`, ok: true },
              ].map(({ label, val, ok }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[12px] text-gray-400">{label}</span>
                  <span className={`text-[12px] font-semibold flex items-center gap-1 ${ok ? "text-green-400" : "text-yellow-400"}`}>
                    {ok ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
