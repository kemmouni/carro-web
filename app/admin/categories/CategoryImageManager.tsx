"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  description?: string | null;
  sortOrder: number;
}

export default function CategoryImageManager({ categories }: { categories: Category[] }) {
  const [items, setItems] = useState<Category[]>(categories);
  const [uploading, setUploading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeId = useRef<string | null>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const id = activeId.current;
    if (!file || !id) return;

    setUploading(id);
    setError(null);
    setSuccess(null);

    try {
      // 1. Upload image
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "categories");
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: form });
      const uploadJson = await uploadRes.json();
      if (!uploadJson.success) throw new Error(uploadJson.error ?? "Upload failed");

      // 2. Save URL to category
      const updateRes = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: uploadJson.url }),
      });
      const updateJson = await updateRes.json();
      if (!updateJson.success) throw new Error(updateJson.error ?? "Update failed");

      setItems((prev) =>
        prev.map((c) => (c.id === id ? { ...c, imageUrl: uploadJson.url } : c))
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

  async function removeImage(id: string) {
    setUploading(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: null }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setItems((prev) => prev.map((c) => (c.id === id ? { ...c, imageUrl: null } : c)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setUploading(null);
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((cat) => {
          const isUploading = uploading === cat.id;
          const isSuccess = success === cat.id;

          return (
            <div
              key={cat.id}
              className="card overflow-hidden group relative"
            >
              {/* Image area */}
              <div className="relative aspect-[4/3] bg-dark-secondary overflow-hidden">
                {cat.imageUrl ? (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl text-gray-600">🖼️</span>
                  </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => openPicker(cat.id)}
                    disabled={isUploading}
                    className="w-9 h-9 rounded-full bg-brand-orange flex items-center justify-center hover:bg-brand-orange/80 transition-colors"
                    title="Upload image"
                  >
                    {isUploading ? (
                      <Loader2 size={15} className="animate-spin text-white" />
                    ) : isSuccess ? (
                      <Check size={15} className="text-white" />
                    ) : (
                      <Camera size={15} className="text-white" />
                    )}
                  </button>
                  {cat.imageUrl && (
                    <button
                      onClick={() => removeImage(cat.id)}
                      disabled={isUploading}
                      className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-500 transition-colors"
                      title="Remove image"
                    >
                      <X size={14} className="text-white" />
                    </button>
                  )}
                </div>

                {/* Status badges */}
                {isSuccess && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check size={10} /> Saved
                  </div>
                )}
                {cat.imageUrl && !isSuccess && (
                  <div className="absolute top-2 right-2 bg-green-500/20 text-green-400 text-xs px-1.5 py-0.5 rounded-full">
                    ✓
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-sm font-semibold text-white truncate">{cat.name}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">/{cat.slug}</p>
                <button
                  onClick={() => openPicker(cat.id)}
                  disabled={isUploading}
                  className={cn(
                    "mt-2 w-full text-xs py-1.5 rounded-md font-medium transition-colors",
                    isUploading
                      ? "bg-dark-secondary text-gray-500 cursor-not-allowed"
                      : cat.imageUrl
                      ? "bg-dark-secondary text-gray-300 hover:bg-brand-orange/20 hover:text-brand-orange"
                      : "bg-brand-orange text-white hover:bg-brand-orange/80"
                  )}
                >
                  {isUploading ? "Uploading…" : cat.imageUrl ? "Change Image" : "Upload Image"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
