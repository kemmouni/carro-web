"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, MapPin, ChevronDown, Search } from "lucide-react";
import Link from "next/link";

export default function MobileHeader() {
  const router = useRouter();
  const [query, setQuery]         = useState("");
  const [unread, setUnread]       = useState(0);
  const [loggedIn, setLoggedIn]   = useState(false);

  useEffect(() => {
    // Fire both requests in parallel — no waterfall
    Promise.all([
      fetch("/api/auth/session").then(r => r.json()),
      fetch("/api/notifications").then(r => r.json()),
    ]).then(([session, notifs]) => {
      if (session.success) {
        setLoggedIn(true);
        if (notifs.success) setUnread(notifs.unread ?? 0);
      }
    }).catch(() => {});
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
          <span className="text-[28px] font-black text-brand-orange tracking-tight leading-none">Carro</span>
          <p className="text-[8px] tracking-[2px] text-gray-500 uppercase leading-none mt-0.5">AUTO PARTS MARKETPLACE</p>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {loggedIn && (
            <Link href="/dashboard/messages" className="relative">
              <Bell size={22} className="text-gray-300" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-orange rounded-full text-[9px] font-black text-white flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          )}
          <button className="flex items-center gap-1 text-gray-300">
            <MapPin size={14} className="text-brand-orange" />
            <span className="text-[13px] font-medium">Doha, Qatar</span>
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
            onChange={e => setQuery(e.target.value)}
            placeholder="Search parts, brands, categories..."
            className="w-full bg-dark-secondary border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange"
          />
        </div>
      </form>
    </div>
  );
}
