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
  return (
    <Link
      href={`/browse/${category.slug}`}
      className={cn(
        "card group p-5 flex flex-col relative overflow-hidden transition-all duration-200",
        "hover:border-brand-orange hover:-translate-y-1 hover:shadow-orange",
        className
      )}
    >
      {/* Bottom accent line on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-orange scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />

      {/* Image */}
      <div className="h-[130px] flex items-center justify-center mb-4">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={category.name}
            width={160}
            height={120}
            className="object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.6)] transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="w-24 h-24 bg-dark-secondary rounded-full flex items-center justify-center text-3xl">🔧</div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-white mb-1">{category.name}</h3>
          <p className="text-[12px] text-gray-400">
            {category._count?.products?.toLocaleString() ?? 0} parts available
          </p>
        </div>
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
          "bg-brand-orange-light text-brand-orange group-hover:bg-brand-orange group-hover:text-white"
        )}>
          <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}
