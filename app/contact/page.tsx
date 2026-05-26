import type { Metadata } from "next";
import { Mail, MessageCircle, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us — Warsha+ Qatar",
  description: "Get in touch with the Warsha+ team. We're here to help with any questions about buying or selling auto parts in Qatar.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-dark-primary py-12 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="mb-10">
          <h1 className="text-[32px] font-black text-white mb-3">Contact Us</h1>
          <p className="text-[15px] text-gray-400">We're here to help. Reach out through any of the channels below.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {[
            {
              icon: MessageCircle,
              title: "WhatsApp Support",
              desc: "Fastest response — typically within 1 hour during business hours.",
              action: "Chat on WhatsApp",
              href: "https://wa.me/97412345678",
              color: "text-green-400",
            },
            {
              icon: Mail,
              title: "Email",
              desc: "For detailed enquiries, partnerships, or seller support.",
              action: "support@warsha.plus",
              href: "mailto:support@warsha.plus",
              color: "text-brand-orange",
            },
            {
              icon: MapPin,
              title: "Location",
              desc: "We're based in Doha, Qatar. Currently operating online only.",
              action: "Doha, Qatar",
              href: null,
              color: "text-blue-400",
            },
            {
              icon: Clock,
              title: "Business Hours",
              desc: "Sunday – Thursday, 8:00 AM – 6:00 PM (AST)",
              action: "We reply within 24 hours",
              href: null,
              color: "text-purple-400",
            },
          ].map(({ icon: Icon, title, desc, action, href, color }) => (
            <div key={title} className="card p-6">
              <Icon size={20} className={`${color} mb-3`} />
              <h3 className="text-[15px] font-bold text-white mb-1">{title}</h3>
              <p className="text-[13px] text-gray-400 mb-3">{desc}</p>
              {href ? (
                <a href={href} className={`text-[13px] font-semibold ${color} hover:underline`}>{action}</a>
              ) : (
                <span className="text-[13px] font-semibold text-gray-300">{action}</span>
              )}
            </div>
          ))}
        </div>

        <div className="card p-8">
          <h2 className="text-[18px] font-black text-white mb-1">For Sellers</h2>
          <p className="text-[13px] text-gray-400 mb-4">
            Need help with your store, listings, or subscription? Email us at{" "}
            <a href="mailto:sellers@warsha.plus" className="text-brand-orange hover:underline">sellers@warsha.plus</a>{" "}
            or reach us on WhatsApp — we'll get back to you quickly.
          </p>
          <h2 className="text-[18px] font-black text-white mb-1 mt-6">Report a Problem</h2>
          <p className="text-[13px] text-gray-400">
            Found a fraudulent listing or safety issue? Use the "Report" button on any listing, or email{" "}
            <a href="mailto:trust@warsha.plus" className="text-brand-orange hover:underline">trust@warsha.plus</a>.
          </p>
        </div>

      </div>
    </div>
  );
}
