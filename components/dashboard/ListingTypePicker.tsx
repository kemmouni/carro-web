"use client";

import { useRouter } from "next/navigation";
import { Wrench, Car, Package } from "lucide-react";

const TYPES = [
  {
    type: "part",
    icon: Package,
    title: "Auto Part",
    titleAr: "قطعة غيار",
    desc: "Sell a new or used car part, accessory, or component.",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20 hover:border-blue-400/60 hover:bg-blue-400/15",
  },
  {
    type: "service",
    icon: Wrench,
    title: "Service",
    titleAr: "خدمة",
    desc: "List a workshop, repair, maintenance, or automotive service.",
    color: "text-brand-orange",
    bg: "bg-brand-orange/10 border-brand-orange/20 hover:border-brand-orange/60 hover:bg-brand-orange/15",
  },
  {
    type: "car",
    icon: Car,
    title: "Car for Sale",
    titleAr: "سيارة للبيع",
    desc: "List a vehicle for sale — new, used, or luxury.",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20 hover:border-green-400/60 hover:bg-green-400/15",
  },
] as const;

export function ListingTypePicker() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl">
      {TYPES.map(({ type, icon: Icon, title, titleAr, desc, color, bg }) => (
        <button
          key={type}
          onClick={() => router.push(`/dashboard/products/new?type=${type}`)}
          className={`card border-2 p-6 flex flex-col gap-4 transition-all cursor-pointer text-left w-full ${bg}`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-current/10`}>
            <Icon size={24} className={color} />
          </div>
          <div>
            <p className="text-[16px] font-bold text-white">{title}</p>
            <p className="text-[11px] text-gray-500 mt-0.5" dir="rtl">{titleAr}</p>
            <p className="text-[12px] text-gray-400 mt-2 leading-relaxed">{desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
