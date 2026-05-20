"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

interface RecentItem {
  id:    string;
  title: string;
  price: number;
  currency: string;
  imageUrl?: string;
}

export function RecentlyViewed() {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("carro_recently_viewed");
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-title">Recently Viewed</h2>
        <button
          onClick={() => { localStorage.removeItem("carro_recently_viewed"); setItems([]); }}
          className="text-[12px] text-gray-500 hover:text-brand-orange transition-colors"
        >
          Clear <ChevronRight size={14} className="inline" />
        </button>
      </div>
      <div className="card overflow-hidden divide-y divide-dark-border">
        {items.slice(0, 5).map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.id}`}
            className="flex items-center gap-3 p-3.5 hover:bg-dark-secondary transition-colors group"
          >
            <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-dark-secondary">
              {p.imageUrl && (
                <Image
                  src={p.imageUrl}
                  alt={p.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-white truncate group-hover:text-brand-orange transition-colors">
                {p.title}
              </p>
              <p className="text-[13px] font-bold text-brand-orange mt-0.5">
                {p.currency ?? "QAR"} {p.price.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Call this inside any product page to record the view */
export function trackRecentlyViewed(item: RecentItem) {
  try {
    const raw  = localStorage.getItem("carro_recently_viewed");
    const prev: RecentItem[] = raw ? JSON.parse(raw) : [];
    // Remove duplicates, prepend new, keep max 10
    const next = [item, ...prev.filter((p) => p.id !== item.id)].slice(0, 10);
    localStorage.setItem("carro_recently_viewed", JSON.stringify(next));
  } catch {
    // ignore
  }
}
