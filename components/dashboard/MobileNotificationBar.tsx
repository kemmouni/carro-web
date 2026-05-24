"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications } from "@/context/NotificationsContext";

/**
 * Sticky top bar shown on mobile (sidebar is hidden on small screens).
 * Shows the store name + a notification bell with unread badge.
 */
export function MobileNotificationBar({ storeName }: { storeName: string }) {
  const { unreadCount } = useNotifications();

  return (
    <div className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-dark-secondary border-b border-dark-border">
      {/* Logo / store name */}
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="text-[18px] font-black text-brand-orange tracking-tight">CARRO</span>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
          {storeName}
        </span>
      </Link>

      {/* Notification bell */}
      <Link href="/dashboard/notifications" className="relative p-2 rounded-lg hover:bg-dark-card transition-colors">
        <Bell size={20} className={unreadCount > 0 ? "text-brand-orange" : "text-gray-400"} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-[16px] px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>
    </div>
  );
}
