"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, MapPin, ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import { useNotifications } from "@/context/NotificationsContext";
import { useLanguage } from "@/context/LanguageContext";

export default function MobileHeader() {
  const router = useRouter();
  const [query, setQuery]       = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  // Use shared context — gets polling + sound for free
  const { unreadCount } = useNotifications();
  const { t, isAr }     = useLanguage();

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((j) => { if (j.success) setLoggedIn(true); })
      .catch(() => {});
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="md:hidden bg-[#0f0f0f] border-b border-dark-border sticky top-0 z-50">
      {/* Top row */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        {/* Logo */}
        <Link href="/">
          <span className="text-[28px] font-black text-brand-orange tracking-tight leading-none">Warsha+</span>
          <p className={`text-[8px] tracking-[2px] text-gray-500 uppercase leading-none mt-0.5 ${isAr ? "font-arabic tracking-normal" : ""}`}>{t("autoPartsMarket")}</p>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {loggedIn && (
            <Link href="/dashboard/notifications" className="relative">
              <Bell
                size={22}
                className={unreadCount > 0 ? "text-brand-orange" : "text-gray-300"}
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 bg-red-500 rounded-full text-[9px] font-black text-white flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          )}
          <button className={`flex items-center gap-1 text-gray-300 ${isAr ? "font-arabic" : ""}`}>
            <MapPin size={14} className="text-brand-orange" />
            <span className="text-[13px] font-medium">{t("doha")}, Qatar</span>
            <ChevronDown size={12} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="px-4 pb-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchParts")}
            className="w-full bg-dark-secondary border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange"
          />
        </div>
      </form>
    </div>
  );
}
