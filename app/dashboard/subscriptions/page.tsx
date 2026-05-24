"use client";

import { Check, Zap, Star, Building2 } from "lucide-react";

const PLANS = [
  {
    name:     "Starter",
    slug:     "starter",
    price:    0,
    icon:     Star,
    color:    "text-gray-400",
    bg:       "bg-gray-400/10 border-gray-400/20",
    features: [
      "Up to 10 listings",
      "Basic store profile",
      "WhatsApp & COD support",
      "Customer messaging",
    ],
    cta:   "Current Plan",
    ctaCls: "bg-dark-border text-gray-400 cursor-default",
  },
  {
    name:     "Pro",
    slug:     "pro",
    price:    149,
    icon:     Zap,
    color:    "text-brand-orange",
    bg:       "bg-brand-orange/10 border-brand-orange/30",
    badge:    "Most Popular",
    features: [
      "Up to 50 listings",
      "5 featured listing slots",
      "Analytics dashboard",
      "Priority in search results",
      "All Starter features",
    ],
    cta:   "Upgrade to Pro",
    ctaCls: "bg-brand-orange hover:bg-brand-orange-hover text-white",
  },
  {
    name:     "Business",
    slug:     "business",
    price:    399,
    icon:     Building2,
    color:    "text-purple-400",
    bg:       "bg-purple-400/10 border-purple-400/20",
    features: [
      "Unlimited listings",
      "20 featured listing slots",
      "Advanced analytics",
      "Priority support",
      "Verified seller badge",
      "All Pro features",
    ],
    cta:   "Upgrade to Business",
    ctaCls: "bg-purple-500 hover:bg-purple-600 text-white",
  },
];

export default function SubscriptionsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-[26px] font-black text-white mb-2">Choose Your Plan</h1>
        <p className="text-gray-400 text-[14px]">Scale your business on Carro with the right tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map(plan => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.slug}
              className={`card p-6 flex flex-col border ${plan.slug === "pro" ? "ring-1 ring-brand-orange" : ""}`}
            >
              {plan.badge && (
                <div className="text-center mb-4">
                  <span className="text-[10px] font-bold px-3 py-1 bg-brand-orange text-white rounded-full uppercase tracking-wide">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className={`w-12 h-12 rounded-xl ${plan.bg} border flex items-center justify-center mb-4`}>
                <Icon size={22} className={plan.color} />
              </div>

              <h3 className="text-[18px] font-black text-white mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-5">
                {plan.price === 0 ? (
                  <span className="text-[24px] font-black text-white">Free</span>
                ) : (
                  <>
                    <span className="text-[28px] font-black text-white">{plan.price}</span>
                    <span className="text-[13px] text-gray-400">QAR/mo</span>
                  </>
                )}
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-gray-300">
                    <Check size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full h-11 rounded-xl font-bold text-[13px] transition-colors ${plan.ctaCls}`}
                onClick={() => {
                  if (plan.slug !== "starter") {
                    alert("Payment integration coming soon! Contact support@carro.qa to upgrade manually.");
                  }
                }}
              >
                {plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-[12px] text-gray-600 mt-6">
        All plans include free listing creation. Featured slot pricing is QAR 15/week per slot.
        Contact <span className="text-brand-orange">support@carro.qa</span> for enterprise pricing.
      </p>
    </div>
  );
}
