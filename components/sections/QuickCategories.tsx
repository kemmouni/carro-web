import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  EngineIcon, BrakesIcon, SuspensionIcon, ElectricalIcon,
  ACIcon, FilterIcon, BodyIcon, WheelsIcon, InteriorIcon,
} from "@/components/ui/CategoryIcon";
import type { JSX } from "react";

interface QuickCat {
  label: string;
  icon:  JSX.Element;
  href:  string;
}

const CATS: QuickCat[] = [
  { label: "Engine",     icon: <EngineIcon     size={26} />, href: "/search?q=engine"     },
  { label: "Brakes",     icon: <BrakesIcon     size={26} />, href: "/search?q=brakes"     },
  { label: "Suspension", icon: <SuspensionIcon size={26} />, href: "/search?q=suspension" },
  { label: "Electrical", icon: <ElectricalIcon size={26} />, href: "/search?q=electrical" },
  { label: "AC",         icon: <ACIcon         size={26} />, href: "/search?q=ac"         },
  { label: "Filters",    icon: <FilterIcon     size={26} />, href: "/search?q=filter"     },
  { label: "Body",       icon: <BodyIcon       size={26} />, href: "/search?q=body"       },
  { label: "Wheels",     icon: <WheelsIcon     size={26} />, href: "/search?q=wheels"     },
  { label: "Interior",   icon: <InteriorIcon   size={26} />, href: "/search?q=interior"   },
];

export function QuickCategories() {
  return (
    <>
      {/* Mobile: circle pills with scroll */}
      <div className="md:hidden px-4 py-4 bg-[#0f0f0f]">
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
          {CATS.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div className="w-14 h-14 rounded-full bg-dark-secondary border border-dark-border flex items-center justify-center text-brand-orange hover:bg-brand-orange hover:text-white transition-colors duration-150">
                {cat.icon}
              </div>
              <span className="text-[10px] font-semibold text-gray-400 whitespace-nowrap">{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop: horizontal bar */}
      <div className="hidden md:block bg-dark-secondary border-y border-dark-border">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex items-stretch overflow-x-auto no-scrollbar divide-x divide-dark-border">
            {CATS.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className={cn(
                  "flex flex-col items-center gap-2.5 px-5 py-4 flex-shrink-0 text-center min-w-[80px]",
                  "text-gray-400 hover:text-brand-orange hover:bg-brand-orange-light transition-colors duration-150 group"
                )}
              >
                <span className="group-hover:scale-110 transition-transform duration-150">
                  {cat.icon}
                </span>
                <span className="text-[11px] font-semibold whitespace-nowrap">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
