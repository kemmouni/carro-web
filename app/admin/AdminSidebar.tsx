"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Tag, Car, Package, Users, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Overview",   href: "/admin",            icon: LayoutDashboard },
  { label: "Products",   href: "/admin/products",   icon: Package },
  { label: "Users",      href: "/admin/users",       icon: Users },
  { label: "Categories", href: "/admin/categories",  icon: Tag },
  { label: "Brands",     href: "/admin/brands",      icon: Car },
];

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-dark-card border-r border-dark-border flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-dark-border">
        <span className="text-lg font-black tracking-tight">
          <span className="text-brand-orange">CARRO</span>
          <span className="text-white text-xs font-medium ml-1.5 bg-brand-orange/20 text-brand-orange px-1.5 py-0.5 rounded">ADMIN</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-brand-orange text-white"
                  : "text-gray-400 hover:bg-dark-secondary hover:text-white"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-dark-border">
        <p className="text-xs text-gray-500 mb-1">Signed in as</p>
        <p className="text-sm font-medium text-white truncate">{adminName}</p>
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/";
          }}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-400 mt-2 transition-colors"
        >
          <LogOut size={12} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
