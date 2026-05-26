import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { Toaster } from "sonner";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Analytics from "@/components/Analytics";
import AppBanner from "@/components/ui/AppBanner";

// next/font downloads and self-hosts the font at build time.
// Zero render-blocking network request to Google Fonts CDN.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
});

// Cairo covers both Arabic and Latin — single font for full bilingual support.
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://warsha.plus";

export const metadata: Metadata = {
  title: { default: "Warsha+ — Auto Parts Marketplace Qatar", template: "%s | Warsha+" },
  description: "Qatar's #1 marketplace for quality auto parts. 2,000+ verified sellers. Shop engine parts, brakes, wheels, AC, and more.",
  keywords: ["auto parts", "car parts", "Qatar", "Doha", "auto parts marketplace", "قطع غيار السيارات"],
  metadataBase: new URL(BASE_URL),
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Warsha+ — Auto Parts Marketplace Qatar",
    description: "Qatar's #1 marketplace for quality auto parts. Buy & sell OEM and aftermarket parts.",
    type: "website",
    locale: "en_QA",
    siteName: "Warsha+",
    url: BASE_URL,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Warsha+ — Auto Parts Marketplace Qatar" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Warsha+ — Auto Parts Marketplace Qatar",
    description: "Qatar's #1 marketplace for quality auto parts.",
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Pre-connect to Supabase so the TCP handshake is done before the first fetch */}
        <link rel="preconnect" href="https://mqgequubhvrrgvkoipbg.supabase.co" />
        <link rel="dns-prefetch" href="https://mqgequubhvrrgvkoipbg.supabase.co" />
      </head>
      <body className={`${inter.variable} ${cairo.variable} ${inter.className}`}>
        <LanguageProvider>
        <NotificationsProvider>
          {/* Desktop navbar */}
          <div className="hidden md:block">
            <Navbar />
          </div>
          {/* Mobile header (replaces desktop navbar on small screens) */}
          <MobileHeader />
          <main className="min-h-screen pb-16 md:pb-0">{children}</main>
          {/* Desktop footer */}
          <div className="hidden md:block">
            <Footer />
          </div>
          {/* Mobile bottom tab bar */}
          <MobileBottomNav />
          {/* App download banner (mobile only, dismissible) */}
          <AppBanner />
        </NotificationsProvider>
        </LanguageProvider>
        <Analytics />
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: { background: "#1e1e1e", border: "1px solid #2a2a2a", color: "#fff" },
          }}
        />
      </body>
    </html>
  );
}
