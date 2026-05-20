import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Carro — Auto Parts Marketplace Qatar", template: "%s | Carro" },
  description: "Qatar's #1 marketplace for quality auto parts. 2,000+ verified sellers. Shop engine parts, brakes, wheels, AC, and more.",
  keywords: ["auto parts", "car parts", "Qatar", "Doha", "auto parts marketplace"],
  openGraph: {
    title: "Carro — Auto Parts Marketplace Qatar",
    description: "Qatar's #1 marketplace for quality auto parts.",
    type: "website",
    locale: "en_QA",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
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
