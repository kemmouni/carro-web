"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

// ── Sound ─────────────────────────────────────────────────────────────────────
function playNotificationSound() {
  try {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();

    // Three-note ascending chime: A5 → C#6 → E6
    const tones = [
      { freq: 880,  start: 0,    dur: 0.25 },
      { freq: 1108, start: 0.15, dur: 0.25 },
      { freq: 1320, start: 0.3,  dur: 0.4  },
    ];

    tones.forEach(({ freq, start, dur }) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.value = freq;

      const t = ctx.currentTime + start;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.start(t);
      osc.stop(t + dur);
    });
  } catch {
    // AudioContext not available — silent fail
  }
}

// ── Type → icon/color mapping ─────────────────────────────────────────────────
const TYPE_EMOJI: Record<string, string> = {
  new_message:          "💬",
  new_booking:          "📅",
  order_placed:         "🛒",
  order_confirmed:      "✅",
  order_shipped:        "🚚",
  order_delivered:      "📦",
  new_product_pending:  "🔔",
};

// ── Context ───────────────────────────────────────────────────────────────────
const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  unreadCount: 0,
  markAllRead: async () => {},
  refresh: async () => {},
});

export function useNotifications() {
  return useContext(NotificationsContext);
}

// ── Provider ──────────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 15_000; // 15 seconds

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const seenIds      = useRef<Set<string>>(new Set());
  const isFirstFetch = useRef(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const json = await res.json();
      if (!json.success) return;

      const incoming: Notification[] = json.data ?? [];
      const unread: number           = json.unread ?? 0;

      setNotifications(incoming);
      setUnreadCount(unread);

      // Detect genuinely new notifications (not seen before)
      if (!isFirstFetch.current) {
        const brandNew = incoming.filter((n) => !seenIds.current.has(n.id) && !n.isRead);
        if (brandNew.length > 0) {
          playNotificationSound();

          brandNew.forEach((n) => {
            const emoji = TYPE_EMOJI[n.type] ?? "🔔";
            toast(`${emoji} ${n.title}`, {
              description: n.message,
              duration: 7000,
              action: n.link
                ? { label: "Open", onClick: () => { window.location.href = n.link!; } }
                : undefined,
            });
          });
        }
      }

      // Register all IDs as seen
      isFirstFetch.current = false;
      incoming.forEach((n) => seenIds.current.add(n.id));
    } catch {
      // Network error — silently ignore
    }
  }, []);

  const markAllRead = useCallback(async () => {
    await fetch("/api/notifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, markAllRead, refresh: fetchNotifications }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
