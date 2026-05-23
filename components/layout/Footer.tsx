import Link from "next/link";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";

const LINKS = {
  SHOP:    [["All Categories","/browse"],["New Arrivals","/search?sort=newest"],["Best Sellers","/search?sort=popular"],["Special Offers","/search?sort=deals"]],
  COMPANY: [["About Us","/about"],["Contact Us","/contact"],["How It Works","/how-it-works"],["Careers","/careers"]],
  SUPPORT: [["Help Center","/help"],["Shipping & Delivery","/shipping"],["Returns & Refunds","/returns"],["Terms & Conditions","/terms"],["Privacy Policy","/privacy"]],
};

export function Footer() {
  return (
    <footer className="bg-[#0d0d0d] border-t border-dark-border mt-20 pt-14 pb-8">
      <div className="max-w-screen-xl mx-auto px-6">

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <Link href="/" className="block mb-3">
              <span className="text-3xl font-black text-brand-orange">Carro</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mb-5">
              Qatar's trusted marketplace for quality auto parts. 2,000+ verified sellers across Doha and beyond.
            </p>
            <div className="flex gap-2">
              {[
                { Icon: Facebook,  name: "facebook",  href: "#" },
                { Icon: Instagram, name: "instagram", href: "#" },
                { Icon: Twitter,   name: "twitter",   href: "#" },
                { Icon: Youtube,   name: "youtube",   href: "#" },
              ].map(({ Icon, name, href }) => (
                <a
                  key={name}
                  href={href}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-dark-secondary border border-dark-border text-gray-400 hover:bg-brand-orange hover:border-brand-orange hover:text-white transition-all duration-200"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[11px] font-bold tracking-widest text-white uppercase mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-[13px] text-gray-400 hover:text-brand-orange transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* App download */}
          <div>
            <h4 className="text-[11px] font-bold tracking-widest text-white uppercase mb-4">DOWNLOAD APP</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { store: "App Store",   sub: "Download on the", emoji: "🍎" },
                { store: "Google Play", sub: "GET IT ON",        emoji: "▶" },
              ].map((app) => (
                <a
                  key={app.store}
                  href="#"
                  className="flex items-center gap-3 p-3 bg-dark-secondary border border-dark-border rounded-xl hover:border-brand-orange transition-colors group"
                >
                  <span className="text-xl">{app.emoji}</span>
                  <div>
                    <p className="text-[10px] text-gray-400">{app.sub}</p>
                    <p className="text-[13px] font-semibold text-white">{app.store}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-dark-border">
          <div className="flex items-center gap-4">
            <p className="text-[12px] text-gray-500">© 2025 Carro. All rights reserved.</p>
            <a href="/terms" className="text-[12px] text-gray-500 hover:text-gray-300 transition-colors">Terms</a>
            <a href="/privacy" className="text-[12px] text-gray-500 hover:text-gray-300 transition-colors">Privacy</a>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[12px] text-gray-400 px-3 py-1.5 bg-dark-secondary border border-dark-border rounded-lg">
              🇶🇦 Doha, Qatar
            </div>
            <div className="text-[12px] text-gray-400 px-3 py-1.5 bg-dark-secondary border border-dark-border rounded-lg">
              English
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
