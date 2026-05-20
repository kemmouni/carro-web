import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: number;
  className?: string;
  showCount?: boolean;
}

export function StarRating({ rating, count, size = 13, className, showCount = true }: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "fill-dark-border text-dark-border"}
          />
        ))}
      </div>
      <span className="text-[12px] font-semibold text-white ml-0.5">{rating.toFixed(1)}</span>
      {showCount && count !== undefined && (
        <span className="text-[11px] text-gray-500">({count})</span>
      )}
    </div>
  );
}
