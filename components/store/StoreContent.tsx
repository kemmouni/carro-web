"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Clock, Phone, Mail, Globe, Star, ShieldCheck, MessageCircle, Heart, Package, BarChart2, Send, Loader2 } from "lucide-react";
import { cn, formatPrice, timeAgo } from "@/lib/utils";
import { ConditionBadge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import type { Store, Product, Review } from "@/lib/types";

// ── Product card (simple version for store listing) ────────
function StoreProductCard({ product: p }: { product: Product }) {
  const img = p.images[0]?.url;
  return (
    <Link href={`/product/${p.id}`} className="card card-hover group block overflow-hidden">
      <div className="relative aspect-square bg-dark-secondary overflow-hidden">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={p.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={32} className="text-gray-700" />
          </div>
        )}
        <div className="absolute top-2 left-2"><ConditionBadge condition={p.condition} /></div>
      </div>
      <div className="p-3.5">
        <h3 className="text-[13px] font-semibold text-white leading-snug mb-2 line-clamp-2">{p.title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-[17px] font-black text-brand-orange">{formatPrice(p.price, p.currency)}</span>
          {p.originalPrice && (
            <span className="text-[12px] text-gray-500 line-through">{formatPrice(p.originalPrice, p.currency)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Review card ────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  const name     = review.user?.fullName ?? "Anonymous";
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-dark-secondary border border-dark-border flex items-center justify-center text-[13px] font-bold text-brand-orange flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] font-semibold text-white">{name}</p>
            <span className="text-[11px] text-gray-500 flex-shrink-0">{timeAgo(review.createdAt)}</span>
          </div>
          <StarRating rating={review.rating} size={11} />
        </div>
      </div>
      {review.comment && <p className="text-[13px] text-gray-400 leading-relaxed">{review.comment}</p>}
    </div>
  );
}

// ── Rating breakdown ───────────────────────────────────────
function RatingBreakdown({ reviews, avgRating }: { reviews: Review[]; avgRating: number }) {
  const total = reviews.length;
  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    return { star, count, pct: total ? Math.round((count / total) * 100) : 0 };
  });

  return (
    <div className="card p-4">
      <p className="text-[11px] font-bold tracking-widest uppercase text-white mb-3">Rating Summary</p>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[42px] font-black text-brand-orange leading-none">{avgRating.toFixed(1)}</span>
        <div>
          <StarRating rating={avgRating} size={13} />
          <p className="text-[11px] text-gray-500 mt-1">{total} reviews</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {breakdown.map(({ star, count, pct }) => (
          <div key={star} className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 w-3">{star}</span>
            <Star size={10} className="text-yellow-400 flex-shrink-0" fill="currentColor" />
            <div className="flex-1 h-1.5 bg-dark-secondary rounded-full overflow-hidden">
              <div className="h-full bg-brand-orange rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[11px] text-gray-500 w-5 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────
interface Props {
  store:    Store & { avgRating?: number; reviews?: Review[] };
  products: Product[];
}

export function StoreContent({ store, products }: Props) {
  const [tab,      setTab]      = useState<"listings" | "reviews" | "about">("listings");
  const [followed, setFollowed] = useState(false);
  const [sort,     setSort]     = useState("newest");

  // Review form state
  const [reviewList,    setReviewList]    = useState<Review[]>((store.reviews ?? []) as Review[]);
  const [reviewRating,  setReviewRating]  = useState(0);
  const [reviewHover,   setReviewHover]   = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError,   setReviewError]   = useState("");
  const [reviewDone,    setReviewDone]    = useState(false);

  const reviews   = reviewList;
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : (store.avgRating ?? 0);
  const joinedYear = new Date(store.createdAt).getFullYear();

  const sorted = [...products].sort((a, b) => {
    if (sort === "price_asc")  return a.price - b.price;
    if (sort === "price_desc") return b.price - a.price;
    if (sort === "views")      return (b.viewCount ?? 0) - (a.viewCount ?? 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (reviewRating === 0) { setReviewError("Please select a star rating"); return; }
    setReviewLoading(true);
    setReviewError("");
    try {
      const res  = await fetch("/api/reviews", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ storeId: store.id, rating: reviewRating, comment: reviewComment }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to submit");
      setReviewList((prev) => [json.data, ...prev]);
      setReviewDone(true);
      setReviewRating(0);
      setReviewComment("");
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setReviewLoading(false);
    }
  }

  function buildWhatsApp() {
    if (!store.phone) return "#";
    const digits  = store.phone.replace(/\D/g, "");
    const message = encodeURIComponent(`Hi, I visited your store on Warsha+ and I'm interested in your parts.`);
    return `https://wa.me/${digits}?text=${message}`;
  }

  return (
    <>
      {/* ── Store header bar ── */}
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="relative flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-14 pb-6 border-b border-dark-border">

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-dark-primary bg-dark-card overflow-hidden flex items-center justify-center text-[28px] font-black text-brand-orange shadow-lg">
              {store.logoUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
                : store.name.split(" ").map((w) => w[0]).join("").slice(0, 2)
              }
            </div>
            {store.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-dark-primary flex items-center justify-center">
                <ShieldCheck size={18} className="text-brand-orange" />
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
            {avgRating > 0 && (
              <div className="flex items-center gap-1 mb-3">
                <StarRating rating={avgRating} count={store._count?.reviews} size={12} />
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-gray-400">
              <span className="flex items-center gap-1.5"><Package size={12} />{store._count?.products ?? products.length} listings</span>
              {store.totalSales > 0 && <span className="flex items-center gap-1.5"><BarChart2 size={12} />{store.totalSales} sales</span>}
              {store.responseRate > 0 && <span className="flex items-center gap-1.5"><MessageCircle size={12} />{store.responseRate}% response</span>}
              <span className="flex items-center gap-1.5"><MapPin size={12} />{store.city}, Qatar</span>
              <span className="flex items-center gap-1.5"><Clock size={12} />Member since {joinedYear}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 pb-1">
            {store.phone && (
              <a
                href={buildWhatsApp()}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-5 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-[13px] font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                <MessageCircle size={15} /> WhatsApp
              </a>
            )}
            {store.phone && (
              <a
                href={`tel:${store.phone}`}
                className="h-10 px-4 bg-dark-card border border-dark-border hover:border-brand-orange text-white text-[13px] font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                <Phone size={14} /> Call
              </a>
            )}
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

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-dark-border mt-1 -mx-1">
          {(["listings", "reviews", "about"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-5 py-3.5 text-[13px] font-semibold capitalize transition-all border-b-2 -mb-px",
                tab === t ? "text-brand-orange border-brand-orange" : "text-gray-400 border-transparent hover:text-white"
              )}
            >
              {t === "listings" ? `Listings (${store._count?.products ?? products.length})` : t === "reviews" ? `Reviews (${reviews.length})` : "About"}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="py-8">

          {tab === "listings" && (
            <div className="flex gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-[13px] text-gray-400">{sorted.length} listings</p>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="h-9 bg-dark-card border border-dark-border rounded-lg px-3 text-[13px] text-white min-w-[160px] focus:outline-none focus:border-brand-orange"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="views">Most Viewed</option>
                  </select>
                </div>
                {sorted.length === 0 ? (
                  <div className="card py-16 text-center text-gray-500">No listings yet.</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sorted.map((p) => <StoreProductCard key={p.id} product={p} />)}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <aside className="w-[220px] flex-shrink-0 hidden lg:block">
                {avgRating > 0 && <RatingBreakdown reviews={reviews} avgRating={avgRating} />}
                <div className="card p-4 mt-4">
                  <p className="text-[11px] font-bold tracking-widest uppercase text-white mb-3">Store Info</p>
                  <div className="space-y-3 text-[12px] text-gray-400">
                    {store.address && <div className="flex items-start gap-2"><MapPin size={13} className="text-brand-orange flex-shrink-0 mt-0.5" /><span>{store.address}</span></div>}
                    {store.phone   && <div className="flex items-center gap-2"><Phone size={13} className="text-brand-orange" /><a href={`tel:${store.phone}`} className="hover:text-white">{store.phone}</a></div>}
                    {store.email   && <div className="flex items-center gap-2"><Mail size={13} className="text-brand-orange" /><a href={`mailto:${store.email}`} className="hover:text-white truncate">{store.email}</a></div>}
                    {store.website && <div className="flex items-center gap-2"><Globe size={13} className="text-brand-orange" /><span className="truncate">{store.website}</span></div>}
                    {store.workingHours && <div className="flex items-start gap-2"><Clock size={13} className="text-brand-orange flex-shrink-0 mt-0.5" /><span className="whitespace-pre-line">{store.workingHours}</span></div>}
                  </div>
                </div>
              </aside>
            </div>
          )}

          {tab === "reviews" && (
            <div className="flex gap-6">
              <div className="flex-1 min-w-0 space-y-4">

                {/* Write a review */}
                {reviewDone ? (
                  <div className="card p-5 flex items-center gap-3 text-green-400">
                    <Star size={18} className="fill-green-400" />
                    <p className="text-[14px] font-semibold">Thanks for your review!</p>
                  </div>
                ) : (
                  <form onSubmit={submitReview} className="card p-5 space-y-4">
                    <h3 className="text-[14px] font-bold text-white">Write a Review</h3>

                    {reviewError && (
                      <p className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{reviewError}</p>
                    )}

                    {/* Star picker */}
                    <div>
                      <p className="text-[12px] text-gray-400 mb-2">Your Rating</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onMouseEnter={() => setReviewHover(s)}
                            onMouseLeave={() => setReviewHover(0)}
                            onClick={() => setReviewRating(s)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              size={24}
                              className={(reviewHover || reviewRating) >= s ? "text-yellow-400 fill-yellow-400" : "text-gray-600 fill-gray-600"}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-[12px] text-gray-400 mb-1.5">Comment (optional)</p>
                      <textarea
                        className="input w-full resize-none h-24"
                        placeholder="Share your experience with this seller…"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        maxLength={500}
                      />
                      <p className="text-[10px] text-gray-600 mt-1 text-right">{reviewComment.length}/500</p>
                    </div>

                    <button
                      type="submit"
                      disabled={reviewLoading || reviewRating === 0}
                      className="btn-primary h-10 px-5 disabled:opacity-60"
                    >
                      {reviewLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      {reviewLoading ? "Submitting…" : "Submit Review"}
                    </button>
                  </form>
                )}

                {reviews.length === 0
                  ? <div className="card py-12 text-center text-gray-500 text-sm">Be the first to leave a review!</div>
                  : reviews.map((r) => <ReviewCard key={r.id} review={r} />)
                }
              </div>
              <aside className="w-[220px] flex-shrink-0 hidden lg:block">
                {reviews.length > 0 && <RatingBreakdown reviews={reviews} avgRating={reviews.reduce((s, r) => s + r.rating, 0) / reviews.length} />}
              </aside>
            </div>
          )}

          {tab === "about" && (
            <div className="flex gap-6">
              <div className="flex-1 min-w-0 space-y-6">
                {store.description && (
                  <div className="card p-5">
                    <h3 className="text-[15px] font-bold text-white mb-3">About {store.name}</h3>
                    <p className="text-[13px] text-gray-400 leading-relaxed">{store.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {([
                    { label: "Listings",      value: store._count?.products ?? products.length, icon: Package },
                    { label: "Total Sales",   value: store.totalSales,  icon: BarChart2 },
                    { label: "Avg. Rating",   value: avgRating > 0 ? `${avgRating.toFixed(1)} ★` : "—", icon: Star },
                    { label: "Response Rate", value: store.responseRate > 0 ? `${store.responseRate}%` : "—", icon: MessageCircle },
                  ] as const).map(({ label, value, icon: Icon }) => (
                    <div key={label} className="card p-4 text-center">
                      <Icon size={20} className="text-brand-orange mx-auto mb-2" />
                      <p className="text-[20px] font-black text-white">{value}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <aside className="w-[220px] flex-shrink-0 hidden lg:block">
                <div className="card p-4">
                  <p className="text-[11px] font-bold tracking-widest uppercase text-white mb-3">Contact</p>
                  <div className="space-y-3 text-[12px] text-gray-400">
                    {store.phone   && <div className="flex items-center gap-2"><Phone size={13} className="text-brand-orange" /><a href={`tel:${store.phone}`} className="hover:text-white">{store.phone}</a></div>}
                    {store.email   && <div className="flex items-center gap-2"><Mail size={13} className="text-brand-orange" /><a href={`mailto:${store.email}`} className="hover:text-white truncate">{store.email}</a></div>}
                    {store.website && <div className="flex items-center gap-2"><Globe size={13} className="text-brand-orange" /><span className="truncate">{store.website}</span></div>}
                  </div>
                  {(store.phone) && (
                    <div className="mt-4 space-y-2">
                      <a href={buildWhatsApp()} target="_blank" rel="noopener noreferrer"
                        className="w-full h-10 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-[13px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                        <MessageCircle size={14} /> WhatsApp
                      </a>
                      <a href={`tel:${store.phone}`}
                        className="w-full h-10 bg-dark-secondary border border-dark-border hover:border-brand-orange text-white text-[13px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                        <Phone size={14} /> Call
                      </a>
                    </div>
                  )}
                </div>
                {store.workingHours && (
                  <div className="card p-4 mt-4">
                    <p className="text-[11px] font-bold tracking-widest uppercase text-white mb-3">Working Hours</p>
                    <p className="text-[12px] text-gray-400 whitespace-pre-line leading-relaxed">{store.workingHours}</p>
                  </div>
                )}
              </aside>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
