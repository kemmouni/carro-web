"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Phone, Mail, Globe, Star, ShieldCheck, MessageCircle, Heart, Package, BarChart2, ChevronRight } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { ConditionBadge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { ProductCard } from "@/components/ui/ProductCard";
import type { Store, Product, Review, Condition } from "@/lib/types";

// ── Mock data ──────────────────────────────────────────────
const MOCK_STORE: Store = {
  id: "s1",
  name: "Auto Parts Doha",
  slug: "auto-parts-doha",
  city: "Doha",
  country: "Qatar",
  isVerified: true,
  responseRate: 98,
  totalSales: 342,
  avgRating: 4.8,
  logoUrl: "/images/store-logo.jpg",
  coverUrl: "/images/store-cover.jpg",
  description: "Auto Parts Doha is Qatar's leading supplier of genuine and aftermarket auto parts. With over 10 years of experience, we specialize in Toyota, Nissan, and Lexus parts. All our parts come with a warranty and are sourced from certified manufacturers.",
  workingHours: "Sat–Thu: 8:00 AM – 9:00 PM\nFri: 2:00 PM – 9:00 PM",
  phone: "+974 4444 5678",
  email: "info@autopartsdoha.qa",
  website: "www.autopartsdoha.qa",
  address: "Industrial Area, Street 22, Doha, Qatar",
  lat: 25.2854,
  lng: 51.531,
  createdAt: new Date("2020-03-15").toISOString(),
  _count: { products: 156, reviews: 128 },
};

const mkProduct = (id: string, title: string, price: number, oldPrice: number, cond: Condition, views: number): Product => ({
  id, storeId: "s1", store: MOCK_STORE,
  categoryId: "c4",
  category: { id: "c4", name: "AC & Heating", slug: "ac-heating" },
  title, slug: id,
  price, originalPrice: oldPrice, currency: "QAR",
  condition: cond, partNumber: "88320-6A320",
  brand: "Toyota", carMake: "Toyota", carModel: "Land Cruiser",
  carYear: 2016, carYearTo: 2020,
  images: [{ id: "i" + id, url: "/images/ac-compressor.jpg", isPrimary: true, sortOrder: 0 }],
  isActive: true, isFeatured: false, viewCount: views,
  createdAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
});

const PRODUCTS: Product[] = [
  mkProduct("p1", "OEM AC Compressor — Toyota Land Cruiser 2016", 850, 1450, "LIKE_NEW", 24),
  mkProduct("p2", "Denso Radiator — Nissan Patrol 2014–2019", 620, 950, "USED", 18),
  mkProduct("p3", "Toyota OEM Alternator 12V 130A", 480, 720, "LIKE_NEW", 31),
  mkProduct("p4", "Bosch Fuel Pump Assembly — Land Cruiser", 390, 580, "USED", 15),
  mkProduct("p5", "OEM Power Steering Pump — Lexus LX570", 750, 1200, "LIKE_NEW", 27),
  mkProduct("p6", "Brembo Front Brake Kit 2-Pcs", 550, 780, "NEW", 13),
  mkProduct("p7", "K&N Performance Air Filter — Toyota", 180, 260, "NEW", 9),
  mkProduct("p8", "Garrett GT2554R Turbocharger", 1250, 1800, "USED", 42),
];

const REVIEWS: (Review & { userName: string; userAvatar: string })[] = [
  { id: "r1", storeId: "s1", userId: "u1", rating: 5, comment: "Excellent service and genuine parts. The AC compressor I bought works perfectly. Delivery was on time and well packed.", createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), userName: "Mohammed Al-Rashid", userAvatar: "" },
  { id: "r2", storeId: "s1", userId: "u2", rating: 5, comment: "Very professional team. They helped me find the right alternator for my Nissan Patrol. Will definitely buy again.", createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), userName: "Ahmed Hassan", userAvatar: "" },
  { id: "r3", storeId: "s1", userId: "u3", rating: 4, comment: "Good quality parts, fast response. Slight delay in delivery but overall a positive experience.", createdAt: new Date(Date.now() - 14 * 86400000).toISOString(), userName: "Khalid Al-Thani", userAvatar: "" },
  { id: "r4", storeId: "s1", userId: "u4", rating: 5, comment: "Best auto parts store in Doha. Competitive pricing and all parts are verified OEM. Highly recommended!", createdAt: new Date(Date.now() - 21 * 86400000).toISOString(), userName: "Omar Farouq", userAvatar: "" },
];

