"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Image as ImageIcon, Plus, Trash2, Eye, EyeOff, Upload,
  ChevronUp, ChevronDown, Save, X, Pencil,
} from "lucide-react";

interface HeroBanner {
  id: string;
  title: string;
  subtitle: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

const EMPTY: Omit<HeroBanner, "id" | "createdAt"> = {
  title:     "",
  subtitle:  "",
  ctaText:   "Shop Now",
  ctaLink:   "/browse",
  imageUrl:  "",
  isActive:  true,
  sortOrder: 0,
};

export default function BannersClient({ initialBanners }: { initialBanners: HeroBanner[] }) {
  const [banners, setBanners]   = useState<HeroBanner[]>(initialBanners);
  const [editing, setEditing]   = useState<string | null>(null);  // banner id being edited
  const [adding, setAdding]     = useState(false);
  const [form, setForm]         = useState({ ...EMPTY });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Upload image ─────────────────────────────────────────────────────────────
  async function uploadImage(file: File): Promise<string | null> {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "hero-banners");
      const res  = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      return json.success ? json.url : null;
    } finally {
      setUploading(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) setForm((f) => ({ ...f, imageUrl: url }));
    e.target.value = "";
  }

  // ── Save (create or update) ──────────────────────────────────────────────────
  async function handleSave() {
    setError("");
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSaving(true);
    try {
      const isNew = adding;
      const url   = isNew ? "/api/admin/banners" : `/api/admin/banners/${editing}`;
      const method = isNew ? "POST" : "PUT";
      const res   = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? "Failed"); return; }

