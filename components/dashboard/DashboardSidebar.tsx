"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingBag, Star,
  Settings, Store, PlusCircle, LogOut, Home, ChevronRight,
  MessageSquare, BarChart2, Bell, Tag, Calendar, Zap, Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/context/NotificationsContext";

const NAV: Array<{ label: string; href: string; icon: React.ElementType }> = [
  { label: "Overview",       href: "/dashboard",                icon: LayoutDashboard },
  { label: "Products",       href: "/dashboard/products",       icon: Package },
  { label: "Orders",         href: "/dashboard/orders",         icon: ShoppingBag },
  { label: "Offers",         href: "/dashboard/offers",         icon: Tag },
  { label: "Bookings",       href: "/dashboard/bookings",       icon: Calendar },
  { label: "Messages",       href: "/dashboard/messages",       icon: MessageSquare },
  { label: "Notifications",  href: "/dashboard/notifications",  icon: Bell },
  { label: "Analytics",      href: "/dashboard/analytics",      icon: BarChart2 },
  { label: "Reviews",        href: "/dashboard/reviews",        icon: Star },
  { label: "Subscriptions",  href: "/dashboard/subscriptions",  icon: Zap },
  { label: "Referral",       href: "/dashboard/referral",       icon: Gift },
  { label: "Store",          href: "/dashboard/store",          icon: Store },
  { label: "Settings",       href: "/dashboard/settings",       icon: Settings },
];

interface Props {
  storeName: string;
  isVerified: boolean;
}

export function DashboardSidebar({ storeName, isVerified }: Props) {
  const pathname = usePathname();
  const router   = useRouter();
  const { unreadCount } = useNotifications();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="w-60 h-screen bg-dark-secondary border-r border-dark-border flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-dark-border">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[22px] font-black text-brand-orange tracking-tight">Warsha+</span>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Seller</span>
        </Link>
      </div>

      {/* Store badge */}
      <div className="px-4 py-3 border-b border-dark-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-brand-orange-light flex items-center justify-center flex-shrink-0">
            <Store size={16} className="text-brand-orange" />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-white truncate">{storeName}</p>
            <p className="text-[10px] text-gray-500">{isVerified ? "Verified Seller" : "Seller"}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          const isNotifications = href === "/dashboard/notifications";
          const badge = isNotifications && unreadCount > 0 ? unreadCount : 0;

          return (
            <Link
              key={href}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={href as any}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group",
                active
                  ? "bg-brand-orange text-white"
                  : "text-gray-400 hover:bg-dark-card hover:text-white"
              )}
            >
              <Icon size={16} />
              {label}
              {badge > 0 && (
                <span className="ml-auto flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
              {active && badge === 0 && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-4 space-y-1.5 border-t border-dark-border pt-3">
        <Link
          href="/dashboard/products/new"
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-brand-orange text-white text-[13px] font-semibold hover:bg-brand-orange-hover transition-colors"
        >
          <PlusCircle size={15} />
          Add Product
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-card text-[13px] transition-colors"
        >
          <Home size={15} />
          Back to Store
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-dark-card text-[13px] transition-colors"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
