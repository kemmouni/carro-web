import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us — Warsha+ Qatar",
  description: "Learn about Warsha+, Qatar's trusted marketplace for auto parts, services, and cars.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark-primary py-12 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="mb-10">
          <h1 className="text-[32px] font-black text-white mb-3">About Warsha+</h1>
          <p className="text-[15px] text-gray-400 leading-relaxed">
            Qatar's #1 marketplace for auto parts, automotive services, and cars.
          </p>
        </div>

        <div className="card p-8 mb-6">
          <h2 className="text-[20px] font-black text-white mb-4">Our Mission</h2>
          <p className="text-[14px] text-gray-400 leading-relaxed mb-4">
            Warsha+ was built to solve a simple problem: finding genuine, affordable auto parts in Qatar shouldn't be hard. Whether you're a mechanic in Al Wakrah, a car enthusiast in Lusail, or a fleet manager in the Industrial Area — Warsha+ connects you directly with thousands of verified sellers across Doha and beyond.
          </p>
          <p className="text-[14px] text-gray-400 leading-relaxed">
            We believe the auto parts market deserves the same trust, transparency, and convenience that modern e-commerce has brought to other industries. That's what we're building.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { stat: "2,000+", label: "Verified Sellers" },
            { stat: "50,000+", label: "Parts Listed" },
            { stat: "Doha & Beyond", label: "Coverage" },
          ].map(({ stat, label }) => (
            <div key={label} className="card p-6 text-center">
              <p className="text-[28px] font-black text-brand-orange mb-1">{stat}</p>
              <p className="text-[13px] text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        <div className="card p-8 mb-6">
          <h2 className="text-[20px] font-black text-white mb-4">Why Warsha+?</h2>
          <ul className="space-y-3">
            {[
              ["Free to list", "Sellers can post listings at no cost. No hidden fees."],
              ["Verified sellers", "Every store goes through a review process before going live."],
              ["WhatsApp-first", "Connect directly with sellers via WhatsApp — fast and familiar."],
              ["Made for Qatar", "Built in Doha, for the Qatari market. Arabic support included."],
            ].map(([title, desc]) => (
              <li key={title} className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-2 flex-shrink-0" />
                <div>
                  <span className="text-[14px] font-semibold text-white">{title} — </span>
                  <span className="text-[14px] text-gray-400">{desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-8">
          <h2 className="text-[20px] font-black text-white mb-3">Get in touch</h2>
          <p className="text-[14px] text-gray-400 mb-4">
            Have questions, partnership inquiries, or feedback? We'd love to hear from you.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-orange hover:bg-orange-600 text-white text-[14px] font-bold rounded-xl transition-colors"
          >
            Contact Us →
          </Link>
        </div>

      </div>
    </div>
  );
}
