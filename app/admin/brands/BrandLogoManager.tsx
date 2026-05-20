"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Check, Loader2, X, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  country?: string | null;
  isPopular: boolean;
  sortOrder: number;
}

export default function BrandLogoManager({ brands }: { brands: Brand[] }) {
  const [items, setItems] = useState<Brand[]>(brands);
  const [uploading, setUploading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "popular" | "no-logo">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeId = useRef<string | null>(null);

  const filtered = items.filter((b) => {
    if (filter === "popular") return b.isPopular;
    if (filter === "no-logo") return !b.logoUrl;
    return true;
  });

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const id = activeId.current;
    if (!file || !id) return;

    setUploading(id);
    setError(null);
    setSuccess(null);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "brands");
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: form });
      const uploadJson = await uploadRes.json();
      if (!uploadJson.success) throw new Error(uploadJson.error ?? "Upload failed");

      const updateRes = await fetch(`/api/admin/brands/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: uploadJson.url }),
      });
      const updateJson = await updateRes.json();
      if (!updateJson.success) throw new Error(updateJson.error ?? "Update failed");

      setItems((prev) =>
        prev.map((b) => (b.id === id ? { ...b, logoUrl: uploadJson.url } : b))
      );
      setSuccess(id);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUploading(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function openPicker(id: string) {
    activeId.current = id;
    fileInputRef.current?.click();
  }

  async function removeLogo(id: string) {
    setUploading(id);
    try {
      const res = await fetch(`/api/admin/brands/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: null }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setItems((prev) => prev.map((b) => (b.id === id ? { ...b, logoUrl: null } : b)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setUploading(null);
    }
  }

  async function togglePopular(id: string, current: boolean) {
    try {
      const res = await fetch(`/api/admin/brands/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPopular: !current }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setItems((prev) => prev.map((b) => (b.id === id ? { ...b, isPopular: !current } : b)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  }

  const logoCount = items.filter((b) => b.logoUrl).length;
  const popularCount = items.filter((b) => b.isPopular).length;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Stats + filter */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2 text-xs text-gray-500">
          <span className="bg-dark-card px-3 py-1.5 rounded-full border border-dark-border">
            {items.length} total
          </span>
          <span className="bg-dark-card px-3 py-1.5 rounded-full border border-dark-border">
            {logoCount} with logos
          </span>
          <span className="bg-dark-card px-3 py-1.5 rounded-full border border-dark-border">
            {items.length - logoCount} missing logos
          </span>
        </div>

        <div className="ml-auto flex gap-1.5">
          {(["all", "popular", "no-logo"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full border transition-colors",
                filter === f
                  ? "bg-brand-orange text-white border-brand-orange"
                  : "border-dark-border text-gray-400 hover:text-white"
              )}
            >
              {f === "all" ? "All" : f === "popular" ? `★ Popular (${popularCount})` : "Missing Logo"}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map((brand) => {
          const isUploading = uploading === brand.id;
          const isSuccess = success === brand.id;

          return (
            <div key={brand.id} className="card overflow-hidden group relative">
              {/* Logo area */}
              <div className="relative aspect-[3/2] bg-dark-secondary overflow-hidden flex items-center justify-center p-4">
                {brand.logoUrl ? (
                  <Image
                    src={brand.logoUrl}
                    alt={brand.name}
                    fill
                    className="object-contain p-4"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-dark-input flex items-center justify-center mx-auto mb-1">
                      <span className="text-lg font-bold text-gray-500">
                        {brand.name[0]}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-600">No logo</p>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => openPicker(brand.id)}
                    disabled={isUploading}
                    className="w-9 h-9 rounded-full bg-brand-orange flex items-center justify-center hover:bg-brand-orange/80"
                    title="Upload logo"
                  >
                    {isUploading ? (
                      <Loader2 size={14} className="animate-spin text-white" />
                    ) : isSuccess ? (
                      <Check size={14} className="text-white" />
                    ) : (
                      <Camera size={14} className="text-white" />
                    )}
                  </button>
                  {brand.logoUrl && (
                    <button
                      onClick={() => removeLogo(brand.id)}
                      disabled={isUploading}
                      className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-500"
                    >
                      <X size={13} className="text-white" />
                    </button>
                  )}
                </div>

                {/* Popular star */}
                <button
                  onClick={() => togglePopular(brand.id, brand.isPopular)}
                  className={cn(
                    "absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-colors z-10",
                    brand.isPopular
                      ? "bg-brand-orange text-white"
                      : "bg-black/40 text-gray-500 hover:text-brand-orange"
                  )}
                  title={brand.isPopular ? "Remove from popular" : "Mark as popular"}
                >
                  <Star size={10} fill={brand.isPopular ? "currentColor" : "none"} />
                </button>

                {/* Success badge */}
                {isSuccess && (
                  <div className="absolute top-1.5 right-1.5 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 z-10">
                    <Check size={8} /> Saved
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-sm font-semibold text-white truncate">{brand.name}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{brand.country ?? "—"}</p>
                <button
                  onClick={() => openPicker(brand.id)}
                  disabled={isUploading}
                  className={cn(
                    "mt-2 w-full text-xs py-1.5 rounded-md font-medium transition-colors",
                    isUploading
                      ? "bg-dark-secondary text-gray-500 cursor-not-allowed"
                      : brand.logoUrl
                      ? "bg-dark-secondary text-gray-300 hover:bg-brand-orange/20 hover:text-brand-orange"
                      : "bg-brand-orange text-white hover:bg-brand-orange/80"
                  )}
                >
                  {isUploading ? "Uploading…" : brand.logoUrl ? "Change Logo" : "Upload Logo"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No brands match this filter.
        </div>
      )}
    </>
  );
}
