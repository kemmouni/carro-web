import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Returns & Refunds — Warsha+ Qatar",
  description: "Understand the returns and refunds policy for purchases on Warsha+ Qatar.",
};

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-dark-primary py-12 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="mb-10">
          <h1 className="text-[32px] font-black text-white mb-3">Returns & Refunds</h1>
          <p className="text-[15px] text-gray-400">Our returns policy and guidance for resolving issues with orders.</p>
        </div>

        <div className="space-y-4">
          <div className="card p-8">
            <h2 className="text-[18px] font-black text-white mb-3">Seller-managed returns</h2>
            <p className="text-[14px] text-gray-400 leading-relaxed mb-3">
              Warsha+ is a marketplace platform. Returns and refunds are handled directly between the buyer and seller. Each seller may have their own returns policy, which should be confirmed before purchasing.
            </p>
            <p className="text-[14px] text-gray-400 leading-relaxed">
              We encourage all buyers to carefully review listing descriptions, photos, and condition notes before making a purchase, and to ask the seller any questions in advance.
            </p>
          </div>

          <div className="card p-8">
            <h2 className="text-[18px] font-black text-white mb-4">Common return scenarios</h2>
            <div className="space-y-4">
              {[
                { title: "Wrong part received", desc: "Contact the seller immediately via platform message or WhatsApp. Provide photos showing the issue. Most sellers will offer an exchange or refund." },
                { title: "Part not as described", desc: "If the part's condition or specifications differ significantly from the listing, raise the issue with the seller. If unresolved, contact Warsha+ support." },
                { title: "Damaged on delivery", desc: "Inspect parts before signing for any courier delivery. Document damage with photos and contact the seller within 24 hours of receipt." },
                { title: "Seller dispute", desc: "If you cannot reach a resolution with the seller, contact us at trust@warsha.plus. We will review the case and work with both parties to find a fair outcome." },
              ].map(({ title, desc }) => (
                <div key={title} className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-[14px] font-semibold text-white mb-0.5">{title}</p>
                    <p className="text-[13px] text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-8">
            <h2 className="text-[18px] font-black text-white mb-3">Tips for a smooth transaction</h2>
            <ul className="space-y-2 text-[13px] text-gray-400">
              <li className="flex gap-2"><span className="text-brand-orange">✓</span> Always inspect the part before paying or accepting delivery.</li>
              <li className="flex gap-2"><span className="text-brand-orange">✓</span> Confirm compatibility with your vehicle before purchasing.</li>
              <li className="flex gap-2"><span className="text-brand-orange">✓</span> Ask for photos of the actual part — not just stock images.</li>
              <li className="flex gap-2"><span className="text-brand-orange">✓</span> Clarify the seller's return policy before completing the transaction.</li>
              <li className="flex gap-2"><span className="text-brand-orange">✓</span> Keep a record of all communication through the Warsha+ platform.</li>
            </ul>
          </div>

          <div className="card p-6 text-center">
            <p className="text-[13px] text-gray-400 mb-3">Need help with a return or dispute?</p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-5 py-2 bg-brand-orange hover:bg-orange-600 text-white text-[13px] font-bold rounded-xl transition-colors">
              Contact Support →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
