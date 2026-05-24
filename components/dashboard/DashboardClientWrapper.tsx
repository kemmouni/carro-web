"use client";

import { NotificationsProvider } from "@/context/NotificationsContext";

export function DashboardClientWrapper({ children }: { children: React.ReactNode }) {
  return <NotificationsProvider>{children}</NotificationsProvider>;
}
