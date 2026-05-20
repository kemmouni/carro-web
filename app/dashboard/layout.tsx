import { redirect } from "next/navigation";
import { getSellerStore } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const store = await getSellerStore();

  // If somehow they got past middleware without a store, redirect to login
  if (!store) {
    redirect("/auth/login");
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
