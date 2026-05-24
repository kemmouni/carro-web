"use client";

import { useState } from "react";
import { X, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

interface Props {
  productId: string;
  title:     string;
  onClose:   () => void;
}

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00",
];

function minDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export default function BookingModal({ productId, title, onClose }: Props) {
  const [name,    setName]    = useState("");
  const [phone,   setPhone]   = useState("");
  const [date,    setDate]    = useState("");
  const [time,    setTime]    = useState("");
  const [notes,   setNotes]   = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function submit() {
    if (!name.trim() || !phone.trim() || !date || !time) {
      toast.error("Name, phone, date, and time are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          productId,
          customerName:  name.trim(),
          customerPhone: phone.trim(),
          bookingDate:   date,
          bookingTime:   time,
          notes:         notes.trim() || null,
        }),
      });
      const j = await res.json();
      if (j.success) setSuccess(true);
      else toast.error(j.error ?? "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-dark-card rounded-2xl border border-dark-border p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X size={20} />
        </button>

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <Calendar size={28} className="text-green-400" />
            </div>
            <h3 className="text-[17px] font-black text-white mb-2">Appointment Booked!</h3>
            <p className="text-gray-400 text-[13px]">
              The workshop will confirm your appointment via WhatsApp.
            </p>
            <button onClick={onClose} className="mt-6 w-full h-11 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl font-bold text-[14px] transition-colors">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Calendar size={18} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-[16px] font-black text-white">Book Appointment</h3>
                <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{title}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
                  Your Name *
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Ahmed Al-Khalifa"
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
                  Preferred Date *
                </label>
                <input
                  type="date"
                  value={date}
                  min={minDate()}
                  onChange={e => setDate(e.target.value)}
                  className="w-full h-10 bg-dark-primary border border-dark-border rounded-xl px-3 text-[13px] text-white focus:outline-none focus:border-brand-orange"
                  style={{ colorScheme: "dark" }}
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
                  Preferred Time *
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {TIME_SLOTS.map(t => (
                    <button
                      key={t}
                      onClick={() => setTime(t)}
                      className={`h-9 rounded-lg text-[12px] font-semibold transition-colors flex items-center justify-center gap-1 ${
                        time === t
                          ? "bg-brand-orange text-white"
                          : "bg-dark-primary border border-dark-border text-gray-400 hover:border-brand-orange hover:text-white"
                      }`}
                    >
                      <Clock size={10} />
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Describe the issue or service needed..."
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
                  <Calendar size={15} />
                  Book Appointment
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
