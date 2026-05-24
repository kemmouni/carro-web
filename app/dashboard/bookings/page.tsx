"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, Check, X, CheckCircle, Phone } from "lucide-react";

interface Booking {
  id:            string;
  customerName:  string;
  customerPhone: string;
  bookingDate:   string;
  bookingTime:   string;
  notes:         string | null;
  status:        "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt:     string;
  product: {
    id:     string;
    title:  string;
    images: { url: string; isPrimary: boolean }[];
  };
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:   "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  CONFIRMED: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  CANCELLED: "text-red-400 bg-red-400/10 border-red-400/20",
  COMPLETED: "text-green-400 bg-green-400/10 border-green-400/20",
};

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-QA", {
    weekday: "short", day: "numeric", month: "short",
  });
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<string>("all");

  async function load() {
    setLoading(true);
    const r = await fetch("/api/dashboard/bookings");
    const j = await r.json();
    setBookings(j.data ?? []);
    setLoading(false);
  }

  async function update(id: string, status: string) {
    await fetch(`/api/dashboard/bookings/${id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status }),
    });
    load();
  }

  useEffect(() => { load(); }, []);

  const filtered = filter === "all"
    ? bookings
    : bookings.filter(b => b.status === filter.toUpperCase());

  const counts = {
    all:       bookings.length,
    pending:   bookings.filter(b => b.status === "PENDING").length,
    confirmed: bookings.filter(b => b.status === "CONFIRMED").length,
    completed: bookings.filter(b => b.status === "COMPLETED").length,
  };

  const TABS = [
    { key: "all",       label: "All",       count: counts.all },
    { key: "pending",   label: "Pending",   count: counts.pending },
    { key: "confirmed", label: "Confirmed", count: counts.confirmed },
    { key: "completed", label: "Completed", count: counts.completed },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Calendar size={22} className="text-brand-orange" />
        <div>
          <h1 className="text-[22px] font-black text-white">Bookings</h1>
          <p className="text-[13px] text-gray-400">Workshop appointment requests</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors flex items-center gap-1.5 ${
              filter === t.key
                ? "bg-brand-orange text-white"
                : "bg-dark-card border border-dark-border text-gray-400 hover:text-white"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                filter === t.key ? "bg-white/20 text-white" : "bg-dark-primary text-gray-400"
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-dark-border border-t-brand-orange rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Calendar size={48} className="text-dark-border mx-auto mb-4" />
          <p className="text-white font-bold text-[16px] mb-1">No bookings</p>
          <p className="text-gray-400 text-[13px]">Appointment requests will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => {
            const img = b.product.images.sort((a, p) => (b.status === a.isPrimary.toString() ? -1 : 0))[0];
            return (
              <div key={b.id} className="card p-4">
                <div className="flex gap-4 items-start">
                  {img && (
                    <img
                      src={img.url}
                      alt={b.product.title}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-dark-primary"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[13px] font-bold text-white line-clamp-1">{b.product.title}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{b.customerName}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide flex-shrink-0 ${STATUS_COLOR[b.status]}`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="flex items-center gap-1.5 text-[12px] text-white font-semibold">
                        <Calendar size={12} className="text-brand-orange" />
                        {formatDate(b.bookingDate)}
                      </span>
                      <span className="flex items-center gap-1.5 text-[12px] text-white font-semibold">
                        <Clock size={12} className="text-brand-orange" />
                        {b.bookingTime}
                      </span>
                      <a
                        href={`tel:${b.customerPhone}`}
                        className="flex items-center gap-1.5 text-[12px] text-blue-400 hover:underline"
                      >
                        <Phone size={12} />
                        {b.customerPhone}
                      </a>
                    </div>

                    {b.notes && (
                      <p className="text-[12px] text-gray-400 mt-1.5 italic line-clamp-2">"{b.notes}"</p>
                    )}

                    {b.status === "PENDING" && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => update(b.id, "CONFIRMED")}
                          className="h-8 px-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Check size={12} /> Confirm
                        </button>
                        <button
                          onClick={() => update(b.id, "CANCELLED")}
                          className="h-8 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <X size={12} /> Cancel
                        </button>
                        <a
                          href={`https://wa.me/${b.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${b.customerName}, your appointment is confirmed for ${formatDate(b.bookingDate)} at ${b.bookingTime}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-8 px-3 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-colors"
                        >
                          WhatsApp
                        </a>
                      </div>
                    )}

                    {b.status === "CONFIRMED" && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => update(b.id, "COMPLETED")}
                          className="h-8 px-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <CheckCircle size={12} /> Mark Completed
                        </button>
                        <button
                          onClick={() => update(b.id, "CANCELLED")}
                          className="h-8 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <X size={12} /> Cancel
                        </button>
                      </div>
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
