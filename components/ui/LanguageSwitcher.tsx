"use client";

export { useLanguage } from "@/context/LanguageContext";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === "en" ? "ar" : "en")}
      className="flex items-center gap-1.5 h-9 px-3 border border-dark-border rounded-lg text-[13px] font-medium text-gray-300 hover:text-white hover:border-brand-orange transition-colors"
      title="Switch language / تغيير اللغة"
    >
      <span className="text-[15px]">{lang === "en" ? "🇶🇦" : "🇬🇧"}</span>
      <span className="hidden sm:inline">{lang === "en" ? "عربي" : "EN"}</span>
    </button>
  );
}
