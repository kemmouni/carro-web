"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, MessageSquare, User } from "lucide-react";

const TABS = [
  { label: "Home",     href: "/",                  icon: Home },
  { label: "Browse",   href: "/browse",             icon: Search },
  { label: "Post",     href: "/dashboard/products/new", icon: Plus, primary: true },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { label: "Profile",  href: "/dashboard",          icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f0f] border-t border-dark-border">
      <div className="flex items-center justify-around py-2 pb-safe">
        {TABS.map(({ label, href, icon: Icon, primary }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          if (primary) {
            return (
              <Link key={href} href={href as any} className="flex flex-col items-center -mt-5">
                <span className="w-12 h-12 rounded-full bg-brand-orange flex items-center justify-center shadow-lg shadow-brand-orange/40">
                  <Icon size={22} className="text-white" strokeWidth={2.5} />
                </span>
                <span className="text-[10px] text-gray-500 mt-1 font-medium">{label}</span>
              </Link>
            );
          }
          return (
            <Link
              key={href}
              href={href as any}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                active ? "text-brand-orange" : "text-gray-500"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
