"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

// ─── Translation map ──────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    // ── Nav / Header ──
    browse:            "Browse",
    search:            "Search",
    deals:             "Deals",
    signIn:            "Sign In",
    register:          "Register",
    dashboard:         "Dashboard",
    addProduct:        "Add Product",
    myStore:           "My Store",
    becomeSeller:      "Become a Seller",
    wishlist:          "Wishlist",
    settings:          "Settings",
    signOut:           "Sign Out",
    sell:              "Sell",
    adminPanel:        "Admin Panel",
    profile:           "Profile",
    doha:              "Doha",
    searchParts:       "Search parts, brands, categories…",
    notifications:     "Notifications",
    noNotifications:   "No notifications yet",
    language:          "Language",
    autoPartsMarket:   "AUTO PARTS MARKETPLACE",

    // ── Homepage sections ──
    featured:          "Featured",
    newArrivals:       "New Arrivals",
    availableServices: "Available Services",
    latestCars:        "Latest Cars for Sale",
    popularBrands:     "Popular Brands",
    brands:            "Brands",
    trendingCategories:"Trending Categories",
    seeAll:            "See all",
    viewAll:           "View all",
    noFeaturedYet:     "No featured listings yet.",
    noProductsYet:     "No products yet.",

    // ── Footer ──
    footerTagline:     "Qatar's trusted marketplace for quality auto parts. 2,000+ verified sellers across Doha and beyond.",
    shopSection:       "SHOP",
    companySection:    "COMPANY",
    supportSection:    "SUPPORT",
    downloadApp:       "DOWNLOAD APP",
    downloadOnThe:     "Download on the",
    getItOn:           "GET IT ON",
    allRightsReserved: "© 2025 Warsha+. All rights reserved.",
    footerTerms:       "Terms",
    footerPrivacy:     "Privacy",
    english:           "English",
    arabic:            "العربية",
    // Footer links
    allCategories:     "All Categories",
    newArrivalsLink:   "New Arrivals",
    bestSellers:       "Best Sellers",
    specialOffers:     "Special Offers",
    aboutUs:           "About Us",
    contactUs:         "Contact Us",
    howItWorks:        "How It Works",
    careers:           "Careers",
    helpCenter:        "Help Center",
    shippingDelivery:  "Shipping & Delivery",
    returnsRefunds:    "Returns & Refunds",
    termsConditions:   "Terms & Conditions",
    privacyPolicy:     "Privacy Policy",

    // ── Auth ──
    welcomeBack:       "Welcome back",
    signInToAccount:   "Sign in to your Warsha+ account",
    emailAddress:      "Email address",
    password:          "Password",
    forgotPassword:    "Forgot password?",
    signingIn:         "Signing in…",
    orContinueWith:    "or continue with",
    noAccount:         "Don't have an account?",
    createFree:        "Create one free",
    createAccount:     "Create Account",
    alreadyHaveAccount:"Already have an account?",
    signInLink:        "Sign in",
    fullName:          "Full Name",
    confirmPassword:   "Confirm Password",
    phoneNumber:       "Phone Number",
    accountType:       "Account Type",
    buyer:             "Buyer",
    seller:            "Seller",
    creatingAccount:   "Creating account…",
    agreeToTerms:      "By creating an account you agree to our",
    andText:           "and",

    // ── Product / Search ──
    priceQAR:          "QAR",
    condition:         "Condition",
    locationLabel:     "Location",
    category:          "Category",
    brand:             "Brand",
    model:             "Model",
    year:              "Year",
    mileage:           "Mileage",
    newCondition:      "New",
    usedCondition:     "Used",
    addToWishlist:     "Add to Wishlist",
    removeFromWishlist:"Remove from Wishlist",
    contactSeller:     "Contact Seller",
    buyNow:            "Buy Now",
    makeOffer:         "Make an Offer",
    shareProduct:      "Share",
    reportListing:     "Report Listing",
    relatedProducts:   "Related Products",
    storeInfo:         "Store Info",
    verified:          "Verified",
    filterBy:          "Filter",
    sortBy:            "Sort by",
    newest:            "Newest first",
    priceLow:          "Price: low to high",
    priceHigh:         "Price: high to low",
    mostPopular:       "Most popular",
    noResults:         "No results found",
    clearFilters:      "Clear filters",
    searchResults:     "Search Results",
    for:               "for",

    // ── Dashboard ──
    myListings:        "My Listings",
    addNew:            "Add New",
    activeListings:    "Active",
    pendingListings:   "Pending",
    soldListings:      "Sold",
    totalViews:        "Total Views",
    totalSales:        "Total Sales",
    totalRevenue:      "Revenue",
    storeSetup:        "Store Setup",
    analytics:         "Analytics",
    orders:            "Orders",
    messages:          "Messages",
    reviews:           "Reviews",
    subscriptions:     "Subscriptions",
    referral:          "Referral",

    // ── Common ──
    loading:           "Loading…",
    error:             "Something went wrong",
    retry:             "Retry",
    close:             "Close",
    cancel:            "Cancel",
    save:              "Save",
    submit:            "Submit",
    back:              "Back",
    next:              "Next",
    done:              "Done",
    gotIt:             "Got it",
    or:                "or",
    optional:          "(optional)",
    required:          "Required",
  },

  ar: {
    // ── Nav / Header ──
    browse:            "تصفح",
    search:            "بحث",
    deals:             "عروض",
    signIn:            "تسجيل الدخول",
    register:          "إنشاء حساب",
    dashboard:         "لوحة التحكم",
    addProduct:        "إضافة منتج",
    myStore:           "متجري",
    becomeSeller:      "أصبح بائعاً",
    wishlist:          "المفضلة",
    settings:          "الإعدادات",
    signOut:           "تسجيل الخروج",
    sell:              "بيع",
    adminPanel:        "لوحة الإدارة",
    profile:           "الملف الشخصي",
    doha:              "الدوحة",
    searchParts:       "ابحث عن قطع غيار، ماركات، فئات…",
    notifications:     "الإشعارات",
    noNotifications:   "لا توجد إشعارات",
    language:          "اللغة",
    autoPartsMarket:   "سوق قطع غيار السيارات",

    // ── Homepage sections ──
    featured:          "المميزة",
    newArrivals:       "وصل حديثاً",
    availableServices: "الخدمات المتاحة",
    latestCars:        "أحدث السيارات",
    popularBrands:     "الماركات الشائعة",
    brands:            "الماركات",
    trendingCategories:"الفئات الرائجة",
    seeAll:            "عرض الكل",
    viewAll:           "عرض الكل",
    noFeaturedYet:     "لا توجد إعلانات مميزة بعد.",
    noProductsYet:     "لا توجد منتجات بعد.",

    // ── Footer ──
    footerTagline:     "السوق الموثوق في قطر لقطع غيار السيارات عالية الجودة. أكثر من 2000 بائع معتمد في الدوحة وما حولها.",
    shopSection:       "التسوق",
    companySection:    "الشركة",
    supportSection:    "الدعم",
    downloadApp:       "حمّل التطبيق",
    downloadOnThe:     "حمّل من",
    getItOn:           "احصل عليه من",
    allRightsReserved: "© 2025 Warsha+. جميع الحقوق محفوظة.",
    footerTerms:       "الشروط",
    footerPrivacy:     "الخصوصية",
    english:           "English",
    arabic:            "العربية",
    // Footer links
    allCategories:     "جميع الفئات",
    newArrivalsLink:   "وصل حديثاً",
    bestSellers:       "الأكثر مبيعاً",
    specialOffers:     "العروض الخاصة",
    aboutUs:           "من نحن",
    contactUs:         "تواصل معنا",
    howItWorks:        "كيف يعمل",
    careers:           "الوظائف",
    helpCenter:        "مركز المساعدة",
    shippingDelivery:  "الشحن والتوصيل",
    returnsRefunds:    "الإرجاع واسترداد المبالغ",
    termsConditions:   "الشروط والأحكام",
    privacyPolicy:     "سياسة الخصوصية",

    // ── Auth ──
    welcomeBack:       "مرحباً بعودتك",
    signInToAccount:   "سجّل الدخول إلى حسابك في Warsha+",
    emailAddress:      "البريد الإلكتروني",
    password:          "كلمة المرور",
    forgotPassword:    "نسيت كلمة المرور؟",
    signingIn:         "جارٍ تسجيل الدخول…",
    orContinueWith:    "أو تابع عبر",
    noAccount:         "ليس لديك حساب؟",
    createFree:        "أنشئ حساباً مجاناً",
    createAccount:     "إنشاء حساب",
    alreadyHaveAccount:"هل لديك حساب بالفعل؟",
    signInLink:        "سجّل الدخول",
    fullName:          "الاسم الكامل",
    confirmPassword:   "تأكيد كلمة المرور",
    phoneNumber:       "رقم الهاتف",
    accountType:       "نوع الحساب",
    buyer:             "مشترٍ",
    seller:            "بائع",
    creatingAccount:   "جارٍ إنشاء الحساب…",
    agreeToTerms:      "بإنشاء حساب، فأنت توافق على",
    andText:           "و",

    // ── Product / Search ──
    priceQAR:          "ر.ق",
    condition:         "الحالة",
    locationLabel:     "الموقع",
    category:          "الفئة",
    brand:             "الماركة",
    model:             "الموديل",
    year:              "السنة",
    mileage:           "عدد الكيلومترات",
    newCondition:      "جديد",
    usedCondition:     "مستعمل",
    addToWishlist:     "أضف إلى المفضلة",
    removeFromWishlist:"أزل من المفضلة",
    contactSeller:     "تواصل مع البائع",
    buyNow:            "اشترِ الآن",
    makeOffer:         "قدّم عرضاً",
    shareProduct:      "مشاركة",
    reportListing:     "الإبلاغ عن الإعلان",
    relatedProducts:   "منتجات ذات صلة",
    storeInfo:         "معلومات المتجر",
    verified:          "موثّق",
    filterBy:          "تصفية",
    sortBy:            "ترتيب حسب",
    newest:            "الأحدث أولاً",
    priceLow:          "السعر: من الأقل",
    priceHigh:         "السعر: من الأعلى",
    mostPopular:       "الأكثر شعبية",
    noResults:         "لا توجد نتائج",
    clearFilters:      "مسح الفلاتر",
    searchResults:     "نتائج البحث",
    for:               "عن",

    // ── Dashboard ──
    myListings:        "إعلاناتي",
    addNew:            "إضافة جديد",
    activeListings:    "نشط",
    pendingListings:   "قيد المراجعة",
    soldListings:      "تم البيع",
    totalViews:        "إجمالي المشاهدات",
    totalSales:        "إجمالي المبيعات",
    totalRevenue:      "الإيرادات",
    storeSetup:        "إعداد المتجر",
    analytics:         "التحليلات",
    orders:            "الطلبات",
    messages:          "الرسائل",
    reviews:           "التقييمات",
    subscriptions:     "الاشتراكات",
    referral:          "الإحالة",

    // ── Common ──
    loading:           "جارٍ التحميل…",
    error:             "حدث خطأ ما",
    retry:             "إعادة المحاولة",
    close:             "إغلاق",
    cancel:            "إلغاء",
    save:              "حفظ",
    submit:            "إرسال",
    back:              "رجوع",
    next:              "التالي",
    done:              "تم",
    gotIt:             "حسناً",
    or:                "أو",
    optional:          "(اختياري)",
    required:          "مطلوب",
  },
} as const;