const RATING_BREAKDOWN = [
  { stars: 5, count: 89, pct: 70 },
  { stars: 4, count: 26, pct: 20 },
  { stars: 3, count: 8,  pct: 6  },
  { stars: 2, count: 3,  pct: 2  },
  { stars: 1, count: 2,  pct: 2  },
];

// ── Sub-components ─────────────────────────────────────────
function ReviewCard({ review }: { review: typeof REVIEWS[0] }) {
  const daysAgo = Math.floor((Date.now() - new Date(review.createdAt).getTime()) / 86400000);
  const initials = review.userName.split(" ").map(w => w[0]).join("").slice(0, 2);

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-dark-secondary border border-dark-border flex items-center justify-center text-[13px] font-bold text-brand-orange flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] font-semibold text-white">{review.userName}</p>
            <span className="text-[11px] text-gray-500 flex-shrink-0">{daysAgo}d ago</span>
          </div>
          <StarRating rating={review.rating} size={11} />
        </div>
      </div>
      <p className="text-[13px] text-gray-400 leading-relaxed">{review.comment}</p>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────
export default function StorePage() {
  const [tab, setTab] = useState<"listings" | "reviews" | "about">("listings");
  const [followed, setFollowed] = useState(false);
  const store = MOCK_STORE;

  const joinedYear = new Date(store.createdAt).getFullYear();

  return (
    <div className="bg-dark-primary min-h-screen">

      {/* Cover image */}
      <div className="relative h-[220px] sm:h-[280px] bg-dark-secondary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-primary/80" />
        <div className="absolute inset-0 bg-[url('/images/store-cover.jpg')] bg-cover bg-center opacity-40" />
        {/* Breadcrumb */}
        <nav className="absolute top-4 left-6 flex items-center gap-1.5 text-[12px] text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href="/search" className="hover:text-white transition-colors">Sellers</Link>
          <ChevronRight size={12} />
          <span className="text-white">{store.name}</span>
        </nav>
      </div>

      {/* Store identity bar */}
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="relative flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-14 pb-6 border-b border-dark-border">

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-dark-primary bg-dark-card overflow-hidden flex items-center justify-center text-[28px] font-black text-brand-orange shadow-lg">
              {store.logoUrl
                ? <Image src={store.logoUrl} alt={store.name} fill className="object-cover" />
                : store.name.split(" ").map(w => w[0]).join("").slice(0, 2)
              }
            </div>
            {store.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-dark-primary flex items-center justify-center">
                <ShieldCheck size={18} className="text-brand-orange" fill="rgba(255,85,0,0.15)" />
              </div>
            )}
          </div>

          {/* Name + stats */}
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-[22px] sm:text-[26px] font-black text-white leading-tight">{store.name}</h1>
              {store.isVerified && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-orange-light text-brand-orange text-[11px] font-bold">
                  <ShieldCheck size={10} /> Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mb-3">
              <StarRating rating={store.avgRating ?? 0} count={store._count?.reviews} size={12} />
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-gray-400">
              <span className="flex items-center gap-1.5"><Package size={12} />{store._count?.products} listings</span>
              <span className="flex items-center gap-1.5"><BarChart2 size={12} />{store.totalSales} sales</span>
              <span className="flex items-center gap-1.5"><MessageCircle size={12} />{store.responseRate}% response rate</span>
              <span className="flex items-center gap-1.5"><MapPin size={12} />{store.city}, {store.country}</span>
              <span className="flex items-center gap-1.5"><Clock size={12} />Member since {joinedYear}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0 pt-2 sm:pt-0 pb-1">
            <button className="h-10 px-5 bg-brand-orange hover:bg-[#e64d00] text-white text-[13px] font-semibold rounded-xl transition-colors flex items-center gap-2">
              <MessageCircle size={15} />
              Message
            </button>
            <a href={`tel:${store.phone}`} className="h-10 px-5 bg-dark-card border border-dark-border hover:border-brand-orange text-white text-[13px] font-semibold rounded-xl transition-colors flex items-center gap-2">
              <Phone size={15} />
              Call
            </a>
            <button
              onClick={() => setFollowed(!followed)}
              className={cn(
                "h-10 px-4 rounded-xl border text-[13px] font-semibold transition-all flex items-center gap-2",
                followed
                  ? "bg-brand-orange-light border-brand-orange text-brand-orange"
                  : "bg-dark-card border-dark-border text-gray-400 hover:border-brand-orange hover:text-brand-orange"
              )}
            >
              <Heart size={14} fill={followed ? "currentColor" : "none"} />
              {followed ? "Following" : "Follow"}
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 border-b border-dark-border mt-1 -mx-1">
          {(["listings", "reviews", "about"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-5 py-3.5 text-[13px] font-semibold capitalize transition-all border-b-2 -mb-px",
                tab === t
                  ? "text-brand-orange border-brand-orange"
                  : "text-gray-400 border-transparent hover:text-white"
              )}
            >
              {t === "listings" ? `Listings (${store._count?.products})` : t === "reviews" ? `Reviews (${store._count?.reviews})` : "About"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="py-8">
          {tab === "listings" && (
            <div className="flex gap-6">
              {/* Product grid */}
              <div className="flex-1 min-w-0">
                {/* Sort bar */}
                <div className="flex items-center justify-between mb-5">
                  <p className="text-[13px] text-gray-400">{PRODUCTS.length} products</p>
                  <select className="h-9 bg-dark-card border border-dark-border rounded-lg px-3 text-[13px] text-white min-w-[160px] cursor-pointer focus:outline-none focus:border-brand-orange">
                    {["Newest First", "Price: Low to High", "Price: High to Low", "Most Viewed"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {PRODUCTS.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 mt-10">
                  {["‹", "1", "2", "3", "›"].map((pg, i) => (
                    <button
                      key={i}
                      className={cn(
                        "w-9 h-9 flex items-center justify-center rounded-lg text-[13px] font-semibold transition-colors",
                        pg === "1" ? "bg-brand-orange text-white" : "bg-dark-card border border-dark-border text-gray-300 hover:border-brand-orange hover:text-brand-orange"
                      )}
                    >
                      {pg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sidebar — store quick info */}
              <aside className="w-[240px] flex-shrink-0 hidden lg:block space-y-4">
                <div className="card p-4">
                  <p className="text-[11px] font-bold tracking-widest uppercase text-white mb-3">Store Info</p>
                  <div className="space-y-3 text-[12px] text-gray-400">
                    <div className="flex items-start gap-2.5">
                      <MapPin size={13} className="text-brand-orange flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{store.address}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone size={13} className="text-brand-orange flex-shrink-0" />
                      <a href={`tel:${store.phone}`} className="hover:text-white transition-colors">{store.phone}</a>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Mail size={13} className="text-brand-orange flex-shrink-0" />
                      <a href={`mailto:${store.email}`} className="hover:text-white transition-colors truncate">{store.email}</a>
                    </div>
                    {store.website && (
                      <div className="flex items-center gap-2.5">
                        <Globe size={13} className="text-brand-orange flex-shrink-0" />
                        <span className="hover:text-white transition-colors truncate">{store.website}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2.5">
                      <Clock size={13} className="text-brand-orange flex-shrink-0 mt-0.5" />
                      <span className="whitespace-pre-line leading-relaxed">{store.workingHours}</span>
                    </div>
                  </div>
                </div>

                <div className="card p-4">
                  <p className="text-[11px] font-bold tracking-widest uppercase text-white mb-3">Rating Summary</p>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[42px] font-black text-brand-orange leading-none">{store.avgRating?.toFixed(1)}</span>
                    <div>
                      <StarRating rating={store.avgRating ?? 0} size={13} />
                      <p className="text-[11px] text-gray-500 mt-1">{store._count?.reviews} reviews</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {RATING_BREAKDOWN.map(({ stars, count, pct }) => (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-500 w-3">{stars}</span>
                        <Star size={10} className="text-yellow-400 flex-shrink-0" fill="currentColor" />
                        <div className="flex-1 h-1.5 bg-dark-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-brand-orange rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] text-gray-500 w-5 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          )}

          {tab === "reviews" && (
            <div className="flex gap-6">
              <div className="flex-1 min-w-0 space-y-4">
                {REVIEWS.map((r) => <ReviewCard key={r.id} review={r} />)}
              </div>
              <aside className="w-[240px] flex-shrink-0 hidden lg:block">
                <div className="card p-4 sticky top-24">
                  <p className="text-[11px] font-bold tracking-widest uppercase text-white mb-3">Rating Summary</p>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[42px] font-black text-brand-orange leading-none">{store.avgRating?.toFixed(1)}</span>
                    <div>
                      <StarRating rating={store.avgRating ?? 0} size={13} />
                      <p className="text-[11px] text-gray-500 mt-1">{store._count?.reviews} reviews</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {RATING_BREAKDOWN.map(({ stars, count, pct }) => (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-500 w-3">{stars}</span>
                        <Star size={10} className="text-yellow-400 flex-shrink-0" fill="currentColor" />
                        <div className="flex-1 h-1.5 bg-dark-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-brand-orange rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] text-gray-500 w-5 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          )}

          {tab === "about" && (
            <div className="flex gap-6">
              <div className="flex-1 min-w-0 space-y-6">
                {/* Description */}
                <div className="card p-5">
                  <h3 className="text-[15px] font-bold text-white mb-3">About {store.name}</h3>
                  <p className="text-[13px] text-gray-400 leading-relaxed">{store.description}</p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Total Listings",  value: store._count?.products ?? 0,  icon: Package },
                    { label: "Total Sales",     value: store.totalSales ?? 0,         icon: BarChart2 },
                    { label: "Avg. Rating",     value: `${store.avgRating?.toFixed(1)} ★`, icon: Star },
                    { label: "Response Rate",   value: `${store.responseRate}%`,       icon: MessageCircle },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="card p-4 text-center">
                      <Icon size={20} className="text-brand-orange mx-auto mb-2" />
                      <p className="text-[20px] font-black text-white">{value}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Map placeholder */}
                <div className="card overflow-hidden">
                  <div className="relative h-[220px] bg-dark-secondary flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20"
                      style={{ backgroundImage: "radial-gradient(circle, #ff5500 1px, transparent 1px)", backgroundSize: "24px 24px" }}
                    />
                    <div className="text-center relative z-10">
                      <div className="w-12 h-12 rounded-full bg-brand-orange-light border-2 border-brand-orange flex items-center justify-center mx-auto mb-2">
                        <MapPin size={22} className="text-brand-orange" />
                      </div>
                      <p className="text-[13px] font-semibold text-white">{store.name}</p>
                      <p className="text-[11px] text-gray-400">{store.address}</p>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-semibold text-white">{store.address}</p>
                      <p className="text-[12px] text-gray-500">{store.city}, {store.country}</p>
                    </div>
                    <button className="h-9 px-4 bg-brand-orange hover:bg-[#e64d00] text-white text-[12px] font-semibold rounded-lg transition-colors">
                      Get Directions
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <aside className="w-[240px] flex-shrink-0 hidden lg:block space-y-4">
                <div className="card p-4">
                  <p className="text-[11px] font-bold tracking-widest uppercase text-white mb-3">Contact</p>
                  <div className="space-y-3 text-[12px] text-gray-400">
                    <div className="flex items-center gap-2.5">
                      <Phone size={13} className="text-brand-orange flex-shrink-0" />
                      <a href={`tel:${store.phone}`} className="hover:text-white transition-colors">{store.phone}</a>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Mail size={13} className="text-brand-orange flex-shrink-0" />
                      <a href={`mailto:${store.email}`} className="hover:text-white transition-colors truncate">{store.email}</a>
                    </div>
                    {store.website && (
                      <div className="flex items-center gap-2.5">
                        <Globe size={13} className="text-brand-orange flex-shrink-0" />
                        <span className="truncate">{store.website}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 space-y-2">
                    <button className="w-full h-10 bg-brand-orange hover:bg-[#e64d00] text-white text-[13px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                      <MessageCircle size={14} /> Message Seller
                    </button>
                    <a href={`tel:${store.phone}`} className="w-full h-10 bg-dark-secondary border border-dark-border hover:border-brand-orange text-white text-[13px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                      <Phone size={14} /> Call Seller
                    </a>
                  </div>
                </div>

                <div className="card p-4">
                  <p className="text-[11px] font-bold tracking-widest uppercase text-white mb-3">Working Hours</p>
                  <p className="text-[12px] text-gray-400 whitespace-pre-line leading-relaxed">{store.workingHours}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[12px] text-green-400 font-medium">Open Now</span>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
