import { redirect } from "next/navigation";
import { getSellerStore } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardClientWrapper } from "@/components/dashboard/DashboardClientWrapper";
import { MobileNotificationBar } from "@/components/dashboard/MobileNotificationBar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const store = await getSellerStore();

  if (!store) {
    redirect("/seller/setup");
  }

  return (
    <DashboardClientWrapper>
      <div className="min-h-screen bg-dark-primary">
        <div className="flex">
          {/* Desktop sidebar */}
          <div className="hidden md:block sticky top-0 h-screen overflow-y-auto flex-shrink-0">
            <DashboardSidebar storeName={store.name} isVerified={store.isVerified ?? false} />
          </div>

          {/* Main content */}
          <main className="flex-1 overflow-auto min-w-0">
            {/* Mobile top bar (replaces sidebar on small screens) */}
            <MobileNotificationBar storeName={store.name} />
            {children}
          </main>
        </div>
      </div>
    </DashboardClientWrapper>
  );
}
