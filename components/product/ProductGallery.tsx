"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImage {
  id:        string;
  url:       string;
  isPrimary: boolean;
  sortOrder: number;
}

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [active, setActive] = useState(0);

  const imgs = images.length ? images : [{ id: "ph", url: "/images/placeholder.jpg", isPrimary: true, sortOrder: 0 }];
  const cur  = imgs[active] ?? imgs[0];

  return (
    <div className="card overflow-hidden">
      {/* Main image */}
      <div className="relative aspect-[4/3] bg-dark-secondary overflow-hidden">
        <Image
          src={cur.url}
          alt="Product"
          fill
          className="object-cover transition-opacity duration-300"
          priority
          unoptimized
        />

        {/* Expand hint */}
        <button className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-lg flex items-center justify-center text-white hover:bg-brand-orange transition-colors backdrop-blur-sm">
          <Expand size={14} />
        </button>

        {/* Prev / Next */}
        {imgs.length > 1 && (
          <>
            <button
              onClick={() => setActive((a) => (a - 1 + imgs.length) % imgs.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-brand-orange transition-colors backdrop-blur-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setActive((a) => (a + 1) % imgs.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-brand-orange transition-colors backdrop-blur-sm"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Image count */}
        {imgs.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-black/60 rounded-full text-[11px] text-white backdrop-blur-sm">
            {active + 1} / {imgs.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {imgs.length > 1 && (
        <div className="flex gap-2 p-3 bg-[#161616] overflow-x-auto no-scrollbar">
          {imgs.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={cn(
                "w-[78px] h-[62px] rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors",
                i === active ? "border-brand-orange" : "border-transparent hover:border-gray-500"
              )}
            >
              <Image src={img.url} alt="" width={78} height={62} className="object-cover w-full h-full" unoptimized />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
