"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Store, CheckCircle, Loader2, X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreData {
  id:           string;
  name:         string;
  description:  string;
  phone:        string;
  email:        string;
  website:      string;
  address:      string;
  city:         string;
  workingHours: string;
  logoUrl:      string;
  coverUrl:     string;
}

async function uploadImage(file: File): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file);
  const res  = await fetch("/api/upload", { method: "POST", body: fd });
  const json = await res.json();
  return json.success ? json.url : null;
}

function ImageUploadField({
  label, value, onChange,
}: { label: string; value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (url) onChange(url);
    setUploading(false);
    e.target.value = "";
  }

  return (
    <div>
      <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">{label}</label>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {value ? (
        <div className="relative group h-24 rounded-xl overflow-hidden border border-dark-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button type="button" onClick={() => ref.current?.click()} className="text-[12px] text-white font-semibold flex items-center gap-1.5">
              <Upload size={13} /> Change
            </button>
            <button type="button" onClick={() => onChange("")} className="text-[12px] text-red-400 font-semibold flex items-center gap-1.5">
              <X size={13} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="w-full h-24 rounded-xl border-2 border-dashed border-dark-border hover:border-brand-orange hover:bg-brand-orange/5 transition-all flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-brand-orange disabled:opacity-60"
        >
          {uploading ? (
            <><Loader2 size={20} className="animate-spin" /><span className="text-[12px]">Uploading…</span></>
          ) : (
            <><Upload size={20} /><span className="text-[12px]">Click to upload</span></>
          )}
        </button>
      )}
    </div>
  );
}

export default function DashboardStorePage() {
  const [form,    setForm]    = useState<StoreData | null>(null);
  const [storeId, setStoreId] = useState<string>("");
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  // Fetch current store data
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then(async (j) => {
        if (!j.success) return;
        const storeRes = await fetch(`/api/stores/${j.data.storeId}`);
        const storeJson = await storeRes.json();
        if (storeJson.success) {
          const s = storeJson.data;
          setStoreId(s.id);
          setForm({
            id:           s.id,
            name:         s.name         ?? "",
            description:  s.description  ?? "",
            phone:        s.phone        ?? "",
            email:        s.email        ?? "",
            website:      s.website      ?? "",
            address:      s.address      ?? "",
            city:         s.city         ?? "Doha",
            workingHours: s.workingHours ?? "",
            logoUrl:      s.logoUrl      ?? "",
            coverUrl:     s.coverUrl     ?? "",
          });
        }
      })
      .catch(() => {});
  }, []);

  const set = (k: keyof StoreData, v: string) =>
    setForm((f) => f ? { ...f, [k]: v } : f);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !storeId) return;
    setError("");
    setSaving(true);

    try {
      const res  = await fetch(`/api/stores/${storeId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (!form) {
    return (
      <div className="p-8 flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Store Profile</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your store info and contact details.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        {saved && (
          <div className="bg-green-500/15 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle size={14} /> Store profile saved successfully!
          </div>
        )}
        {error && (
          <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <X size={14} /> {error}
          </div>
        )}

        {/* ── Identity ── */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-orange-light flex items-center justify-center">
              <Store size={18} className="text-brand-orange" />
            </div>
            <h2 className="text-[15px] font-bold text-white">Store Identity</h2>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Store Name *</label>
            <input className="input w-full" value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Description</label>
            <textarea
              className="input w-full min-h-[90px] resize-y"
              placeholder="Tell buyers about your store, specialties, and experience…"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ImageUploadField label="Store Logo" value={form.logoUrl} onChange={(url) => set("logoUrl", url)} />
            <ImageUploadField label="Cover Image" value={form.coverUrl} onChange={(url) => set("coverUrl", url)} />
          </div>
        </div>

        {/* ── Contact & Location ── */}
        <div className="card p-6 space-y-4">
          <h2 className="text-[15px] font-bold text-white">Contact & Location</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">WhatsApp / Phone *</label>
              <input className="input w-full" placeholder="+974 5555 1234" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              <p className="text-[11px] text-gray-600 mt-1">Buyers will contact you on this number</p>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Email</label>
              <input type="email" className="input w-full" placeholder="store@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Address</label>
            <input className="input w-full" placeholder="Street, Area, Doha, Qatar" value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">City</label>
              <input className="input w-full" placeholder="Doha" value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Website</label>
              <input className="input w-full" placeholder="https://yourstore.qa" value={form.website} onChange={(e) => set("website", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Working Hours</label>
            <input className="input w-full" placeholder="e.g. Sat–Thu 8am–8pm, Fri 2pm–9pm" value={form.workingHours} onChange={(e) => set("workingHours", e.target.value)} />
          </div>
        </div>

        {/* ── WhatsApp preview ── */}
        {form.phone && (
          <div className={cn("card p-4 border-[#25D366]/30 bg-[#25D366]/5")}>
            <p className="text-[12px] font-semibold text-[#25D366] mb-1">WhatsApp Preview</p>
            <p className="text-[12px] text-gray-400">
              Buyers will be able to contact you at{" "}
              <a
                href={`https://wa.me/${form.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#25D366] font-semibold"
              >
                {form.phone}
              </a>
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
