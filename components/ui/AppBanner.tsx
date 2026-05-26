"use client";

import { useState, useEffect } from "react";
import { X, Smartphone } from "lucide-react";

const DISMISSED_KEY = "warsha_app_banner_dismissed";

export default function AppBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show on mobile/tablet viewports and if not already dismissed
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    const isMobile  = window.innerWidth < 1024;
    if (!dismissed && isMobile) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 px-3 pb-3 md:hidden animate-slide-up">
      <div className="bg-dark-card border border-dark-border rounded-2xl px-4 py-3 flex items-center gap-3 shadow-card">
        {/* Icon */}
        <div className="w-11 h-11 rounded-xl bg-brand-orange flex items-center justify-center flex-shrink-0">
          <Smartphone size={20} className="text-white" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-white leading-tight">Get the Warsha+ app</p>
          <p className="text-[11px] text-gray-400 truncate">Faster browsing &amp; exclusive app deals</p>
        </div>

        {/* Store buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <a
            href="#"
            className="flex items-center gap-1.5 h-8 px-3 bg-white text-black text-[11px] font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            🍎 App Store
          </a>
          <a
            href="#"
            className="flex items-center gap-1.5 h-8 px-3 bg-white text-black text-[11px] font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            ▶ Google Play
          </a>
        </div>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-dark-secondary transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
