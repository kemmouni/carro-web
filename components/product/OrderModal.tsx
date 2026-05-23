"use client";

import { useState } from "react";
import { X, ShoppingBag, CheckCircle, Truck, Phone } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Props {
  productId: string;
  title:     string;
  price:     number;
  currency:  string;
  onClose:   () => void;
}

export default function OrderModal({ productId, title, price, currency, onClose }: Props) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [form, setForm] = useState({
    buyerName:       "",
    buyerPhone:      "",
    deliveryAddress: "",
    notes:           "",
    quantity:        1,
  });
  const [orderId, setOrderId] = useState("");

  const total = price * form.quantity;

  function set(k: string, v: unknown) {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.buyerName.trim() || !form.buyerPhone.trim() || !form.deliveryAddress.trim()) {
      setError("Name, phone and delivery address are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...form }),
      });
      const json = await res.json();
      if (!json.success) {
        if (res.status === 401) {
          setError("Please sign in to place an order.");
        } else {
          setError(json.error ?? "Failed to place order.");
        }
        return;
      }
      setOrderId(json.data.orderId);
      setStep("success");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-border">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-brand-orange" />
            <h2 className="text-[15px] font-bold text-white">Place Order (COD)</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {step === "success" ? (
          <div className="p-8 flex flex-col items-center text-center">
            <CheckCircle size={52} className="text-green-400 mb-4" />
            <h3 className="text-[18px] font-black text-white mb-1">Order Placed!</h3>
            <p className="text-[13px] text-gray-400 mb-2">
              Your order has been sent to the seller. They will contact you to confirm delivery.
            </p>
            <p className="text-[11px] text-gray-600 mb-6">Order ID: {orderId.slice(0, 8).toUpperCase()}</p>
            <div className="flex items-center gap-2 text-[12px] text-brand-orange bg-brand-orange/10 rounded-xl px-4 py-3 mb-6 w-full">
              <Truck size={14} className="flex-shrink-0" />
              Cash on Delivery — pay when your item arrives.
            </div>
            <button onClick={onClose} className="btn-primary w-full">Done</button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-5 space-y-4">
            {/* Product summary */}
            <div className="bg-dark-input rounded-xl p-4 flex items-center justify-between gap-3">
              <p className="text-[13px] text-white font-medium line-clamp-2 flex-1">{title}</p>
              <div className="text-right flex-shrink-0">
                <p className="text-[12px] text-gray-500">Total</p>
                <p className="text-[16px] font-black text-brand-orange">{formatPrice(total, currency)}</p>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <label className="text-[12px] font-semibold text-gray-400 w-24">Quantity</label>
              <div className="flex items-center gap-2 bg-dark-input rounded-lg">
                <button type="button" onClick={() => set("quantity", Math.max(1, form.quantity - 1))}
                  className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white transition-colors text-lg">−</button>
                <span className="w-8 text-center text-white font-semibold text-[14px]">{form.quantity}</span>
                <button type="button" onClick={() => set("quantity", Math.min(99, form.quantity + 1))}
                  className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white transition-colors text-lg">+</button>
              </div>
            </div>

            {/* Buyer info */}
            <div className="space-y-3">
              <input
                required
                placeholder="Your full name *"
                value={form.buyerName}
                onChange={(e) => set("buyerName", e.target.value)}
                className="w-full bg-dark-input border border-dark-border rounded-lg px-3 py-2.5 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange"
              />
              <div className="relative">
                <Phone size={13} className="absolute left-3 top-3 text-gray-500" />
                <input
                  required
                  type="tel"
                  placeholder="Phone / WhatsApp *"
                  value={form.buyerPhone}
                  onChange={(e) => set("buyerPhone", e.target.value)}
                  className="w-full bg-dark-input border border-dark-border rounded-lg pl-8 pr-3 py-2.5 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange"
                />
              </div>
              <textarea
                required
                placeholder="Delivery address (area, street, building) *"
                rows={2}
                value={form.deliveryAddress}
                onChange={(e) => set("deliveryAddress", e.target.value)}
                className="w-full bg-dark-input border border-dark-border rounded-lg px-3 py-2.5 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange resize-none"
              />
              <textarea
                placeholder="Additional notes (optional)"
                rows={2}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                className="w-full bg-dark-input border border-dark-border rounded-lg px-3 py-2.5 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange resize-none"
              />
            </div>

            {error && <p className="text-[12px] text-red-400">{error}</p>}

            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <Truck size={12} className="flex-shrink-0 text-brand-orange" />
              Cash on Delivery — you pay when the item arrives. No upfront payment required.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-[14px] rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              {loading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <ShoppingBag size={16} />}
              {loading ? "Placing order…" : `Place Order — ${formatPrice(total, currency)}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
