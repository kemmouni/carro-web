"use client";

import { useEffect } from "react";
import { trackRecentlyViewed } from "@/components/sections/RecentlyViewed";

interface Props {
  id:       string;
  title:    string;
  price:    number;
  currency: string;
  imageUrl?: string;
}

export function RecentlyViewedTracker({ id, title, price, currency, imageUrl }: Props) {
  useEffect(() => {
    trackRecentlyViewed({ id, title, price, currency, imageUrl });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return null;
}