      if (isNew) {
        setBanners((prev) => [...prev, json.data].sort((a, b) => a.sortOrder - b.sortOrder));
      } else {
        setBanners((prev) => prev.map((b) => b.id === editing ? json.data : b));
      }
      resetForm();
    } finally {
      setSaving(false);
    }
  }

  function startEdit(banner: HeroBanner) {
    setEditing(banner.id);
    setAdding(false);
    setForm({
      title:     banner.title,
      subtitle:  banner.subtitle ?? "",
      ctaText:   banner.ctaText ?? "Shop Now",
      ctaLink:   banner.ctaLink ?? "/browse",
      imageUrl:  banner.imageUrl ?? "",
      isActive:  banner.isActive,
      sortOrder: banner.sortOrder,
    });
  }

  function startAdd() {
    setAdding(true);
    setEditing(null);
    setForm({ ...EMPTY, sortOrder: banners.length });
  }

  function resetForm() {
    setAdding(false);
    setEditing(null);
    setForm({ ...EMPTY });
    setError("");
  }

  // ── Toggle active ────────────────────────────────────────────────────────────
  async function toggleActive(id: string, current: boolean) {
    const res  = await fetch(`/api/admin/banners/${id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ isActive: !current }),
    });
    const json = await res.json();
    if (json.success) {
      setBanners((prev) => prev.map((b) => b.id === id ? { ...b, isActive: !current } : b));
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────────
  async function deleteBanner(id: string) {
    if (!confirm("Delete this banner?")) return;
    const res  = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) setBanners((prev) => prev.filter((b) => b.id !== id));
  }

  // ── Reorder ──────────────────────────────────────────────────────────────────
  async function move(id: string, dir: -1 | 1) {
    const idx    = banners.findIndex((b) => b.id === id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= banners.length) return;

    const newBanners = [...banners];
    [newBanners[idx], newBanners[newIdx]] = [newBanners[newIdx], newBanners[idx]];
    const updated = newBanners.map((b, i) => ({ ...b, sortOrder: i }));
    setBanners(updated);

    // Persist new orders
    await Promise.all(updated.map((b) =>
      fetch(`/api/admin/banners/${b.id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ sortOrder: b.sortOrder }),
      })
    ));
  }

  const isFormOpen = adding || editing !== null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Hero Banners</h1>
          <p className="text-gray-500 text-sm mt-0.5">Control homepage hero images, titles and CTAs</p>
        </div>
        {!isFormOpen && (
          <button onClick={startAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-orange hover:bg-[#e64d00] text-white text-[13px] font-bold rounded-xl transition-colors">
            <Plus size={16} /> Add Banner
          </button>
        )}
      </div>

      {/* Form */}
      {isFormOpen && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-white">{adding ? "New Banner" : "Edit Banner"}</h2>
            <button onClick={resetForm} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Image upload */}
            <div className="md:col-span-2">
              <label className="block text-[12px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Banner Image</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="relative border-2 border-dashed border-dark-border rounded-xl overflow-hidden cursor-pointer hover:border-brand-orange/50 transition-colors group"
                style={{ height: 200 }}
              >
                {form.imageUrl ? (
                  <Image src={form.imageUrl} alt="Banner preview" fill className="object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500 group-hover:text-gray-300 transition-colors">
                    <Upload size={32} />
                    <p className="text-[13px] font-medium">Click to upload banner image</p>
                    <p className="text-[11px]">Recommended: 1920×600px, JPG/PNG/WebP</p>
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <p className="text-white font-semibold">Uploading…</p>
                  </div>
                )}
                {form.imageUrl && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <p className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                      <Upload size={16} /> Change image
                    </p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              {form.imageUrl && (
                <button onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                  className="mt-2 text-[11px] text-red-400 hover:text-red-300 transition-colors">
                  Remove image
                </button>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Title *</label>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Qatar's #1 Auto Parts Marketplace"
                className="w-full bg-dark-secondary border border-dark-border rounded-lg px-4 py-2.5 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange" />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Subtitle</label>
              <input value={form.subtitle ?? ""} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                placeholder="Find genuine OEM and aftermarket parts"
                className="w-full bg-dark-secondary border border-dark-border rounded-lg px-4 py-2.5 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange" />
            </div>

            {/* CTA text */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Button Text</label>
              <input value={form.ctaText ?? ""} onChange={(e) => setForm((f) => ({ ...f, ctaText: e.target.value }))}
                placeholder="Shop Now"
                className="w-full bg-dark-secondary border border-dark-border rounded-lg px-4 py-2.5 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange" />
            </div>

            {/* CTA link */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Button Link</label>
              <input value={form.ctaLink ?? ""} onChange={(e) => setForm((f) => ({ ...f, ctaLink: e.target.value }))}
                placeholder="/browse"
                className="w-full bg-dark-secondary border border-dark-border rounded-lg px-4 py-2.5 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange" />
            </div>

            {/* Sort order */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                className="w-full bg-dark-secondary border border-dark-border rounded-lg px-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-brand-orange" />
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3 pt-6">
              <button type="button" onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                className={`w-10 h-5 rounded-full transition-colors relative ${form.isActive ? "bg-brand-orange" : "bg-dark-border"}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.isActive ? "left-5.5 translate-x-0.5" : "left-0.5"}`} />
              </button>
              <span className="text-[13px] text-gray-300">{form.isActive ? "Active (shown on homepage)" : "Inactive (hidden)"}</span>
            </div>
          </div>

          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[13px] text-red-400">{error}</div>
          )}

          <div className="flex items-center gap-3 mt-6">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-orange hover:bg-[#e64d00] text-white text-[13px] font-bold rounded-xl transition-colors disabled:opacity-50">
              <Save size={15} /> {saving ? "Saving…" : "Save Banner"}
            </button>
            <button onClick={resetForm} className="px-4 py-2.5 text-gray-400 hover:text-white text-[13px] transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Banner list */}
      {banners.length === 0 ? (
        <div className="card flex flex-col items-center py-20 text-center">
          <ImageIcon size={48} className="text-gray-600 mb-4" />
          <p className="text-lg font-bold text-white mb-1">No banners yet</p>
          <p className="text-gray-500 text-sm">Add your first hero banner to display on the homepage</p>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((b, idx) => (
            <div key={b.id} className={`card overflow-hidden ${!b.isActive ? "opacity-50" : ""}`}>
              <div className="flex items-stretch">
                {/* Thumbnail */}
                <div className="w-48 flex-shrink-0 bg-dark-secondary relative">
                  {b.imageUrl ? (
                    <Image src={b.imageUrl} alt={b.title} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon size={32} className="text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[15px] font-bold text-white">{b.title}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.isActive ? "bg-green-500/15 text-green-400" : "bg-gray-500/15 text-gray-500"}`}>
                          {b.isActive ? "ACTIVE" : "HIDDEN"}
                        </span>
                      </div>
                      {b.subtitle && <p className="text-[13px] text-gray-400 mb-2">{b.subtitle}</p>}
                      <div className="flex items-center gap-3">
                        {b.ctaText && (
                          <span className="text-[11px] bg-brand-orange/10 text-brand-orange px-2.5 py-1 rounded-lg font-semibold">
                            {b.ctaText} → {b.ctaLink}
                          </span>
                        )}
                        <span className="text-[11px] text-gray-600">Order: {b.sortOrder}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Reorder */}
                      <button onClick={() => move(b.id, -1)} disabled={idx === 0}
                        className="p-1.5 rounded hover:bg-dark-secondary text-gray-500 hover:text-white transition-colors disabled:opacity-30">
                        <ChevronUp size={14} />
                      </button>
                      <button onClick={() => move(b.id, 1)} disabled={idx === banners.length - 1}
                        className="p-1.5 rounded hover:bg-dark-secondary text-gray-500 hover:text-white transition-colors disabled:opacity-30">
                        <ChevronDown size={14} />
                      </button>
                      {/* Toggle */}
                      <button onClick={() => toggleActive(b.id, b.isActive)} title={b.isActive ? "Hide banner" : "Show banner"}
                        className="p-1.5 rounded hover:bg-dark-secondary transition-colors">
                        {b.isActive
                          ? <Eye size={14} className="text-green-400" />
                          : <EyeOff size={14} className="text-gray-500" />}
                      </button>
                      {/* Edit */}
                      <button onClick={() => startEdit(b)}
                        className="p-1.5 rounded hover:bg-dark-secondary text-gray-500 hover:text-white transition-colors">
                        <Pencil size={14} />
                      </button>
                      {/* Delete */}
                      <button onClick={() => deleteBanner(b.id)}
                        className="p-1.5 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
