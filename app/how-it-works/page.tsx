import type { Metadata } from "next";
import Link from "next/link";
import { Search, MessageCircle, ShoppingBag, Store, Upload, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works — Warsha+ Qatar",
  description: "Learn how to buy and sell auto parts on Warsha+, Qatar's trusted auto parts marketplace.",
};

const Step = ({ n, icon: Icon, title, desc }: { n: number; icon: React.ElementType; title: string; desc: string }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center text-brand-orange font-black text-[14px]">
      {n}
    </div>
    <div className="pt-1">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={15} className="text-brand-orange" />
        <h3 className="text-[15px] font-bold text-white">{title}</h3>
      </div>
      <p className="text-[13px] text-gray-400 leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-dark-primary py-12 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="mb-10">
          <h1 className="text-[32px] font-black text-white mb-3">How It Works</h1>
          <p className="text-[15px] text-gray-400">Warsha+ makes it simple to buy and sell auto parts in Qatar.</p>
        </div>

        {/* Buyers */}
        <div className="card p-8 mb-6">
          <h2 className="text-[20px] font-black text-white mb-6">For Buyers</h2>
          <div className="space-y-6">
            <Step n={1} icon={Search}         title="Search or browse"        desc="Search by part name, brand, or car model. Filter by condition, price, and location to find exactly what you need." />
            <Step n={2} icon={ShoppingBag}    title="View listing details"    desc="See photos, description, seller info, and pricing. Every listing shows the seller's store and response rate." />
            <Step n={3} icon={Tag}            title="Make an offer or inquire" desc="You can make a price offer or send a message directly to the seller through the platform." />
            <Step n={4} icon={MessageCircle}  title="Connect via WhatsApp"    desc="Most sellers share their WhatsApp number. Arrange pickup, delivery, or ask any questions — fast and easy." />
          </div>
        </div>

        {/* Sellers */}
        <div className="card p-8 mb-6">
          <h2 className="text-[20px] font-black text-white mb-6">For Sellers</h2>
          <div className="space-y-6">
            <Step n={1} icon={Store}   title="Create your store"     desc="Register and set up your seller profile in minutes. Add your store name, logo, location, and WhatsApp number." />
            <Step n={2} icon={Upload}  title="List your inventory"   desc="Upload auto parts, services, or cars for sale. Add photos, set your price, and specify vehicle compatibility." />
            <Step n={3} icon={Tag}     title="Receive offers"        desc="Buyers can browse your listings, make offers, and send inquiries directly to your dashboard." />
            <Step n={4} icon={MessageCircle} title="Close the deal"  desc="Communicate with buyers via the platform messaging or WhatsApp. Arrange payment and delivery as you prefer." />
          </div>
        </div>

        <div className="card p-6 bg-brand-orange/5 border-brand-orange/20">
          <h3 className="text-[15px] font-bold text-white mb-1">Free to get started</h3>
          <p className="text-[13px] text-gray-400 mb-4">
            Listing on Warsha+ is completely free. Upgrade to a Pro or Business plan to unlock featured listings, priority search placement, and advanced analytics.
          </p>
          <div className="flex gap-3">
            <Link href="/auth/register" className="px-4 py-2 bg-brand-orange text-white text-[13px] font-bold rounded-xl hover:bg-orange-600 transition-colors">
              Start Selling
            </Link>
            <Link href="/browse" className="px-4 py-2 bg-dark-secondary text-white text-[13px] font-bold rounded-xl hover:bg-dark-card transition-colors">
              Browse Parts
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
