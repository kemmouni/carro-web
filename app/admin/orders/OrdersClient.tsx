"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { ShoppingBag, Search, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { id: string; title: string; images: { url: string; isPrimary: boolean }[] } | null;
}

interface AdminOrder {
  id: string;
  status: string;
  totalAmount: number;
  currency: string | null;
  paymentMethod: string | null;
  paymentStatus: string | null;
  buyerName: string | null;
  buyerEmail: string | null;
  buyerPhone: string | null;
  shippingAddress: string | null;
  notes: string | null;
  createdAt: string;
  store: { id: string; name: string; slug: string } | null;
  items: OrderItem[];
}

const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
const STATUS_COLORS: Record<string, string> = {
  PENDING:   "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  CONFIRMED: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  SHIPPED:   "bg-purple-500/15 text-purple-400 border border-purple-500/30",
  DELIVERED: "bg-green-500/15 text-green-400 border border-green-500/30",
  CANCELLED: "bg-red-500/15 text-red-400 border border-red-500/30",
};

type Filter = "ALL" | "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export default function OrdersClient({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const [orders, setOrders]   = useState<AdminOrder[]>(initialOrders);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<Filter>("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading]   = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter((o) => {
      const matchSearch =
        (o.buyerName ?? "").toLowerCase().includes(q) ||
        (o.buyerEmail ?? "").toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        (o.store?.name ?? "").toLowerCase().includes(q);
      const matchFilter = filter === "ALL" ? true : o.status === filter;
      return matchSearch && matchFilter;
    });
  }, [orders, search, filter]);

  async function updateStatus(id: string, status: string) {
    setLoading(id);
    try {
      const res  = await fetch(`/api/admin/orders/${id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
      } else {
        toast.error(json.error ?? "Failed");
      }
    } finally {
      setLoading(null);
    }
  }

  const counts = {
    ALL:       orders.length,
    PENDING:   orders.filter((o) => o.status === "PENDING").length,
    CONFIRMED: orders.filter((o) => o.status === "CONFIRMED").length,
    SHIPPED:   orders.filter((o) => o.status === "SHIPPED").length,
    DELIVERED: orders.filter((o) => o.status === "DELIVERED").length,
    CANCELLED: orders.filter((o) => o.status === "CANCELLED").length,
  };

  const totalRevenue = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Orders</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {orders.length} total orders · QAR {totalRevenue.toLocaleString()} revenue
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(["ALL", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
              filter === f ? "bg-brand-orange text-white" : "bg-dark-secondary text-gray-400 hover:text-white"
            }`}>
            {f} <span className="ml-1 text-[11px] opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by buyer name, email, store…"
          className="w-full bg-dark-secondary border border-dark-border rounded-lg pl-9 pr-4 py-2.5 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange" />
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center py-20 text-center">
          <ShoppingBag size={48} className="text-gray-600 mb-4" />
          <p className="text-lg font-bold text-white mb-1">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const isExpanded = expanded === o.id;
            const primaryImage = o.items[0]?.product?.images?.find((i) => i.isPrimary)?.url ?? o.items[0]?.product?.images?.[0]?.url;
            return (
              <div key={o.id} className="card overflow-hidden">
                {/* Order header */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-dark-secondary/30 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : o.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Product thumbnail */}
                    <div className="w-10 h-10 rounded-lg bg-dark-input overflow-hidden flex-shrink-0">
                      {primaryImage ? (
                        <Image src={primaryImage} alt="" width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag size={16} className="text-gray-600 m-auto mt-2.5" />
                      )}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-white">{o.buyerName ?? "Customer"}</p>
                      <p className="text-[11px] text-gray-500">
                        {o.store?.name ?? "—"} · {new Date(o.createdAt).toLocaleDateString()} · {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] font-bold text-white">QAR {(o.totalAmount ?? 0).toFixed(2)}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[o.status] ?? ""}`}>
                      {o.status}
                    </span>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-dark-border px-5 py-4 space-y-4">
                    {/* Buyer info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-[11px] text-gray-500 mb-1">Buyer</p>
                        <p className="text-[13px] text-white font-medium">{o.buyerName ?? "—"}</p>
                        <p className="text-[11px] text-gray-400">{o.buyerEmail ?? "—"}</p>
                        <p className="text-[11px] text-gray-400">{o.buyerPhone ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500 mb-1">Store</p>
                        {o.store ? (
                          <Link href={`/store/${o.store.slug}`} target="_blank"
                            className="text-[13px] text-brand-orange hover:underline flex items-center gap-1">
                            {o.store.name} <ExternalLink size={10} />
                          </Link>
                        ) : <p className="text-[13px] text-gray-400">—</p>}
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500 mb-1">Payment</p>
                        <p className="text-[13px] text-white">{o.paymentMethod ?? "—"}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          o.paymentStatus === "PAID" ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"
                        }`}>{o.paymentStatus ?? "—"}</span>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-500 mb-1">Shipping to</p>
                        <p className="text-[13px] text-white">{o.shippingAddress ?? "—"}</p>
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <p className="text-[11px] text-gray-500 mb-2 uppercase tracking-wider">Items</p>
                      <div className="space-y-2">
                        {o.items.map((item) => {
                          const img = item.product?.images?.find((i) => i.isPrimary)?.url ?? item.product?.images?.[0]?.url;
                          return (
                            <div key={item.id} className="flex items-center gap-3 py-2 border-b border-dark-border/50 last:border-0">
                              <div className="w-8 h-8 rounded bg-dark-input overflow-hidden flex-shrink-0">
                                {img ? <Image src={img} alt="" width={32} height={32} className="w-full h-full object-cover" /> : null}
                              </div>
                              <p className="text-[13px] text-white flex-1">{item.product?.title ?? "—"}</p>
                              <p className="text-[12px] text-gray-400">x{item.quantity}</p>
                              <p className="text-[13px] font-semibold text-white">QAR {(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Status update */}
                    <div className="flex items-center gap-3 pt-2">
                      <p className="text-[12px] text-gray-400">Update status:</p>
                      <div className="flex gap-2 flex-wrap">
                        {STATUS_OPTIONS.filter((s) => s !== o.status).map((s) => (
                          <button key={s} onClick={() => updateStatus(o.id, s)} disabled={loading === o.id}
                            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-40 ${STATUS_COLORS[s] ?? "bg-dark-secondary text-gray-400"} hover:opacity-80`}>
                            → {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
