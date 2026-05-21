"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, GitCompareArrows } from "lucide-react";
import { useState } from "react";
import { cn, formatPrice, primaryImage, PLACEHOLDER_IMG, timeAgo } from "@/lib/utils";
import { ConditionBadge } from "./Badge";
import { StarRating } from "./StarRating";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  variant?: "grid" | "list" | "compact";
  className?: string;
}

export function ProductCard({ product, variant = "grid", className }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const imgUrl = primaryImage(product.images);

  if (variant === "compact") return <CompactProductCard product={product} className={className} />;

  return (
    <Link
      href={`/product/${product.id}`}
      className={cn("card card-hover group block overflow-hidden", className)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-dark-secondary overflow-hidden">
        <Image
          src={imgUrl}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          sizes="(max-width:768px) 50vw, (max-width:1200px) 33vw, 25vw"
        />

        {/* Condition badge */}
        <div className="absolute top-2.5 left-2.5">
          <ConditionBadge condition={product.condition} />
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted); }}
          className={cn(
            "absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200",
            wishlisted ? "bg-brand-orange text-white" : "bg-black/50 text-gray-300 hover:text-brand-orange hover:bg-black/70"
          )}
        >
          <Heart size={14} fill={wishlisted ? "currentColor" : "none"} />
        </button>

        {/* Compare */}
        <CompareButtonInline productId={product.id} />
      </div>

      {/* Body */}
      <div className="p-3.5">
        <h3 className="text-[13px] font-semibold text-white leading-snug mb-1.5 line-clamp-2">
          {product.title}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-[17px] font-bold text-brand-orange">
            {formatPrice(product.price, product.currency)}
          </span>
          {product.originalPrice && (
            <span className="text-[12px] text-gray-500 line-through">
              {formatPrice(product.originalPrice, product.currency)}
            </span>
          )}
        </div>

        {/* Location + time */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-2">
          <div className="flex items-center gap-1">
            <MapPin size={10} />
            {product.store.city || "Qatar"}
          </div>
          {product.createdAt && (
            <span className="text-gray-600">{timeAgo(product.createdAt)}</span>
          )}
        </div>

        {/* Seller + rating */}
        {product.store.avgRating && (
          <div className="flex items-center gap-2 pt-2 border-t border-dark-border">
            <div className="w-5 h-5 rounded-full bg-brand-orange flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0 overflow-hidden">
              {product.store.logoUrl
                ? <Image src={product.store.logoUrl} alt="" width={20} height={20} className="object-cover" />
                : product.store.name[0]}
            </div>
            <span className="text-[11px] text-gray-400 truncate flex-1">{product.store.name}</span>
            <StarRating rating={product.store.avgRating} showCount={false} size={11} />
          </div>
        )}
      </div>
    </Link>
  );
}

function CompareButtonInline({ productId }: { productId: string }) {
  const [inList, setInList] = useState(false);
  // Read from localStorage on mount
  useState(() => {
    if (typeof window !== "undefined") {
      try {
        const ids = JSON.parse(localStorage.getItem("carro_compare") ?? "[]");
        setInList(ids.includes(productId));
      } catch {}
    }
  });

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    try {
      const ids: string[] = JSON.parse(localStorage.getItem("carro_compare") ?? "[]");
      if (ids.includes(productId)) {
        const next = ids.filter((id) => id !== productId);
        localStorage.setItem("carro_compare", JSON.stringify(next));
        setInList(false);
      } else {
        if (ids.length >= 3) return;
        const next = [...ids, productId];
        localStorage.setItem("carro_compare", JSON.stringify(next));
        setInList(true);
        window.dispatchEvent(new Event("compare-updated"));
      }
    } catch {}
  }

  return (
    <button
      onClick={toggle}
      title="Compare"
      className={cn(
        "absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100",
        inList ? "bg-brand-orange text-white opacity-100" : "bg-black/50 text-gray-300 hover:text-white"
      )}
    >
      <GitCompareArrows size={12} />
    </button>
  );
}

function CompactProductCard({ product, className }: { product: Product; className?: string }) {
  const [wishlisted, setWishlisted] = useState(false);
  const imgUrl = primaryImage(product.images);

  return (
    <Link
      href={`/product/${product.id}`}
      className={cn("card card-hover flex items-center gap-3 p-3 group", className)}
    >
      <div className="relative w-[70px] h-[70px] rounded-xl overflow-hidden flex-shrink-0 bg-dark-secondary">
        <Image src={imgUrl} alt={product.title} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-white truncate">{product.title}</p>
        <p className="text-[15px] font-bold text-brand-orange mt-0.5">{formatPrice(product.price, product.currency)}</p>
        <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
          <MapPin size={9} />
          {product.store.city}
        </div>
      </div>
    </Link>
  );
}
