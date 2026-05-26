import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Careers — Warsha+ Qatar",
  description: "Join the Warsha+ team and help build Qatar's leading auto parts marketplace.",
};

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-dark-primary py-12 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="mb-10">
          <h1 className="text-[32px] font-black text-white mb-3">Careers at Warsha+</h1>
          <p className="text-[15px] text-gray-400">Help us build Qatar's leading auto parts marketplace.</p>
        </div>

        <div className="card p-8 mb-6">
          <h2 className="text-[20px] font-black text-white mb-3">Why join Warsha+?</h2>
          <p className="text-[14px] text-gray-400 leading-relaxed mb-4">
            We're a small, focused team building something genuinely useful for Qatar's automotive ecosystem. We move fast, care deeply about the product, and give everyone a chance to make a real impact.
          </p>
          <ul className="space-y-2 text-[13px] text-gray-400">
            {[
              "Early-stage equity for all hires",
              "Flexible, remote-friendly culture",
              "Direct access to leadership",
              "Fast-growing market opportunity",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-brand-orange">✓</span> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-8 mb-6">
          <h2 className="text-[20px] font-black text-white mb-6">Open Positions</h2>
          <div className="space-y-4">
            {[
              { title: "Senior Full-Stack Engineer", type: "Full-time · Doha / Remote", desc: "Help scale our Next.js + Supabase platform. Own features end-to-end." },
              { title: "Growth & Marketing Manager", type: "Full-time · Doha", desc: "Drive seller and buyer acquisition across Qatar. Own our GTM strategy." },
              { title: "Customer Success Specialist", type: "Part-time / Full-time · Doha", desc: "Support sellers in setting up and growing their stores on Warsha+." },
            ].map(({ title, type, desc }) => (
              <div key={title} className="p-5 bg-dark-secondary rounded-xl border border-dark-border hover:border-brand-orange/40 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h3 className="text-[14px] font-bold text-white">{title}</h3>
                  <span className="text-[11px] text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">Hiring</span>
                </div>
                <p className="text-[12px] text-gray-500 mb-2">{type}</p>
                <p className="text-[13px] text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-8 text-center">
          <h3 className="text-[16px] font-bold text-white mb-2">Don't see your role?</h3>
          <p className="text-[13px] text-gray-400 mb-4">
            We're always looking for talented people. Send us your CV and tell us how you'd contribute.
          </p>
          <a
            href="mailto:careers@warsha.plus"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-orange hover:bg-orange-600 text-white text-[13px] font-bold rounded-xl transition-colors"
          >
            careers@warsha.plus →
          </a>
        </div>

      </div>
    </div>
  );
}
