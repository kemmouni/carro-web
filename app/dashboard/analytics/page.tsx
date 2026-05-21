import { getSellerStore } from "@/lib/auth";
import { redirect }       from "next/navigation";
import { supabaseAdmin }  from "@/lib/supabase";
import { Eye, MessageSquare, Package, TrendingUp, Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const store = await getSellerStore();
  if (!store) redirect("/auth/login");

  // Fetch products with view counts
  const { data: products } = await supabaseAdmin
    .from("products")
    .select(`id, title, price, viewCount, isActive, approvalStatus, images:product_images(url, sortOrder)`)
    .eq("storeId", store.id)
    .order("viewCount", { ascending: false });

  const items = products ?? [];

  // Fetch message counts per product
  const { data: messages } = await supabaseAdmin
    .from("messages")
    .select("id, productId, createdAt")
    .eq("storeId", store.id);

  const msgsByProduct: Record<string, number> = {};
  (messages ?? []).forEach((m: { productId: string | null }) => {
    if (m.productId) msgsByProduct[m.productId] = (msgsByProduct[m.productId] ?? 0) + 1;
  });

  const totalViews    = items.reduce((s: number, p: Record<string, unknown>) => s + ((p.viewCount as number) ?? 0), 0);
  const totalMessages = (messages ?? []).length;
  const activeCount   = items.filter((p: Record<string, unknown>) => p.isActive).length;

  const stats = [
    { label: "Total Views",      value: totalViews.toLocaleString(),    icon: Eye,            color: "text-blue-400",   bg: "bg-blue-500/10" },
    { label: "Total Inquiries",  value: totalMessages.toLocaleString(), icon: MessageSquare,  color: "text-green-400",  bg: "bg-green-500/10" },
    { label: "Active Listings",  value: activeCount.toString(),         icon: Package,        color: "text-brand-orange", bg: "bg-brand-orange/10" },
    { label: "Avg Views/Product",value: items.length ? Math.round(totalViews / items.length).toString() : "0", icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Analytics</h1>
        <p className="text-gray-500 text-sm mt-0.5">Track views and inquiries for your listings</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-[12px] text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Products table */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-white">Product Performance</h2>
      </div>

      {items.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <Package size={40} className="text-gray-600 mb-3" />
          <p className="text-[14px] font-bold text-white mb-1">No products yet</p>
          <p className="text-[12px] text-gray-500">Add products to start tracking performance.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Product</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5">Status</th>
                <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5">
                  <Eye size={11} className="inline mr-1" />Views
                </th>
                <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">
                  <MessageSquare size={11} className="inline mr-1" />Inquiries
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {items.map((p) => {
                const product = p as unknown as {
                  id: string; title: string; price: number; viewCount: number;
                  isActive: boolean; approvalStatus: string;
                  images: Array<{ url: string; sortOrder: number }>;
                };
                const img = product.images?.sort((a, b) => a.sortOrder - b.sortOrder)[0]?.url;
                const inquiries = msgsByProduct[product.id] ?? 0;
                return (
                  <tr key={product.id} className="hover:bg-dark-secondary/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-dark-input flex-shrink-0 overflow-hidden">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={12} className="text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-white max-w-[220px] truncate">{product.title}</p>
                          <p className="text-[11px] text-gray-500">{product.price.toLocaleString()} QAR</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${
                        product.approvalStatus === "ACTIVE" ? "bg-green-500/15 text-green-400" :
                        product.approvalStatus === "PENDING" ? "bg-yellow-500/15 text-yellow-400" :
                        "bg-red-500/15 text-red-400"
                      }`}>
                        {product.approvalStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-[13px] font-bold text-white">{(product.viewCount ?? 0).toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`text-[13px] font-bold ${inquiries > 0 ? "text-green-400" : "text-gray-600"}`}>
                        {inquiries}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
