import { ShoppingBag } from "lucide-react";

export default function DashboardOrdersPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Orders</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your customer orders.</p>
      </div>

      <div className="card flex flex-col items-center justify-center py-24 text-center">
        <ShoppingBag size={48} className="text-gray-600 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">No orders yet</h3>
        <p className="text-gray-500 text-sm max-w-sm">
          When customers place orders for your products, they will appear here.
        </p>
      </div>
    </div>
  );
}
