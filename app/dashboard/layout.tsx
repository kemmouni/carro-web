import { redirect } from "next/navigation";
import { getSellerStore } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const store = await getSellerStore();

  // No store yet → seller onboarding
  if (!store) {
    redirect("/seller/setup");
  }

  return (
    <div className="min-h-screen bg-dark-primary flex">
      <DashboardSidebar storeName={store.name} isVerified={store.isVerified ?? false} />

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
