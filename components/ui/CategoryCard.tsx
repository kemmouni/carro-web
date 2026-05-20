import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const imageUrl = category.imageUrl ?? null;
  const count = (category._count?.products ?? 0).toLocaleString();

  return (
    <Link
      href={`/search?category=${category.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-dark-border bg-[#0d0d0d]",
        "hover:border-brand-orange transition-all duration-300",
        className
      )}
    >
      {/* Image area — object-contain so the full image is always visible */}
      <div className="relative flex-1 flex items-center justify-center bg-[#0d0d0d] min-h-[150px] p-4">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={category.name}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-20">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Footer — text over a dark strip */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-[#131313] border-t border-dark-border/50">
        <div>
          <h3 className="text-[13px] font-bold text-white group-hover:text-brand-orange transition-colors leading-tight">
            {category.name}
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {count} parts available
          </p>
        </div>
        <div className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ml-2 transition-all duration-200",
          "bg-brand-orange/10 text-brand-orange group-hover:bg-brand-orange group-hover:text-white"
        )}>
          <ArrowRight size={13} />
        </div>
      </div>
    </Link>
  );
}
