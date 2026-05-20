"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Package, Loader2, Trash2, MessageCircle } from "lucide-react";
import { formatPrice, timeAgo } from "@/lib/utils";
import { ConditionBadge } from "@/components/ui/Badge";

interface WishlistItem {
  wishlistId: string;
  savedAt:    string;
  id:         string;
  title:      string;
  price:      number;
  originalPrice?: number;
  currency:   string;
  condition:  string;
  isActive:   boolean;
  images:     Array<{ url: string }>;
  store:      { id: string; name: string; slug: string; city: string } | null;
}

function buildWhatsApp(phone: string, title: string) {
  const digits  = phone.replace(/\D/g, "");
  const message = encodeURIComponent(`Hi, I'm interested in: ${title}`);
  return `https://wa.me/${digits}?text=${message}`;
}

export default function WishlistPage() {
  const [items,   setItems]   = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setItems(j.data);
        else setError(j.error ?? "Failed to load wishlist");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  async function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.id !== productId));
    await fetch(`/api/wishlist?productId=${productId}`, { method: "DELETE" });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-brand-orange-light flex items-center justify-center">
          <Heart size={18} className="text-brand-orange" fill="currentColor" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">My Wishlist</h1>
          <p className="text-gray-500 text-sm">{items.length} saved item{items.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {error && (
        <div className="card p-5 text-center text-red-400 mb-6">{error}</div>
      )}

      {!loading && items.length === 0 && !error && (
        <div className="card flex flex-col items-center justify-center py-24 text-center">
          <Heart size={48} className="text-gray-700 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500 text-sm mb-6">Save products you like and find them here later.</p>
          <Link href="/search" className="btn-primary">Browse Products</Link>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item) => (
            <div key={item.wishlistId} className="card overflow-hidden group relative">
              {/* Remove button */}
              <button
                onClick={() => removeItem(item.id)}
                className="absolute top-2 right-2 z-10 w-8 h-8 rounded-lg bg-dark-primary/80 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-dark-primary transition-colors opacity-0 group-hover:opacity-100"
                title="Remove from wishlist"
              >
                <Trash2 size={13} />
              </button>

              {/* Image */}
              <Link href={`/product/${item.id}`} className="block">
                <div className="relative aspect-square bg-dark-secondary overflow-hidden">
                  {item.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.images[0].url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={32} className="text-gray-700" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <ConditionBadge condition={item.condition as "NEW" | "LIKE_NEW" | "USED"} />
                  </div>
                  {!item.isActive && (
                    <div className="absolute inset-0 bg-dark-primary/60 flex items-center justify-center">
                      <span className="text-[11px] font-bold text-red-400 bg-dark-primary px-2 py-1 rounded">Unavailable</span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="p-3.5">
                <Link href={`/product/${item.id}`}>
                  <h3 className="text-[13px] font-semibold text-white leading-snug mb-2 line-clamp-2 hover:text-brand-orange transition-colors">{item.title}</h3>
                </Link>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-[17px] font-black text-brand-orange">{formatPrice(item.price, item.currency)}</span>
                  {item.originalPrice && (
                    <span className="text-[12px] text-gray-500 line-through">{formatPrice(item.originalPrice, item.currency)}</span>
                  )}
                </div>
                {item.store && (
                  <Link href={`/store/${item.store.slug}`} className="text-[11px] text-gray-500 hover:text-brand-orange transition-colors block truncate mb-3">
                    {item.store.name} · {item.store.city}
                  </Link>
                )}
                <p className="text-[10px] text-gray-600 mb-3">Saved {timeAgo(item.savedAt)}</p>

                {/* Contact shortcut — shown on hover */}
                <Link
                  href={`/product/${item.id}`}
                  className="w-full h-9 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-[12px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle size={13} /> Contact Seller
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
