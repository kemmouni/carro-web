"use client";

import Link from "next/link";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { t, isAr } = useLanguage();

  const LINKS = {
    [t("shopSection")]: [
      [t("allCategories"),   "/browse"],
      [t("newArrivalsLink"), "/search?sort=newest"],
      [t("bestSellers"),     "/search?sort=popular"],
      [t("specialOffers"),   "/search?sort=deals"],
    ],
    [t("companySection")]: [
      [t("aboutUs"),    "/about"],
      [t("contactUs"),  "/contact"],
      [t("howItWorks"), "/how-it-works"],
      [t("careers"),    "/careers"],
    ],
    [t("supportSection")]: [
      [t("helpCenter"),       "/help"],
      [t("shippingDelivery"), "/shipping"],
      [t("returnsRefunds"),   "/returns"],
      [t("termsConditions"),  "/terms"],
      [t("privacyPolicy"),    "/privacy"],
    ],
  };

  return (
    <footer className="bg-[#0d0d0d] border-t border-dark-border mt-20 pt-14 pb-8">
      <div className="max-w-screen-xl mx-auto px-6">

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <Link href="/" className="block mb-3">
              <span className="text-3xl font-black text-brand-orange">Warsha+</span>
            </Link>
            <p className={`text-sm text-gray-400 leading-relaxed max-w-xs mb-5 ${isAr ? "font-arabic" : ""}`}>
              {t("footerTagline")}
            </p>
            <div className="flex gap-2">
              {[
                { Icon: Facebook,  name: "facebook",  href: "#" },
                { Icon: Instagram, name: "instagram", href: "#" },
                { Icon: Twitter,   name: "twitter",   href: "#" },
                { Icon: Youtube,   name: "youtube",   href: "#" },
              ].map(({ Icon, name, href }) => (
                <a
                  key={name}
                  href={href}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-dark-secondary border border-dark-border text-gray-400 hover:bg-brand-orange hover:border-brand-orange hover:text-white transition-all duration-200"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className={`text-[11px] font-bold tracking-widest text-white uppercase mb-4 ${isAr ? "tracking-normal font-arabic" : ""}`}>
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className={`text-[13px] text-gray-400 hover:text-brand-orange transition-colors ${isAr ? "font-arabic" : ""}`}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* App download */}
          <div>
            <h4 className={`text-[11px] font-bold tracking-widest text-white uppercase mb-4 ${isAr ? "tracking-normal font-arabic" : ""}`}>
              {t("downloadApp")}
            </h4>
            <div className="flex flex-col gap-2.5">
              {[
                { store: "App Store",   sub: t("downloadOnThe"), emoji: "🍎" },
                { store: "Google Play", sub: t("getItOn"),        emoji: "▶" },
              ].map((app) => (
                <a
                  key={app.store}
                  href="#"
                  className="flex items-center gap-3 p-3 bg-dark-secondary border border-dark-border rounded-xl hover:border-brand-orange transition-colors group"
                >
                  <span className="text-xl">{app.emoji}</span>
                  <div>
                    <p className={`text-[10px] text-gray-400 ${isAr ? "font-arabic" : ""}`}>{app.sub}</p>
                    <p className="text-[13px] font-semibold text-white">{app.store}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-dark-border">
          <div className="flex items-center gap-4">
            <p className={`text-[12px] text-gray-500 ${isAr ? "font-arabic" : ""}`}>{t("allRightsReserved")}</p>
            <Link href="/terms"   className="text-[12px] text-gray-500 hover:text-gray-300 transition-colors">{t("footerTerms")}</Link>
            <Link href="/privacy" className="text-[12px] text-gray-500 hover:text-gray-300 transition-colors">{t("footerPrivacy")}</Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[12px] text-gray-400 px-3 py-1.5 bg-dark-secondary border border-dark-border rounded-lg">
              🇶🇦 {t("doha")}, Qatar
            </div>
            <div className={`text-[12px] text-gray-400 px-3 py-1.5 bg-dark-secondary border border-dark-border rounded-lg ${isAr ? "font-arabic" : ""}`}>
              {isAr ? t("arabic") : t("english")}
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
