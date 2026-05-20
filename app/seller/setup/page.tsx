"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Store, ArrowRight, Loader2, CheckCircle, Phone, MapPin } from "lucide-react";

export default function SellerSetupPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [name,     setName]     = useState("");
  const [city,     setCity]     = useState("Doha");
  const [phone,    setPhone]    = useState("");
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  // If user already has a store, send them straight to dashboard
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((j) => {
        if (!j.success) { router.replace("/auth/login"); return; }
        if (j.data.storeId) { router.replace("/dashboard"); return; }
        setChecking(false);
      })
      .catch(() => router.replace("/auth/login"));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Store name is required"); return; }
    setSaving(true);
    setError("");
    try {
      const res  = await fetch("/api/stores", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: name.trim(), city: city.trim(), phone: phone.trim() }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to create store");
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-orange-light flex items-center justify-center mx-auto mb-4">
            <Store size={28} className="text-brand-orange" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Create Your Store</h1>
          <p className="text-gray-400 text-sm">Set up your seller profile to start listing auto parts on Carro.</p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {["Free to list", "WhatsApp leads", "Qatar buyers"].map((b) => (
            <div key={b} className="card p-3 text-center">
              <CheckCircle size={16} className="text-brand-orange mx-auto mb-1.5" />
              <p className="text-[11px] font-semibold text-gray-300">{b}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-500/15 border border-red-500/30 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">
              Store Name <span className="text-brand-orange">*</span>
            </label>
            <input
              className="input w-full"
              placeholder="e.g. Al Mansoor Auto Parts"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
            <p className="text-[11px] text-gray-600 mt-1">This is what buyers will see on your store page.</p>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">
              <MapPin size={11} className="inline mr-1" />City
            </label>
            <input
              className="input w-full"
              placeholder="Doha"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">
              <Phone size={11} className="inline mr-1" />WhatsApp Number
            </label>
            <input
              className="input w-full"
              placeholder="+974 XXXX XXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="text-[11px] text-gray-600 mt-1">Buyers will contact you via this number. You can update it later.</p>
          </div>

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="btn-primary w-full h-12 disabled:opacity-60 mt-2"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Creating Store…</>
            ) : (
              <>Create My Store <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className="text-center text-[12px] text-gray-600 mt-4">
          You can fill in the rest of your store details (logo, description, hours) from the dashboard.
        </p>
      </div>
    </div>
  );
}
