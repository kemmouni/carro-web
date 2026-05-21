import { redirect } from "next/navigation";
import { getSellerStore } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const store = await getSellerStore();

  if (!store) {
    redirect("/seller/setup");
  }

  return (
    <div className="min-h-screen bg-dark-primary">
      {/* Desktop: side-by-side layout */}
      <div className="flex">
        <div className="hidden md:block sticky top-0 h-screen overflow-y-auto flex-shrink-0">
          <DashboardSidebar storeName={store.name} isVerified={store.isVerified ?? false} />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto min-w-0">
          {/* Mobile top nav */}
          <div className="md:hidden bg-dark-secondary border-b border-dark-border px-4 py-3 flex items-center justify-between">
            <span className="text-[15px] font-black text-brand-orange">CARRO</span>
            <span className="text-[12px] text-gray-400">{store.name}</span>
          </div>
          {/* Mobile bottom nav */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border flex z-40 safe-area-pb">
            <MobileNavItem href="/dashboard" label="Home" emoji="🏠" />
            <MobileNavItem href="/dashboard/products" label="Products" emoji="📦" />
            <MobileNavItem href="/dashboard/messages" label="Messages" emoji="💬" />
            <MobileNavItem href="/dashboard/analytics" label="Stats" emoji="📊" />
            <MobileNavItem href="/dashboard/settings" label="Settings" emoji="⚙️" />
          </div>
          <div className="pb-16 md:pb-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function MobileNavItem({ href, label, emoji }: { href: string; label: string; emoji: string }) {
  return (
    <a href={href} className="flex-1 flex flex-col items-center justify-center py-2 text-gray-400 hover:text-white transition-colors">
      <span className="text-[18px]">{emoji}</span>
      <span className="text-[10px] mt-0.5">{label}</span>
    </a>
  );
}
