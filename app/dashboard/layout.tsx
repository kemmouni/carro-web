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
      <div className="flex">
        {/* Desktop sidebar */}
        <div className="hidden md:block sticky top-0 h-screen overflow-y-auto flex-shrink-0">
          <DashboardSidebar storeName={store.name} isVerified={store.isVerified ?? false} />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
