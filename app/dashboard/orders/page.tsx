"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ShoppingBag, ChevronDown } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

interface OrderItem {
  id:       string;
  quantity: number;
  price:    number;
  product:  {
    id:     string;
    title:  string;
    images: Array<{ url: string; isPrimary: boolean; sortOrder: number }>;
  };
}

interface Order {
  id:              string;
  status:          string;
  total:           number;
  currency:        string;
  buyerName:       string;
  buyerPhone:      string;
  deliveryAddress: string;
  paymentMethod:   string;
  notes?:          string;
  createdAt:       string;
  items:           OrderItem[];
}

const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-yellow-400/15 text-yellow-400 border-yellow-400/30",
  CONFIRMED: "bg-blue-400/15 text-blue-400 border-blue-400/30",
  SHIPPED:   "bg-brand-orange/15 text-brand-orange border-brand-orange/30",
  DELIVERED: "bg-green-400/15 text-green-400 border-green-400/30",
  CANCELLED: "bg-red-400/15 text-red-400 border-red-400/30",
};

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(date).toLocaleDateString();
}

export default function DashboardOrdersPage() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/orders")
      .then((r) => r.json())
      .then((j) => { if (j.success) setOrders(j.data ?? []); })
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(orderId: string, status: string) {
    setUpdating(orderId);
    try {
      const res  = await fetch(`/api/dashboard/orders/${orderId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
      }
    } finally {
      setUpdating(null);
    }
  }

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <ShoppingBag size={22} />
          Orders
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage COD orders from your customers.</p>
      </div>

      {/* Stats row */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-5 gap-3 mb-6">
          {STATUS_OPTIONS.map((s) => (
            <div key={s} className="card p-3 text-center">
              <p className={cn("text-[20px] font-black", STATUS_STYLES[s].split(" ")[1])}>{counts[s]}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 capitalize">{s.toLowerCase()}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-dark-input rounded w-1/4 mb-3" />
              <div className="h-3 bg-dark-input rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-24 text-center">
          <ShoppingBag size={48} className="text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No orders yet</h3>
          <p className="text-gray-500 text-sm max-w-sm">
            When customers place COD orders for your listings, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const mainImage = order.items[0]?.product?.images
              ?.sort((a, b) => a.sortOrder - b.sortOrder)[0]?.url;

            return (
              <div key={order.id} className="card p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  {/* Left: product + buyer info */}
                  <div className="flex gap-4 flex-1 min-w-0">
                    {mainImage && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-dark-border flex-shrink-0">
                        <Image src={mainImage} alt="" width={64} height={64} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[11px] font-mono text-gray-500">#{order.id.slice(0, 8).toUpperCase()}</span>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", STATUS_STYLES[order.status])}>
                          {order.status}
                        </span>
                        <span className="text-[10px] text-gray-600">{timeAgo(order.createdAt)}</span>
                      </div>
                      {order.items.map((item) => (
                        <p key={item.id} className="text-[13px] text-white font-medium truncate">
                          {item.quantity}× {item.product.title}
                        </p>
                      ))}
                      <div className="mt-2 space-y-0.5">
                        <p className="text-[12px] text-gray-400"><span className="text-gray-600">Buyer:</span> {order.buyerName}</p>
                        <p className="text-[12px] text-gray-400"><span className="text-gray-600">Phone:</span>{" "}
                          <a href={`tel:${order.buyerPhone}`} className="text-brand-orange hover:underline">{order.buyerPhone}</a>
                        </p>
                        <p className="text-[12px] text-gray-400"><span className="text-gray-600">Address:</span> {order.deliveryAddress}</p>
                        {order.notes && <p className="text-[12px] text-gray-500 italic">"{order.notes}"</p>}
                      </div>
                    </div>
                  </div>

                  {/* Right: total + status select */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <p className="text-[20px] font-black text-brand-orange">{formatPrice(order.total, order.currency)}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{order.paymentMethod}</p>
                    <div className="relative">
                      <select
                        value={order.status}
                        disabled={updating === order.id}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="appearance-none bg-dark-input border border-dark-border text-white text-[12px] font-semibold rounded-lg pl-3 pr-8 py-2 cursor-pointer focus:outline-none focus:border-brand-orange disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
