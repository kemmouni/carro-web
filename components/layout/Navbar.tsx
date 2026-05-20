"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Search, ShoppingCart, Heart, User, ChevronDown,
  MapPin, Menu, X, LogOut, Settings, Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/browse",  label: "Browse" },
  { href: "/search",  label: "Shop by Car" },
  { href: "/search?sort=deals", label: "Deals" },
  { href: "/brands",  label: "Brands" },
  { href: "/services",label: "Services" },
];

export function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const [query, setQuery]   = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".user-menu-wrap")) setUserOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-50 bg-[#111] border-b border-dark-border">
      <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center gap-5">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex flex-col leading-none">
          <span className="text-2xl font-black text-brand-orange tracking-tight">Carro</span>
          <span className="text-[8px] tracking-[2px] text-gray-500 uppercase">Auto Parts Marketplace</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-[13px] font-medium px-3 py-1.5 rounded-lg transition-colors duration-150 relative",
                pathname === l.href
                  ? "text-brand-orange after:absolute after:bottom-[-22px] after:left-0 after:right-0 after:h-[2px] after:bg-brand-orange"
                  : "text-gray-300 hover:text-white"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 relative max-w-lg hidden sm:block">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search parts, brands, categories..."
            className="input pr-12"
          />
          <button
            type="submit"
            className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center bg-brand-orange rounded-r-xl text-white hover:bg-brand-orange-hover transition-colors"
          >
            <Search size={15} strokeWidth={2.5} />
          </button>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-auto lg:ml-0">

          {/* Location picker */}
          <button className="hidden md:flex items-center gap-1.5 h-9 px-3 border border-dark-border rounded-lg text-[13px] font-medium text-white hover:border-brand-orange transition-colors">
            <MapPin size={13} className="text-brand-orange" />
            Doha, Qatar
            <ChevronDown size={12} className="text-gray-400" />
          </button>

          {/* Wishlist */}
          <Link href="/wishlist" className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-300 hover:text-white hover:bg-dark-secondary transition-colors">
            <Heart size={18} />
          </Link>

          {/* Cart */}
          <Link href="/cart" className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-300 hover:text-white hover:bg-dark-secondary transition-colors">
            <ShoppingCart size={18} />
            <span className="absolute top-1 right-1 w-4 h-4 bg-brand-orange rounded-full text-[9px] font-bold flex items-center justify-center">3</span>
          </Link>

          {/* User menu */}
          <div className="relative user-menu-wrap hidden sm:block">
            <button
              onClick={() => setUserOpen(!userOpen)}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-gray-300 hover:text-white hover:bg-dark-secondary transition-colors text-[13px] font-medium"
            >
              <User size={16} />
              My Account
              <ChevronDown size={12} className={cn("transition-transform", userOpen && "rotate-180")} />
            </button>

            {userOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-dark-card border border-dark-border rounded-xl shadow-card overflow-hidden animate-fade-in z-50">
                <div className="p-3 border-b border-dark-border">
                  <p className="text-sm font-semibold">My Account</p>
                  <p className="text-xs text-gray-400 mt-0.5">Manage your profile</p>
                </div>
                <div className="p-1.5">
                  {[
                    { href: "/account/profile", icon: User,     label: "Profile" },
                    { href: "/account/listings",icon: Package,  label: "My Listings" },
                    { href: "/account/settings", icon: Settings, label: "Settings" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-gray-300 hover:text-white hover:bg-dark-secondary transition-colors"
                      onClick={() => setUserOpen(false)}
                    >
                      <item.icon size={14} />
                      {item.label}
                    </Link>
                  ))}
                  <div className="border-t border-dark-border my-1.5" />
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-brand-orange hover:bg-brand-orange-light transition-colors"
                    onClick={() => setUserOpen(false)}
                  >
                    <LogOut size={14} />
                    Sign In / Register
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Auth buttons (guest) */}
          <div className="hidden sm:flex items-center gap-2">
            <Link href="/auth/login"    className="h-9 px-4 border border-dark-border rounded-lg text-[13px] font-medium text-white hover:border-brand-orange hover:text-brand-orange transition-colors flex items-center">Sign In</Link>
            <Link href="/auth/register" className="h-9 px-4 bg-brand-orange rounded-lg text-[13px] font-semibold text-white hover:bg-brand-orange-hover transition-colors flex items-center">Register</Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-300 hover:text-white hover:bg-dark-secondary"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-dark-border bg-[#111] px-6 py-4 flex flex-col gap-3 animate-slide-up">
          <form onSubmit={handleSearch} className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search parts..."
              className="input pr-11"
            />
            <button type="submit" className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center bg-brand-orange rounded-r-xl text-white">
              <Search size={15} />
            </button>
          </form>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn("text-sm font-medium py-1", pathname === l.href ? "text-brand-orange" : "text-gray-300")}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2 border-t border-dark-border">
            <Link href="/auth/login"    className="flex-1 h-9 border border-dark-border rounded-lg text-[13px] font-medium text-white flex items-center justify-center">Sign In</Link>
            <Link href="/auth/register" className="flex-1 h-9 bg-brand-orange rounded-lg text-[13px] font-semibold text-white flex items-center justify-center">Register</Link>
          </div>
        </div>
      )}
    </header>
  );
}
