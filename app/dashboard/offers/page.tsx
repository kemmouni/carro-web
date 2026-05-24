"use client";

import { useEffect, useState } from "react";
import { Tag, Check, X, ArrowRight, Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Offer {
  id:            string;
  buyerName:     string;
  buyerPhone:    string;
  proposedPrice: number;
  counterPrice:  number | null;
  message:       string | null;
  status:        "PENDING" | "ACCEPTED" | "DECLINED" | "COUNTERED";
  createdAt:     string;
  product: {
    id:       string;
    title:    string;
    price:    number;
    currency: string;
    images:   { url: string; isPrimary: boolean; sortOrder: number }[];
  };
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:   "text-yellow-400 bg-yellow-400/10",
  ACCEPTED:  "text-green-400 bg-green-400/10",
  DECLINED:  "text-red-400 bg-red-400/10",
  COUNTERED: "text-blue-400 bg-blue-400/10",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function CounterModal({ offer, onClose, onDone }: { offer: Offer; onClose: () => void; onDone: () => void }) {
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(status: "ACCEPTED" | "DECLINED" | "COUNTERED") {
    setLoading(true);
    await fetch(`/api/dashboard/offers/${offer.id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status, counterPrice: +price || undefined }),
    });
    setLoading(false);
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-dark-card rounded-2xl border border-dark-border p-6 shadow-2xl">
        <h3 className="text-[16px] font-black text-white mb-1">Respond to Offer</h3>
        <p className="text-[12px] text-gray-400 mb-4 line-clamp-1">{offer.product.title}</p>

        <div className="flex justify-between text-[13px] mb-4 bg-dark-primary rounded-xl p-3 border border-dark-border">
          <span className="text-gray-400">Their offer</span>
          <span className="font-bold text-white">{formatPrice(offer.proposedPrice, offer.product.currency)}</span>
        </div>

        <label className="block text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
          Counter price (optional)
        </label>
        <input
          value={price}
          onChange={e => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder={String(offer.product.price)}
          className="w-full h-10 bg-dark-primary border border-dark-border rounded-xl px-3 text-[13px] text-white placeholder-gray-600 focus:outline-none focus:border-brand-orange mb-4"
        />

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => submit("ACCEPTED")}
            disabled={loading}
            className="h-10 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl font-bold text-[12px] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
          >
            <Check size={13} /> Accept
          </button>
          <button
            onClick={() => submit("COUNTERED")}
            disabled={loading || !price}
            className="h-10 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl font-bold text-[12px] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <ArrowRight size={13} /> Counter
          </button>
          <button
            onClick={() => submit("DECLINED")}
            disabled={loading}
            className="h-10 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-bold text-[12px] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
          >
            <X size={13} /> Decline
          </button>
        </div>

        <button onClick={onClose} className="mt-3 w-full text-[12px] text-gray-500 hover:text-gray-300 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function OffersPage() {
  const [offers,  setOffers]  = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [active,  setActive]  = useState<Offer | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/dashboard/offers");
    const j = await r.json();
    setOffers(j.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const pending = offers.filter(o => o.status === "PENDING").length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {active && (
        <CounterModal
          offer={active}
          onClose={() => setActive(null)}
          onDone={() => { setActive(null); load(); }}
        />
      )}

      <div className="flex items-center gap-3 mb-6">
        <Tag size={22} className="text-brand-orange" />
        <div>
          <h1 className="text-[22px] font-black text-white">Offers</h1>
          <p className="text-[13px] text-gray-400">
            {pending > 0 ? `${pending} pending offer${pending > 1 ? "s" : ""} need attention` : "All caught up!"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-dark-border border-t-brand-orange rounded-full animate-spin" />
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-20">
          <Tag size={48} className="text-dark-border mx-auto mb-4" />
          <p className="text-white font-bold text-[16px] mb-1">No offers yet</p>
          <p className="text-gray-400 text-[13px]">When buyers make price offers, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map(o => {
            const img = o.product.images.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))[0];
            const pct = Math.round(((o.proposedPrice - o.product.price) / o.product.price) * 100);

            return (
              <div key={o.id} className="card p-4 flex gap-4 items-start">
                {img && (
                  <img
                    src={img.url}
                    alt={o.product.title}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-dark-primary"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-[13px] font-bold text-white line-clamp-1">{o.product.title}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{o.buyerName} · {o.buyerPhone}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${STATUS_COLOR[o.status]}`}>
                      {o.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <div>
                      <span className="text-[11px] text-gray-500">Listed </span>
                      <span className="text-[12px] text-white font-bold">{formatPrice(o.product.price, o.product.currency)}</span>
                    </div>
                    <ArrowRight size={12} className="text-gray-600" />
                    <div>
                      <span className="text-[11px] text-gray-500">Offered </span>
                      <span className={`text-[13px] font-black ${pct < 0 ? "text-green-400" : "text-red-400"}`}>
                        {formatPrice(o.proposedPrice, o.product.currency)}
                      </span>
                      <span className={`text-[10px] ml-1 ${pct < 0 ? "text-green-500" : "text-red-500"}`}>
                        ({pct < 0 ? "" : "+"}{pct}%)
                      </span>
                    </div>
                    {o.counterPrice && (
                      <>
                        <ArrowRight size={12} className="text-gray-600" />
                        <div>
                          <span className="text-[11px] text-gray-500">Counter </span>
                          <span className="text-[12px] text-blue-400 font-bold">{formatPrice(o.counterPrice, o.product.currency)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {o.message && (
                    <p className="text-[12px] text-gray-400 mt-1.5 italic line-clamp-2">"{o.message}"</p>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <span className="flex items-center gap-1 text-[11px] text-gray-600">
                      <Clock size={10} /> {timeAgo(o.createdAt)}
                    </span>
                    {o.status === "PENDING" && (
                      <button
                        onClick={() => setActive(o)}
                        className="text-[12px] font-bold text-brand-orange hover:underline"
                      >
                        Respond →
                      </button>
                    )}
                    {o.status !== "PENDING" && (
                      <a
                        href={`https://wa.me/${o.buyerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${o.buyerName}, regarding your offer on ${o.product.title}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] font-bold text-[#25D366] hover:underline"
                      >
                        WhatsApp →
                      </a>
                    )}
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
