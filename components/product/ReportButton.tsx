"use client";

import { useState } from "react";
import { Flag, X, Send } from "lucide-react";
import { toast } from "sonner";

const REASONS = [
  { id: "fake_listing",    label: "Fake or fraudulent listing" },
  { id: "prohibited_item", label: "Prohibited or illegal item" },
  { id: "wrong_price",     label: "Misleading price or description" },
  { id: "duplicate",       label: "Duplicate listing" },
  { id: "spam",            label: "Spam or irrelevant content" },
  { id: "other",           label: "Other" },
];

interface Props { productId: string; }

export function ReportButton({ productId }: Props) {
  const [open,    setOpen]    = useState(false);
  const [reason,  setReason]  = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  async function submit() {
    if (!reason) { toast.error("Please select a reason"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/report", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ productId, reason, details }),
      });
      const j = await res.json();
      if (j.success) { setDone(true); }
      else toast.error(j.error ?? "Failed to submit report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm bg-dark-card rounded-2xl border border-dark-border p-6 shadow-2xl">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
              <X size={18} />
            </button>

            {done ? (
              <div className="text-center py-4">
                <Flag size={36} className="text-brand-orange mx-auto mb-3" />
                <h3 className="text-[15px] font-black text-white mb-2">Report Submitted</h3>
                <p className="text-[12px] text-gray-400">Our team will review this listing within 24 hours.</p>
                <button onClick={() => setOpen(false)} className="mt-5 w-full h-10 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl font-bold text-[13px] transition-colors">
                  Done
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-[15px] font-black text-white mb-4">Report Listing</h3>
                <div className="space-y-2 mb-4">
                  {REASONS.map(r => (
                    <button
                      key={r.id}
                      onClick={() => setReason(r.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-[13px] transition-colors border ${
                        reason === r.id
                          ? "border-brand-orange bg-brand-orange/10 text-white font-semibold"
                          : "border-dark-border text-gray-400 hover:border-gray-500 hover:text-white"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                {reason === "other" && (
                  <textarea
                    value={details}
                    onChange={e => setDetails(e.target.value)}
                    placeholder="Please describe the issue..."
                    rows={3}
                    className="w-full bg-dark-primary border border-dark-border rounded-xl px-3 py-2 text-[13px] text-white placeholder-gray-600 focus:outline-none focus:border-brand-orange resize-none mb-4"
                  />
                )}

                <button
                  onClick={submit}
                  disabled={loading || !reason}
                  className="w-full h-10 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {loading ? <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> : <><Send size={13} /> Submit Report</>}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-[12px] text-gray-600 hover:text-red-400 transition-colors"
        title="Report this listing"
      >
        <Flag size={13} />
        Report
      </button>
    </>
  );
}
