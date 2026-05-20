import { cn } from "@/lib/utils";
import { Condition } from "@/lib/types";

interface BadgeProps {
  condition: Condition;
  className?: string;
}

const MAP: Record<Condition, { label: string; cls: string }> = {
  NEW:      { label: "New",      cls: "bg-green-600 text-white" },
  LIKE_NEW: { label: "Like New", cls: "bg-brand-orange text-white" },
  USED:     { label: "Used",     cls: "bg-[#4a4a4a] text-gray-200" },
};

export function ConditionBadge({ condition, className }: BadgeProps) {
  const { label, cls } = MAP[condition];
  return (
    <span className={cn("inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase", cls, className)}>
      {label}
    </span>
  );
}

export function TrendingBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-brand-orange text-white", className)}>
      Trending
    </span>
  );
}

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-[12px] font-semibold text-green-400", className)}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      Verified Seller
    </span>
  );
}
