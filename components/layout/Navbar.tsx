"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Search, Heart, User, ChevronDown,
  MapPin, Menu, X, LogOut, Settings, Package,
  Store, LayoutDashboard, PlusCircle, Bell, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useNotifications } from "@/context/NotificationsContext";
import { useLanguage } from "@/context/LanguageContext";

interface SessionUser {
  id:        string;
  email:     string;
  fullName:  string | null;
  role:      string;
  storeId:   string | null;
  storeSlug: string | null;
  storeName: string | null;
}

export function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { t, isAr } = useLanguage();

  const [query, setQuery]       = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  // Auth state
  const [user,        setUser]        = useState<SessionUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use shared notifications context (polls every 15 s, plays sound on new)
  const { unreadCount, notifications, markAllRead } = useNotifications();

  // Nav links — re-computed when language changes
  const NAV_LINKS = [
    { href: "/browse", label: t("browse") },
    { href: "/search", label: t("search") },
    { href: "/deals",  label: t("deals")  },
  ];

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((j) => { if (j.success) setUser(j.data); })
      .finally(() => setAuthLoading(false));
  }, []);

  async function markNotificationsRead() {
    if (!unreadCount) return;
    await markAllRead();
  }

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".user-menu-wrap")) setUserOpen(false);
      if (!(e.target as Element).closest(".notif-wrap")) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const displayName = user?.fullName || user?.email?.split("@")[0] || "Account";
  const isSeller = user?.role === "SELLER" || !!user?.storeId;
  const isAdmin  = user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 bg-[#111] border-b border-dark-border">
      <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center gap-5">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex flex-col leading-none">
          <span className="text-2xl font-black text-brand-orange tracking-tight">Warsha+</span>
          <span className={`text-[8px] tracking-[2px] text-gray-500 uppercase ${isAr ? "tracking-normal font-arabic" : ""}`}>
            {t("autoPartsMarket")}
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-[13px] font-medium px-3 py-1.5 rounded-lg transition-colors duration-150",
                isAr && "font-arabic",
                pathname === l.href
                  ? "text-brand-orange"
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
            placeholder={t("searchParts")}
            className={`input pr-12 ${isAr ? "font-arabic text-right" : ""}`}
            dir={isAr ? "rtl" : "ltr"}
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

          {/* Language switcher */}
          <LanguageSwitcher />

          {/* Location */}
          <button className={`hidden md:flex items-center gap-1.5 h-9 px-3 border border-dark-border rounded-lg text-[13px] font-medium text-white hover:border-brand-orange transition-colors ${isAr ? "font-arabic" : ""}`}>
            <MapPin size={13} className="text-brand-orange" />
            {t("doha")}
            <ChevronDown size={12} className="text-gray-400" />
          </button>

          {/* Sell button — show for buyers/guests (not admin) */}
          {!authLoading && !isSeller && !isAdmin && (
            <Link
              href={user ? "/seller/setup" : "/auth/register"}
              className={`hidden md:flex h-9 px-4 items-center gap-1.5 bg-brand-orange-light border border-brand-orange/40 text-brand-orange text-[13px] font-semibold rounded-lg hover:bg-brand-orange hover:text-white transition-colors ${isAr ? "font-arabic" : ""}`}
            >
              <Store size={14} />
              {t("sell")}
            </Link>
          )}

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-300 hover:text-white hover:bg-dark-secondary transition-colors"
            title={t("wishlist")}
          >
            <Heart size={18} />
          </Link>

          {/* Notifications bell — authenticated users only */}
          {user && (
            <div className="relative notif-wrap">
              <button
                onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markNotificationsRead(); }}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-300 hover:text-white hover:bg-dark-secondary transition-colors"
                title={t("notifications")}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-brand-orange rounded-full text-[9px] font-black text-white flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-dark-card border border-dark-border rounded-xl shadow-card overflow-hidden animate-fade-in z-50">
                  <div className="px-4 py-3 border-b border-dark-border flex items-center justify-between">
                    <p className={`text-[13px] font-bold text-white ${isAr ? "font-arabic" : ""}`}>{t("notifications")}</p>
                    {unreadCount > 0 && (
                      <span className="text-[11px] text-brand-orange">{unreadCount} new</span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center">
                        <Bell size={24} className="text-gray-600 mx-auto mb-2" />
                        <p className={`text-[12px] text-gray-500 ${isAr ? "font-arabic" : ""}`}>{t("noNotifications")}</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <a
                          key={n.id}
                          href={n.link ?? "#"}
                          className={`flex gap-3 px-4 py-3 border-b border-dark-border last:border-none hover:bg-dark-secondary transition-colors ${!n.isRead ? "bg-brand-orange/5" : ""}`}
                          onClick={() => setNotifOpen(false)}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? "bg-brand-orange" : "bg-transparent"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-white">{n.title}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-gray-600 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                          </div>
                        </a>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User menu — authenticated */}
          {!authLoading && user ? (
            <div className="relative user-menu-wrap hidden sm:block">
              <button
                onClick={() => setUserOpen(!userOpen)}
                className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-gray-300 hover:text-white hover:bg-dark-secondary transition-colors text-[13px] font-medium"
              >
                <div className="w-6 h-6 rounded-full bg-brand-orange flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">
                  {displayName[0]?.toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{displayName}</span>
                <ChevronDown size={12} className={cn("transition-transform", userOpen && "rotate-180")} />
              </button>

              {userOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-dark-card border border-dark-border rounded-xl shadow-card overflow-hidden animate-fade-in z-50">
                  <div className="p-3 border-b border-dark-border">
                    <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{user.email}</p>
                    {isSeller && user.storeName && (
                      <p className="text-[11px] text-brand-orange mt-0.5 flex items-center gap-1">
                        <Store size={10} /> {user.storeName}
                      </p>
                    )}
                  </div>
                  <div className="p-1.5">
                    {isSeller && (
                      <>
                        <Link
                          href="/dashboard"
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-gray-300 hover:text-white hover:bg-dark-secondary transition-colors ${isAr ? "font-arabic" : ""}`}
                          onClick={() => setUserOpen(false)}
                        >
                          <LayoutDashboard size={14} /> {t("dashboard")}
                        </Link>
                        <Link
                          href="/dashboard/products/new"
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-gray-300 hover:text-white hover:bg-dark-secondary transition-colors ${isAr ? "font-arabic" : ""}`}
                          onClick={() => setUserOpen(false)}
                        >
                          <PlusCircle size={14} /> {t("addProduct")}
                        </Link>
                        {user.storeSlug && (
                          <Link
                            href={`/store/${user.storeSlug}`}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-gray-300 hover:text-white hover:bg-dark-secondary transition-colors ${isAr ? "font-arabic" : ""}`}
                            onClick={() => setUserOpen(false)}
                          >
                            <Store size={14} /> {t("myStore")}
                          </Link>
                        )}
                        <div className="border-t border-dark-border my-1.5" />
                      </>
                    )}
                    {!isSeller && !isAdmin && (
                      <Link
                        href="/seller/setup"
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-brand-orange hover:bg-brand-orange-light transition-colors ${isAr ? "font-arabic" : ""}`}
                        onClick={() => setUserOpen(false)}
                      >
                        <Store size={14} /> {t("becomeSeller")}
                      </Link>
                    )}
                    {isAdmin && (
                      <>
                        <Link
                          href="/admin"
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-brand-orange hover:bg-brand-orange-light transition-colors font-semibold ${isAr ? "font-arabic" : ""}`}
                          onClick={() => setUserOpen(false)}
                        >
                          <ShieldCheck size={14} /> {t("adminPanel")}
                        </Link>
                        <div className="border-t border-dark-border my-1.5" />
                      </>
                    )}
                    <Link
                      href="/wishlist"
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-gray-300 hover:text-white hover:bg-dark-secondary transition-colors ${isAr ? "font-arabic" : ""}`}
                      onClick={() => setUserOpen(false)}
                    >
                      <Heart size={14} /> {t("wishlist")}
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-gray-300 hover:text-white hover:bg-dark-secondary transition-colors ${isAr ? "font-arabic" : ""}`}
                      onClick={() => setUserOpen(false)}
                    >
                      <Settings size={14} /> {t("settings")}
                    </Link>
                    <div className="border-t border-dark-border my-1.5" />
                    <button
                      onClick={handleLogout}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-red-400 hover:bg-red-500/10 transition-colors ${isAr ? "font-arabic" : ""}`}
                    >
                      <LogOut size={14} /> {t("signOut")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : !authLoading ? (
            /* Guest auth buttons */
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/auth/login"    className={`h-9 px-4 border border-dark-border rounded-lg text-[13px] font-medium text-white hover:border-brand-orange hover:text-brand-orange transition-colors flex items-center ${isAr ? "font-arabic" : ""}`}>{t("signIn")}</Link>
              <Link href="/auth/register" className={`h-9 px-4 bg-brand-orange rounded-lg text-[13px] font-semibold text-white hover:bg-brand-orange-hover transition-colors flex items-center ${isAr ? "font-arabic" : ""}`}>{t("register")}</Link>
            </div>
          ) : (
            /* Loading skeleton */
            <div className="hidden sm:block w-24 h-9 rounded-lg bg-dark-secondary animate-pulse" />
          )}

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
              placeholder={t("searchParts")}
              className={`input pr-11 ${isAr ? "font-arabic" : ""}`}
            />
            <button type="submit" className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center bg-brand-orange rounded-r-xl text-white">
              <Search size={15} />
            </button>
          </form>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn("text-sm font-medium py-1", isAr && "font-arabic", pathname === l.href ? "text-brand-orange" : "text-gray-300")}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              {isAdmin   && <Link href="/admin"     className={`text-sm font-medium py-1 text-brand-orange ${isAr ? "font-arabic" : ""}`} onClick={() => setMenuOpen(false)}><ShieldCheck size={13} className="inline mr-2" />{t("adminPanel")}</Link>}
              {isSeller  && <Link href="/dashboard" className={`text-sm font-medium py-1 text-brand-orange ${isAr ? "font-arabic" : ""}`} onClick={() => setMenuOpen(false)}><LayoutDashboard size={13} className="inline mr-2" />{t("dashboard")}</Link>}
              {!isSeller && !isAdmin && <Link href="/seller/setup" className={`text-sm font-medium py-1 text-brand-orange ${isAr ? "font-arabic" : ""}`} onClick={() => setMenuOpen(false)}><Store size={13} className="inline mr-2" />{t("becomeSeller")}</Link>}
              <Link href="/wishlist" className={`text-sm font-medium py-1 text-gray-300 ${isAr ? "font-arabic" : ""}`} onClick={() => setMenuOpen(false)}><Heart size={13} className="inline mr-2" />{t("wishlist")}</Link>
              <button onClick={handleLogout} className={`text-sm font-medium py-1 text-red-400 text-left flex items-center gap-2 ${isAr ? "font-arabic" : ""}`}><LogOut size={13} />{t("signOut")}</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2 border-t border-dark-border">
              <Link href="/auth/login"    className={`flex-1 h-9 border border-dark-border rounded-lg text-[13px] font-medium text-white flex items-center justify-center ${isAr ? "font-arabic" : ""}`} onClick={() => setMenuOpen(false)}>{t("signIn")}</Link>
              <Link href="/auth/register" className={`flex-1 h-9 bg-brand-orange rounded-lg text-[13px] font-semibold text-white flex items-center justify-center ${isAr ? "font-arabic" : ""}`} onClick={() => setMenuOpen(false)}>{t("register")}</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
