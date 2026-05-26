"use client";

import { useState, useMemo } from "react";
import { Calendar, Search, Phone } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface AdminBooking {
  id: string;
  status: string;
  customerName: string;
  customerPhone: string;
  bookingDate: string;
  bookingTime: string;
  notes: string | null;
  createdAt: string;
  store: { id: string; name: string; slug: string } | null;
  product: { id: string; title: string } | null;
}

const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
const STATUS_COLORS: Record<string, string> = {
  PENDING:   "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  CONFIRMED: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  COMPLETED: "bg-green-500/15 text-green-400 border border-green-500/30",
  CANCELLED: "bg-red-500/15 text-red-400 border border-red-500/30",
};

type Filter = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export default function BookingsClient({ initialBookings }: { initialBookings: AdminBooking[] }) {
  const [bookings, setBookings] = useState<AdminBooking[]>(initialBookings);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState<Filter>("ALL");
  const [loading, setLoading]   = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return bookings.filter((b) => {
      const matchSearch =
        b.customerName.toLowerCase().includes(q) ||
        b.customerPhone.includes(q) ||
        (b.store?.name ?? "").toLowerCase().includes(q) ||
        (b.product?.title ?? "").toLowerCase().includes(q);
      const matchFilter = filter === "ALL" ? true : b.status === filter;
      return matchSearch && matchFilter;
    });
  }, [bookings, search, filter]);

  async function updateStatus(id: string, status: string) {
    setLoading(id);
    try {
      const res  = await fetch(`/api/admin/bookings/${id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
      } else {
        toast.error(json.error ?? "Failed");
      }
    } finally {
      setLoading(null);
    }
  }

  const counts = {
    ALL:       bookings.length,
    PENDING:   bookings.filter((b) => b.status === "PENDING").length,
    CONFIRMED: bookings.filter((b) => b.status === "CONFIRMED").length,
    COMPLETED: bookings.filter((b) => b.status === "COMPLETED").length,
    CANCELLED: bookings.filter((b) => b.status === "CANCELLED").length,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Bookings</h1>
        <p className="text-gray-500 text-sm mt-0.5">All service bookings across the platform</p>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {(["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
              filter === f ? "bg-brand-orange text-white" : "bg-dark-secondary text-gray-400 hover:text-white"
            }`}>
            {f} <span className="ml-1 text-[11px] opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name, phone, store…"
          className="w-full bg-dark-secondary border border-dark-border rounded-lg pl-9 pr-4 py-2.5 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange" />
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center py-20 text-center">
          <Calendar size={48} className="text-gray-600 mb-4" />
          <p className="text-lg font-bold text-white mb-1">No bookings found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Customer</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5 hidden md:table-cell">Service</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5">Date & Time</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-dark-secondary/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-[13px] font-semibold text-white">{b.customerName}</p>
                    <a href={`tel:${b.customerPhone}`} className="text-[11px] text-brand-orange flex items-center gap-1 mt-0.5 hover:underline">
                      <Phone size={10} /> {b.customerPhone}
                    </a>
                    {b.notes && <p className="text-[11px] text-gray-500 mt-0.5 italic">"{b.notes}"</p>}
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <p className="text-[13px] text-white">{b.product?.title ?? "—"}</p>
                    {b.store && (
                      <Link href={`/store/${b.store.slug}`} target="_blank" className="text-[11px] text-brand-orange hover:underline">
                        {b.store.name}
                      </Link>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-[13px] text-white font-medium">{b.bookingDate}</p>
                    <p className="text-[11px] text-gray-500">{b.bookingTime}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[b.status] ?? ""}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      {STATUS_OPTIONS.filter((s) => s !== b.status).map((s) => (
                        <button key={s} onClick={() => updateStatus(b.id, s)} disabled={loading === b.id}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-40 ${STATUS_COLORS[s]} hover:opacity-80`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
