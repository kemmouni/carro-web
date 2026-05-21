"use client";

import { useState, useEffect } from "react";

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    browse: "Browse",
    search: "Search",
    deals: "Deals",
    signIn: "Sign In",
    register: "Register",
    dashboard: "Dashboard",
    addProduct: "Add Product",
    myStore: "My Store",
    becomeSeller: "Become a Seller",
    wishlist: "Wishlist",
    settings: "Settings",
    signOut: "Sign Out",
    sell: "Sell",
    doha: "Doha",
    searchParts: "Search parts, brands, categories...",
    notifications: "Notifications",
    noNotifications: "No notifications yet",
  },
  ar: {
    browse: "تصفح",
    search: "بحث",
    deals: "عروض",
    signIn: "تسجيل الدخول",
    register: "إنشاء حساب",
    dashboard: "لوحة التحكم",
    addProduct: "إضافة منتج",
    myStore: "متجري",
    becomeSeller: "أصبح بائعاً",
    wishlist: "المفضلة",
    settings: "الإعدادات",
    signOut: "تسجيل الخروج",
    sell: "بيع",
    doha: "الدوحة",
    searchParts: "ابحث عن قطع غيار، ماركات، فئات...",
    notifications: "الإشعارات",
    noNotifications: "لا توجد إشعارات",
  },
};

export function useLanguage() {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("carro_lang") ?? "en";
    setLangState(saved);
    document.documentElement.lang = saved;
    document.documentElement.dir  = saved === "ar" ? "rtl" : "ltr";
  }, []);

  function setLang(l: string) {
    localStorage.setItem("carro_lang", l);
    setLangState(l);
    document.documentElement.lang = l;
    document.documentElement.dir  = l === "ar" ? "rtl" : "ltr";
    window.dispatchEvent(new CustomEvent("lang-changed", { detail: l }));
  }

  function t(key: string): string {
    return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key] ?? key;
  }

  return { lang, setLang, t };
}

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === "en" ? "ar" : "en")}
      className="flex items-center gap-1.5 h-9 px-3 border border-dark-border rounded-lg text-[13px] font-medium text-gray-300 hover:text-white hover:border-brand-orange transition-colors"
      title="Switch language"
    >
      <span className="text-[15px]">{lang === "en" ? "🇶🇦" : "🇬🇧"}</span>
      <span className="hidden sm:inline">{lang === "en" ? "عربي" : "EN"}</span>
    </button>
  );
}
