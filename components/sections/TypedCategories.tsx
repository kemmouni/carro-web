import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Wrench, ClipboardCheck, ShieldCheck, Sparkles, Droplets, CircleDot,
  Car, PaintBucket, Snowflake, BatteryCharging, Truck, SunDim,
  LifeBuoy, SquareDashed, GitCompare, Droplet, KeyRound,
  CarFront, Wind, Zap, Gem, Clock, Briefcase,
} from "lucide-react";
import type { JSX } from "react";
import {
  SERVICE_CATEGORIES, CAR_BODY_TYPES, type ListingType,
} from "@/lib/listing-types";
import {
  EngineIcon, BrakesIcon, SuspensionIcon, ElectricalIcon,
  ACIcon, FilterIcon, BodyIcon, WheelsIcon, InteriorIcon,
} from "@/components/ui/CategoryIcon";

// ── Icon name -> Lucide component map (for services + cars) ──
const ICONS: Record<string, (props: { size?: number }) => JSX.Element> = {
  wrench: ({ size = 26 }) => <Wrench size={size} />,
  "clipboard-check": ({ size = 26 }) => <ClipboardCheck size={size} />,
  "shield-check": ({ size = 26 }) => <ShieldCheck size={size} />,
  sparkles: ({ size = 26 }) => <Sparkles size={size} />,
  droplets: ({ size = 26 }) => <Droplets size={size} />,
  "circle-dot": ({ size = 26 }) => <CircleDot size={size} />,
  car: ({ size = 26 }) => <Car size={size} />,
  "paint-bucket": ({ size = 26 }) => <PaintBucket size={size} />,
  snowflake: ({ size = 26 }) => <Snowflake size={size} />,
  "battery-charging": ({ size = 26 }) => <BatteryCharging size={size} />,
  truck: ({ size = 26 }) => <Truck size={size} />,
  "sun-dim": ({ size = 26 }) => <SunDim size={size} />,
  "life-buoy": ({ size = 26 }) => <LifeBuoy size={size} />,
  "square-dashed": ({ size = 26 }) => <SquareDashed size={size} />,
  "git-compare": ({ size = 26 }) => <GitCompare size={size} />,
  droplet: ({ size = 26 }) => <Droplet size={size} />,
  "key-round": ({ size = 26 }) => <KeyRound size={size} />,
  "car-front": ({ size = 26 }) => <CarFront size={size} />,
  wind: ({ size = 26 }) => <Wind size={size} />,
  zap: ({ size = 26 }) => <Zap size={size} />,
  gem: ({ size = 26 }) => <Gem size={size} />,
  clock: ({ size = 26 }) => <Clock size={size} />,
  briefcase: ({ size = 26 }) => <Briefcase size={size} />,
};

// ── The parts catalog uses the existing SVG icons ──
const PARTS_CATS = [
  { label: "Engine",     icon: <EngineIcon     size={26} />, href: "/search?q=engine" },
  { label: "Brakes",     icon: <BrakesIcon     size={26} />, href: "/search?q=brakes" },
  { label: "Suspension", icon: <SuspensionIcon size={26} />, href: "/search?q=suspension" },
  { label: "Electrical", icon: <ElectricalIcon size={26} />, href: "/search?q=electrical" },
  { label: "AC",         icon: <ACIcon         size={26} />, href: "/search?q=ac" },
  { label: "Filters",    icon: <FilterIcon     size={26} />, href: "/search?q=filter" },
  { label: "Body",       icon: <BodyIcon       size={26} />, href: "/search?q=body" },
  { label: "Wheels",     icon: <WheelsIcon     size={26} />, href: "/search?q=wheels" },
  { label: "Interior",   icon: <InteriorIcon   size={26} />, href: "/search?q=interior" },
];

interface Props {
  type: ListingType;
}

export function TypedCategories({ type }: Props) {
  const cats =
    type === "PART"
      ? PARTS_CATS
      : type === "SERVICE"
      ? SERVICE_CATEGORIES.map((s) => ({
          label: s.name,
          icon: ICONS[s.iconName]?.({ size: 26 }) ?? <Wrench size={26} />,
          href: `/search?type=services&service=${s.slug}`,
        }))
      : CAR_BODY_TYPES.map((b) => ({
          label: b.name,
          icon: ICONS[b.iconName]?.({ size: 26 }) ?? <Car size={26} />,
          href: `/search?type=cars&body=${b.slug}`,
        }));

  return (
    <>
      {/* Mobile: circle pills with horizontal scroll */}
      <div className="md:hidden px-4 py-3 bg-[#0f0f0f]">
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
          {cats.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div className="w-14 h-14 rounded-full bg-dark-secondary border border-dark-border flex items-center justify-center text-brand-orange hover:bg-brand-orange hover:text-white transition-colors duration-150">
                {cat.icon}
              </div>
              <span className="text-[10px] font-semibold text-gray-400 whitespace-nowrap">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop: horizontal bar */}
      <div className="hidden md:block bg-dark-secondary border-y border-dark-border">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex items-stretch overflow-x-auto no-scrollbar divide-x divide-dark-border">
            {cats.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className={cn(
                  "flex flex-col items-center gap-2.5 px-5 py-4 flex-shrink-0 text-center min-w-[88px]",
                  "text-gray-400 hover:text-brand-orange hover:bg-brand-orange-light transition-colors duration-150 group"
                )}
              >
                <span className="group-hover:scale-110 transition-transform duration-150">
                  {cat.icon}
                </span>
                <span className="text-[11px] font-semibold whitespace-nowrap">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
