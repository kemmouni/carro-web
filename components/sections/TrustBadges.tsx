import { ShieldCheck, CreditCard, Truck } from "lucide-react";

const ITEMS = [
  { icon: ShieldCheck, title: "Verified Sellers",  sub: "Trusted & verified sellers" },
  { icon: CreditCard,  title: "Secure Payments",   sub: "100% secure transactions" },
  { icon: Truck,       title: "Qatar Delivery",    sub: "Fast & reliable delivery" },
];

export function TrustBadges() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-10">
      {ITEMS.map(({ icon: Icon, title, sub }) => (
        <div
          key={title}
          className="card flex items-center gap-4 px-5 py-4 hover:border-brand-orange transition-colors cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl bg-brand-orange-light flex items-center justify-center text-brand-orange flex-shrink-0">
            <Icon size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-[14px] font-bold text-white">{title}</h4>
            <p className="text-[12px] text-gray-400">{sub}</p>
          </div>
          <svg className="text-gray-600 group-hover:text-brand-orange transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      ))}
    </div>
  );
}
