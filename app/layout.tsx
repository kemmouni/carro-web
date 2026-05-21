import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { Toaster } from "sonner";

// next/font downloads and self-hosts the font at build time.
// Zero render-blocking network request to Google Fonts CDN.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://carro.qa";

export const metadata: Metadata = {
  title: { default: "Carro — Auto Parts Marketplace Qatar", template: "%s | Carro" },
  description: "Qatar's #1 marketplace for quality auto parts. 2,000+ verified sellers. Shop engine parts, brakes, wheels, AC, and more.",
  keywords: ["auto parts", "car parts", "Qatar", "Doha", "auto parts marketplace", "قطعات السيارات"],
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: "Carro — Auto Parts Marketplace Qatar",
    description: "Qatar's #1 marketplace for quality auto parts. Buy & sell OEM and aftermarket parts.",
    type: "website",
    locale: "en_QA",
    siteName: "Carro",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Carro — Auto Parts Marketplace Qatar",
    description: "Qatar's #1 marketplace for quality auto parts.",
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
      <body className={`${inter.variable} ${inter.className}`}>
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
