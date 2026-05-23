import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping & Delivery — Carro Qatar",
  description: "Learn about shipping and delivery options for auto parts on Carro Qatar.",
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-dark-primary py-12 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="mb-10">
          <h1 className="text-[32px] font-black text-white mb-3">Shipping & Delivery</h1>
          <p className="text-[15px] text-gray-400">Everything you need to know about how orders are delivered on Carro.</p>
        </div>

        <div className="space-y-4">
          <div className="card p-8">
            <h2 className="text-[18px] font-black text-white mb-3">How delivery works on Carro</h2>
            <p className="text-[14px] text-gray-400 leading-relaxed mb-3">
              Carro is a marketplace connecting buyers with independent sellers. Shipping and delivery arrangements are made directly between the buyer and seller. Each seller sets their own delivery terms, which are shown on their listings.
            </p>
            <p className="text-[14px] text-gray-400 leading-relaxed">
              We strongly recommend confirming shipping details with the seller via the platform chat or WhatsApp before completing any transaction.
            </p>
          </div>

          <div className="card p-8">
            <h2 className="text-[18px] font-black text-white mb-4">Common delivery options</h2>
            <div className="space-y-4">
              {[
                { title: "Pick-up (most common)", desc: "Collect the part directly from the seller's location in Doha or other cities. Free of charge and the fastest option." },
                { title: "Seller delivery", desc: "Some sellers offer local delivery within Qatar for an additional fee. Check the listing description or ask the seller directly." },
                { title: "COD (Cash on Delivery)", desc: "Sellers who offer COD will indicate it on their listing. Payment is made in cash upon receiving the part." },
                { title: "Third-party courier", desc: "For parts being shipped from outside Doha, sellers may use courier services such as Qatar Post or private couriers." },
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
            <h2 className="text-[18px] font-black text-white mb-3">Delivery timeframes</h2>
            <p className="text-[14px] text-gray-400 leading-relaxed">
              Delivery times vary by seller and location. Within Doha, most pick-ups and local deliveries are available same-day or next-day. Always confirm timing directly with the seller when placing an order.
            </p>
          </div>

          <div className="card p-6 text-center">
            <p className="text-[13px] text-gray-400 mb-3">Have questions about a specific order?</p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-5 py-2 bg-brand-orange hover:bg-orange-600 text-white text-[13px] font-bold rounded-xl transition-colors">
              Contact Us →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
