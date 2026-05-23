"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id:        string;
  type:      string;
  title:     string;
  message:   string;
  link:      string | null;
  isRead:    boolean;
  createdAt: string;
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60)  return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const TYPE_COLORS: Record<string, string> = {
  new_message:         "bg-blue-400",
  new_product_pending: "bg-yellow-400",
  order_placed:        "bg-green-400",
  order_confirmed:     "bg-green-400",
  order_shipped:       "bg-brand-orange",
  order_delivered:     "bg-green-400",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [marking,       setMarking]       = useState(false);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((j) => { if (j.success) setNotifications(j.data ?? []); })
      .finally(() => setLoading(false));
  }, []);

  async function markAllRead() {
    const unread = notifications.filter((n) => !n.isRead);
    if (!unread.length) return;
    setMarking(true);
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setMarking(false);
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Bell size={22} />
            Notifications
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-orange text-[11px] font-black text-white">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Stay on top of messages, orders and activity.</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={marking}
            className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-white border border-dark-border hover:border-brand-orange px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <CheckCheck size={14} />
            {marking ? "Marking…" : "Mark all read"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse flex gap-4">
              <div className="w-2.5 h-2.5 rounded-full bg-dark-input mt-1.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-dark-input rounded w-1/3" />
                <div className="h-3 bg-dark-input rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-24 text-center">
          <Bell size={48} className="text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No notifications yet</h3>
          <p className="text-gray-500 text-sm max-w-sm">
            When buyers send inquiries, orders are placed, or listings need review, you will be notified here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                "card p-4 flex gap-4 transition-colors",
                !n.isRead && "bg-brand-orange/5 border-brand-orange/20"
              )}
            >
              <div
                className={cn(
                  "w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0",
                  !n.isRead ? (TYPE_COLORS[n.type] ?? "bg-brand-orange") : "bg-transparent border border-dark-border"
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={cn("text-[13px] font-semibold", !n.isRead ? "text-white" : "text-gray-300")}>
                      {n.title}
                    </p>
                    <p className="text-[12px] text-gray-500 mt-0.5">{n.message}</p>
                  </div>
                  <span className="text-[11px] text-gray-600 flex-shrink-0">{timeAgo(n.createdAt)}</span>
                </div>
                {n.link && (
                  <a
                    href={n.link}
                    className="inline-flex items-center gap-1 mt-2 text-[11px] text-brand-orange hover:underline"
                  >
                    View <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