export type LangKey = keyof typeof TRANSLATIONS.en;
export type Lang = "en" | "ar";

// ─── Context ──────────────────────────────────────────────────────────────────
interface LanguageContextValue {
  lang: Lang;
  isAr: boolean;
  setLang: (l: Lang) => void;
  t: (key: LangKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  isAr: false,
  setLang: () => {},
  t: (k) => TRANSLATIONS.en[k] ?? k,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Initialise from localStorage on mount (client-only)
  useEffect(() => {
    const saved = (localStorage.getItem("warsha_lang") ?? "en") as Lang;
    applyLang(saved);
    setLangState(saved);
  }, []);

  function applyLang(l: Lang) {
    document.documentElement.lang = l;
    document.documentElement.dir  = l === "ar" ? "rtl" : "ltr";
    // Apply Cairo font class when Arabic is active
    document.documentElement.classList.toggle("font-arabic", l === "ar");
  }

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem("warsha_lang", l);
    setLangState(l);
    applyLang(l);
    window.dispatchEvent(new CustomEvent("lang-changed", { detail: l }));
  }, []);

  const t = useCallback(
    (key: LangKey): string =>
      (TRANSLATIONS[lang] as Record<string, string>)[key] ??
      (TRANSLATIONS.en as Record<string, string>)[key] ??
      key,
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang, isAr: lang === "ar", setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Use inside any Client Component. */
export function useLanguage() {
  return useContext(LanguageContext);
}
