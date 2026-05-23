import Link from "next/link";
import { cn } from "@/lib/utils";
import { LISTING_TYPES, type ListingType } from "@/lib/listing-types";

interface Props {
  active: ListingType;
}

/**
 * Top-level tab switcher: Parts / Services / Cars.
 * Each tab is a Link so the page is server-rendered + cacheable
 * per type, and the URL is shareable.
 */
export function ListingTypeTabs({ active }: Props) {
  return (
    <div className="px-4 md:px-0 pt-3 pb-2 md:pt-4 md:pb-3">
      <div className="md:max-w-screen-xl md:mx-auto md:px-6">
        <div className="flex gap-1 p-1 bg-dark-card border border-dark-border rounded-2xl">
          {LISTING_TYPES.map((t) => {
            const isActive = t.id === active;
            const href = t.id === "PART" ? "/" : `/?type=${t.slug}`;
            return (
              <Link
                key={t.id}
                href={href}
                className={cn(
                  "flex-1 py-2.5 px-3 rounded-xl text-center transition-colors duration-150",
                  isActive
                    ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/30"
                    : "text-gray-400 hover:text-white"
                )}
              >
                <div className="font-bold text-[13px] md:text-[14px] leading-none">
                  {t.label}
                </div>
                <div
                  className={cn(
                    "text-[10px] md:text-[11px] mt-1 leading-none",
                    isActive ? "text-white/85" : "text-gray-500"
                  )}
                  dir="rtl"
                >
                  {t.labelAr}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
