"use client";

import { useState } from "react";
import { X, Tag, MessageSquare } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  productId: string;
  title:     string;
  price:     number;
  currency:  string;
  onClose:   () => void;
}

export default function OfferModal({ productId, title, price, currency, onClose }: Props) {
  const [name,     setName]     = useState("");
  const [phone,    setPhone]    = useState("");
  const [offered,  setOffered]  = useState("");
  const [message,  setMessage]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  const pct = offered ? Math.round(((+offered - price) / price) * 100) : null;

  async function submit() {
    if (!name.trim() || !phone.trim() || !offered) {
      toast.error("Name, phone, and offer price are required");
      return;
    }
    if (+offered <= 0) { toast.error("Enter a valid price"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/offers", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          productId,
          buyerName:     name.trim(),
          buyerPhone:    phone.trim(),
          proposedPrice: +offered,
          message:       message.trim() || null,
        }),
      });
      const j = await res.json();
      if (j.success) { setSuccess(true); }
      else toast.error(j.error ?? "Failed to send offer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-dark-card rounded-2xl border border-dark-border p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X size={20} />
        </button>

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <Tag size={28} className="text-green-400" />
            </div>
            <h3 className="text-[17px] font-black text-white mb-2">Offer Sent!</h3>
            <p className="text-gray-400 text-[13px]">
              The seller will review your offer and get back to you via WhatsApp.
            </p>
            <button onClick={onClose} className="mt-6 w-full h-11 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl font-bold text-[14px] transition-colors">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-brand-orange/20 flex items-center justify-center">
                <Tag size={18} className="text-brand-orange" />
              </div>
              <div>
                <h3 className="text-[16px] font-black text-white">Make an Offer</h3>
                <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{title}</p>
              </div>
            </div>

            <div className="mb-4 p-3 rounded-xl bg-dark-primary border border-dark-border flex items-center justify-between">
              <span className="text-[12px] text-gray-400">Listed price</span>
              <span className="text-[15px] font-black text-white">{formatPrice(price, currency)}</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
                  Your Name *
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Mohammed Al-Rashid"
                  className="w-full h-10 bg-dark-primary border border-dark-border rounded-xl px-3 text-[13px] text-white placeholder-gray-600 focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
                  WhatsApp / Phone *
                </label>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+974 5555 1234"
                  type="tel"
                  className="w-full h-10 bg-dark-primary border border-dark-border rounded-xl px-3 text-[13px] text-white placeholder-gray-600 focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
                  Your Offer Price ({currency}) *
                </label>
                <input
                  value={offered}
                  onChange={e => setOffered(e.target.value.replace(/[^0-9.]/g, ""))}
                  placeholder={String(Math.round(price * 0.9))}
                  type="number"
                  min="1"
                  className="w-full h-10 bg-dark-primary border border-dark-border rounded-xl px-3 text-[13px] text-white placeholder-gray-600 focus:outline-none focus:border-brand-orange"
                />
                {pct !== null && (
                  <p className={`text-[11px] mt-1 ${pct < 0 ? "text-green-400" : "text-red-400"}`}>
                    {pct < 0 ? `${Math.abs(pct)}% below` : `${pct}% above`} listed price
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
                  Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Why should the seller accept your offer?"
                  rows={2}
                  className="w-full bg-dark-primary border border-dark-border rounded-xl px-3 py-2 text-[13px] text-white placeholder-gray-600 focus:outline-none focus:border-brand-orange resize-none"
                />
              </div>
            </div>

            <button
              onClick={submit}
              disabled={loading}
              className="mt-5 w-full h-12 bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-60 text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <MessageSquare size={15} />
                  Send Offer
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
