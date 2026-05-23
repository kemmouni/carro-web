"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Heart, MessageCircle, Phone, Copy, ShoppingBag } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { ConditionBadge } from "@/components/ui/Badge";
import { toast } from "sonner";
import type { Condition } from "@/lib/types";

const OrderModal = dynamic(() => import("@/components/product/OrderModal"), { ssr: false });

interface Props {
  productId:    string;
  title:        string;
  price:        number;
  originalPrice?: number;
  currency:     string;
  condition:    Condition;
  partNumber?:  string;
  storeSlug:    string;
  storeName:    string;
  storePhone?:  string;
}

function buildWhatsApp(phone: string, title: string) {
  const digits  = phone.replace(/\D/g, "");
  const message = encodeURIComponent(`Hi, I'm interested in: ${title}`);
  return `https://wa.me/${digits}?text=${message}`;
}

export function ContactPanel({
  productId, title, price, originalPrice, currency, condition, partNumber,
  storeSlug, storeName, storePhone,
}: Props) {
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);

  // Check initial wishlist state
  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setWishlisted(j.data.some((item: { id: string }) => item.id === productId));
        }
      })
      .catch(() => {/* not logged in, ignore */});
  }, [productId]);

  async function toggleWishlist() {
    if (wishlistLoading) return;
    setWishlistLoading(true);
    try {
      if (wishlisted) {
        const res = await fetch(`/api/wishlist?productId=${productId}`, { method: "DELETE" });
        const j   = await res.json();
        if (j.success) { setWishlisted(false); toast.success("Removed from wishlist"); }
        else if (res.status === 401) toast.error("Sign in to save items");
        else toast.error(j.error ?? "Error");
      } else {
        const res = await fetch("/api/wishlist", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ productId }),
        });
        const j = await res.json();
        if (j.success) { setWishlisted(true); toast.success("Saved to wishlist!"); }
        else if (res.status === 401) toast.error("Sign in to save items");
        else toast.error(j.error ?? "Error");
      }
    } finally {
      setWishlistLoading(false);
    }
  }

  function copyPart() {
    if (!partNumber) return;
    navigator.clipboard.writeText(partNumber).then(() => toast.success("Part number copied!"));
  }

  return (
    <>
    {orderOpen && (
      <OrderModal
        productId={productId}
        title={title}
        price={price}
        currency={currency}
        onClose={() => setOrderOpen(false)}
      />
    )}
    <div className="space-y-4">
      {/* Info card */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <ConditionBadge condition={condition} />
          <button
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            className={cn(
              "flex items-center gap-1.5 text-[12px] font-medium transition-colors disabled:opacity-60",
              wishlisted ? "text-brand-orange" : "text-gray-400 hover:text-brand-orange"
            )}
          >
            <Heart size={14} fill={wishlisted ? "currentColor" : "none"} />
            {wishlisted ? "Saved" : "Save"}
          </button>
        </div>

        <h1 className="text-[20px] font-black leading-snug mb-3">{title}</h1>

        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-[30px] font-black text-brand-orange">{formatPrice(price, currency)}</span>
          {originalPrice && (
            <span className="text-[16px] text-gray-500 line-through">{formatPrice(originalPrice, currency)}</span>
          )}
        </div>

        {partNumber && (
          <div className="flex items-center gap-2 text-[12px] text-gray-400 pb-4 border-b border-dark-border">
            Part #:
            <span className="text-gray-200 font-medium">{partNumber}</span>
            <button onClick={copyPart} className="text-gray-500 hover:text-brand-orange transition-colors">
              <Copy size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Seller link */}
      <Link
        href={`/store/${storeSlug}`}
        className="card p-4 flex items-center gap-3 hover:border-brand-orange transition-colors block"
      >
        <div className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center text-[13px] font-black text-white flex-shrink-0">
          {storeName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-white">{storeName}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">View store →</p>
        </div>
      </Link>

      {/* Order button */}
      <button
        onClick={() => setOrderOpen(true)}
        className="w-full h-12 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2.5 transition-colors"
      >
        <ShoppingBag size={16} />
        Place Order (COD)
      </button>

      {/* Contact buttons */}
      <div className="space-y-3">
        {storePhone ? (
          <a
            href={buildWhatsApp(storePhone, title)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-12 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2.5 transition-colors"
          >
            {/* WhatsApp icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp Seller
          </a>
        ) : (
          <button
            disabled
            className="w-full h-12 bg-[#25D366]/50 text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2.5 cursor-not-allowed opacity-60"
          >
            <MessageCircle size={18} /> WhatsApp Not Available
          </button>
        )}

        {storePhone && (
          <a
            href={`tel:${storePhone}`}
            className="w-full h-12 bg-transparent border border-dark-border text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2.5 hover:border-brand-orange hover:text-brand-orange transition-colors"
          >
            <Phone size={16} /> Call Seller
          </a>
        )}
      </div>
    </div>
    </>
  );
}
