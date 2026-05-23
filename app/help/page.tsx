import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help Center — Carro Qatar",
  description: "Find answers to common questions about buying and selling on Carro Qatar.",
};

const faqs: { q: string; a: string }[] = [
  { q: "Is Carro free to use?", a: "Browsing and buying is always free. Sellers can list up to 10 products for free on the Starter plan. Pro and Business plans unlock more listings and advanced features." },
  { q: "How do I contact a seller?", a: "On any product page, you can send a message through the platform or connect via the seller's WhatsApp number if they've provided one." },
  { q: "Are sellers verified?", a: "Yes. All stores go through a review process before being marked as verified. Look for the 'Verified Store' badge on seller profiles." },
  { q: "How do I make an offer?", a: "On any product page, click 'Make an Offer', enter your price, and optionally add a message. The seller will receive a notification and can accept, decline, or counter-offer." },
  { q: "Can I save products for later?", a: "Yes. Click the heart icon on any product card or listing page to save it to your Wishlist. Find it anytime in the Wishlist section." },
  { q: "How do I report a suspicious listing?", a: "Click the 'Report' button on the product page. Our moderation team reviews all reports within 24 hours." },
  { q: "I'm a seller — how do I set up my store?", a: "Register an account, then go to 'Sell' in the top navigation. You'll be guided through creating your store in under 5 minutes." },
  { q: "What payment methods are accepted?", a: "Payment is arranged directly between buyer and seller. Carro supports Cash on Delivery (COD) ordering through the platform, and sellers may accept bank transfer, QNB Pay, or cash in person." },
  { q: "How do I reset my password?", a: "Go to the Login page and click 'Forgot password?'. Enter your email and we'll send you a reset link." },
  { q: "How can I contact Carro support?", a: "Email us at support@carro.qa or use WhatsApp for the fastest response. We're available Sunday–Thursday, 8 AM–6 PM." },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-dark-primary py-12 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="mb-10">
          <h1 className="text-[32px] font-black text-white mb-3">Help Center</h1>
          <p className="text-[15px] text-gray-400">Answers to the most common questions about Carro.</p>
        </div>

        <div className="card divide-y divide-dark-border mb-8">
          {faqs.map(({ q, a }) => (
            <div key={q} className="p-6">
              <h3 className="text-[14px] font-bold text-white mb-2">{q}</h3>
              <p className="text-[13px] text-gray-400 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>

        <div className="card p-6 text-center">
          <p className="text-[14px] font-semibold text-white mb-1">Still need help?</p>
          <p className="text-[13px] text-gray-400 mb-4">Our team is happy to assist you directly.</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-orange hover:bg-orange-600 text-white text-[13px] font-bold rounded-xl transition-colors"
          >
            Contact Support →
          </Link>
        </div>

      </div>
    </div>
  );
}
