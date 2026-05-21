"use client";

import { useState } from "react";
import { Send, CheckCircle, MessageSquare } from "lucide-react";

interface Props {
  productId: string;
  storeId: string;
  productTitle: string;
}

export default function InquiryForm({ productId, storeId, productTitle }: Props) {
  const [open, setOpen]       = useState(false);
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({ name: "", email: "", phone: "", message: "" });
  const [error, setError]     = useState("");

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      setError("Name and message are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          storeId,
          fromName: form.name,
          fromEmail: form.email || undefined,
          fromPhone: form.phone || undefined,
          content: form.message,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSent(true);
      } else {
        setError(json.error ?? "Failed to send. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-dark-secondary hover:bg-dark-input border border-dark-border text-white text-[13px] font-semibold py-3 rounded-xl transition-colors"
      >
        <MessageSquare size={15} />
        Send Inquiry
      </button>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-bold text-white">Send an Inquiry</h3>
        <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white text-lg leading-none">×</button>
      </div>

      {sent ? (
        <div className="flex flex-col items-center py-6 text-center">
          <CheckCircle size={40} className="text-green-400 mb-3" />
          <p className="text-[14px] font-bold text-white mb-1">Message sent!</p>
          <p className="text-[12px] text-gray-500">The seller will get back to you soon.</p>
          <button
            onClick={() => { setSent(false); setOpen(false); setForm({ name: "", email: "", phone: "", message: "" }); }}
            className="mt-4 text-[12px] text-brand-orange hover:underline"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <p className="text-[11px] text-gray-500 -mt-1 mb-2">Re: {productTitle}</p>

          <input
            required
            placeholder="Your name *"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="w-full bg-dark-input border border-dark-border rounded-lg px-3 py-2.5 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange"
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className="w-full bg-dark-input border border-dark-border rounded-lg px-3 py-2.5 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange"
          />
          <input
            type="tel"
            placeholder="Phone / WhatsApp (optional)"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className="w-full bg-dark-input border border-dark-border rounded-lg px-3 py-2.5 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange"
          />
          <textarea
            required
            placeholder="Your message *"
            rows={3}
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            className="w-full bg-dark-input border border-dark-border rounded-lg px-3 py-2.5 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange resize-none"
          />

          {error && <p className="text-[12px] text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-hover text-white text-[13px] font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <><Send size={14} /> Send Message</>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
