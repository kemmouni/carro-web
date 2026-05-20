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
  // Only use imageUrl from DB — no broken local file fallback
  const imageUrl = category.imageUrl ?? null;

  return (
    <Link
      href={`/search?category=${category.slug}`}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-dark-border bg-dark-secondary",
        "hover:border-brand-orange transition-all duration-300",
        className
      )}
    >
      {/* Background image */}
      <div className="relative h-[160px] overflow-hidden">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110 brightness-75"
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-dark-card">
            <div className="text-4xl opacity-30">🔧</div>
          </div>
        )}

        {/* Count badge */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[10px] font-bold text-white">
          {(category._count?.products ?? 0).toLocaleString()} parts
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3.5">
        <h3 className="text-[14px] font-bold text-white group-hover:text-brand-orange transition-colors">
          {category.name}
        </h3>
        <div className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0",
          "bg-brand-orange-light text-brand-orange group-hover:bg-brand-orange group-hover:text-white"
        )}>
          <ArrowRight size={13} />
        </div>
      </div>
    </Link>
  );
}
