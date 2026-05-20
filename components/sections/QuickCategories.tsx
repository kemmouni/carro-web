import Link from "next/link";
import { cn } from "@/lib/utils";

const CATS = [
  { label: "Engine",     icon: "⚙️",  href: "/browse/engine" },
  { label: "Brakes",     icon: "🔴",  href: "/browse/brakes" },
  { label: "Suspension", icon: "🔩",  href: "/browse/suspension" },
  { label: "Electrical", icon: "⚡",  href: "/browse/electrical" },
  { label: "AC",         icon: "❄️",  href: "/browse/ac-heating" },
  { label: "Filters",    icon: "🌀",  href: "/browse/filters" },
  { label: "Body",       icon: "🚗",  href: "/browse/body" },
  { label: "Wheels",     icon: "🛞",  href: "/browse/wheels" },
];

export function QuickCategories() {
  return (
    <div className="bg-dark-secondary border-y border-dark-border">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex items-stretch overflow-x-auto no-scrollbar divide-x divide-dark-border">
          {CATS.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className={cn(
                "flex flex-col items-center gap-2 px-5 py-4 flex-shrink-0 text-center",
                "text-gray-300 hover:text-brand-orange hover:bg-brand-orange-light transition-colors duration-150 group"
              )}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-[12px] font-medium whitespace-nowrap">{cat.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
