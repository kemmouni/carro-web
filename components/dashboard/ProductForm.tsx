"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X, Upload, Plus, Trash2 } from "lucide-react";

interface Category { id: string; name: string; }
interface ProductData {
  id?: string;
  title?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  condition?: string;
  brand?: string;
  partNumber?: string;
  carMake?: string;
  carModel?: string;
  carYear?: number;
  carYearTo?: number;
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  images?: Array<{ id?: string; url: string; isPrimary?: boolean }>;
}

interface Props {
  categories: Category[];
  product?: ProductData;
  storeId: string;
}

const CONDITIONS = ["NEW", "LIKE_NEW", "USED"];
const CAR_MAKES  = ["Toyota", "Nissan", "BMW", "Mercedes-Benz", "Lexus", "Honda", "KIA", "Hyundai", "Ford", "Chevrolet", "Audi", "Volkswagen", "Other"];

export function ProductForm({ categories, product, storeId }: Props) {
  const router = useRouter();
  const isEdit = !!product?.id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>(
    product?.images?.map(i => i.url) ?? [""]
  );

  const [form, setForm] = useState({
    title:         product?.title         ?? "",
    description:   product?.description   ?? "",
    price:         product?.price         ?? "",
    originalPrice: product?.originalPrice ?? "",
    condition:     product?.condition     ?? "NEW",
    brand:         product?.brand         ?? "",
    partNumber:    product?.partNumber    ?? "",
    carMake:       product?.carMake       ?? "",
    carModel:      product?.carModel      ?? "",
    carYear:       product?.carYear       ?? "",
    carYearTo:     product?.carYearTo     ?? "",
    categoryId:    product?.categoryId    ?? (categories[0]?.id ?? ""),
    isActive:      product?.isActive      ?? true,
    isFeatured:    product?.isFeatured    ?? false,
  });

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const images = imageUrls.filter(u => u.trim()).map((url, i) => ({
      url, isPrimary: i === 0, sortOrder: i,
    }));

    const slug = form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").substring(0, 80)
      + (isEdit ? "" : `-${Date.now()}`);

    const payload = {
      storeId,
      ...form,
      slug,
      price:         parseFloat(String(form.price)),
      originalPrice: form.originalPrice ? parseFloat(String(form.originalPrice)) : null,
      carYear:       form.carYear   ? parseInt(String(form.carYear))   : null,
      carYearTo:     form.carYearTo ? parseInt(String(form.carYearTo)) : null,
      images,
    };

    try {
      const url    = isEdit ? `/api/dashboard/products/${product!.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Failed to save product");
      router.push("/dashboard/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && (
        <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <X size={14} /> {error}
        </div>
      )}

      {/* Basic info */}
      <div className="card p-6 space-y-4">
        <h2 className="text-[15px] font-bold text-white">Product Information</h2>

        <div>
          <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Title *</label>
          <input
            className="input w-full"
            placeholder="e.g. Toyota Land Cruiser AC Compressor 2016-2020"
            value={form.title}
            onChange={e => set("title", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Description</label>
          <textarea
            className="input w-full min-h-[100px] resize-y"
            placeholder="Describe the part, its condition, and compatibility..."
            value={form.description}
            onChange={e => set("description", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Category *</label>
            <select className="input w-full" value={form.categoryId} onChange={e => set("categoryId", e.target.value)} required>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Condition *</label>
            <select className="input w-full" value={form.condition} onChange={e => set("condition", e.target.value)}>
              {CONDITIONS.map(c => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="card p-6 space-y-4">
        <h2 className="text-[15px] font-bold text-white">Pricing</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Price (QAR) *</label>
            <input type="number" min="0" step="0.01" className="input w-full" placeholder="0.00" value={form.price} onChange={e => set("price", e.target.value)} required />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Original Price (optional)</label>
            <input type="number" min="0" step="0.01" className="input w-full" placeholder="0.00" value={form.originalPrice} onChange={e => set("originalPrice", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Vehicle compatibility */}
      <div className="card p-6 space-y-4">
        <h2 className="text-[15px] font-bold text-white">Vehicle Compatibility</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Brand</label>
            <input className="input w-full" placeholder="e.g. Toyota, Bosch" value={form.brand} onChange={e => set("brand", e.target.value)} />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Part Number</label>
            <input className="input w-full" placeholder="e.g. 88320-6A320" value={form.partNumber} onChange={e => set("partNumber", e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Car Make</label>
            <select className="input w-full" value={form.carMake} onChange={e => set("carMake", e.target.value)}>
              <option value="">Any make</option>
              {CAR_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Car Model</label>
            <input className="input w-full" placeholder="e.g. Land Cruiser, Patrol" value={form.carModel} onChange={e => set("carModel", e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Year From</label>
            <input type="number" min="1990" max="2030" className="input w-full" placeholder="e.g. 2016" value={form.carYear} onChange={e => set("carYear", e.target.value)} />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Year To</label>
            <input type="number" min="1990" max="2030" className="input w-full" placeholder="e.g. 2022" value={form.carYearTo} onChange={e => set("carYearTo", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="card p-6 space-y-4">
        <h2 className="text-[15px] font-bold text-white">Product Images</h2>
        <p className="text-[12px] text-gray-500">Add image URLs (first image will be the main photo)</p>
        <div className="space-y-2">
          {imageUrls.map((url, i) => (
            <div key={i} className="flex gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-dark-input flex-shrink-0">
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="w-full h-full object-cover rounded-lg" onError={e => (e.currentTarget.style.display = 'none')} />
                ) : (
                  <Upload size={14} className="text-gray-600" />
                )}
              </div>
              <input
                className="input flex-1 text-sm"
                placeholder={i === 0 ? "Main image URL (required)" : `Image ${i + 1} URL`}
                value={url}
                onChange={e => {
                  const updated = [...imageUrls];
                  updated[i] = e.target.value;
                  setImageUrls(updated);
                }}
              />
              {imageUrls.length > 1 && (
                <button type="button" onClick={() => setImageUrls(imageUrls.filter((_, j) => j !== i))} className="p-2 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          {imageUrls.length < 6 && (
            <button type="button" onClick={() => setImageUrls([...imageUrls, ""])} className="flex items-center gap-2 text-[12px] text-brand-orange hover:text-brand-orange-hover transition-colors mt-1">
              <Plus size={13} /> Add another image
            </button>
          )}
        </div>
      </div>

      {/* Toggles */}
      <div className="card p-6">
        <h2 className="text-[15px] font-bold text-white mb-4">Visibility</h2>
        <div className="space-y-3">
          {[
            { key: "isActive",   label: "Active",   sub: "Product is visible to buyers" },
            { key: "isFeatured", label: "Featured", sub: "Show in Featured Products section" },
          ].map(({ key, label, sub }) => (
            <label key={key} className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-[13px] font-medium text-white">{label}</p>
                <p className="text-[11px] text-gray-500">{sub}</p>
              </div>
              <div
                onClick={() => set(key, !(form as Record<string, unknown>)[key])}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${(form as Record<string, unknown>)[key] ? "bg-brand-orange" : "bg-dark-input"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${(form as Record<string, unknown>)[key] ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
          <Save size={16} />
          {loading ? "Saving…" : isEdit ? "Save Changes" : "Publish Product"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-xl bg-dark-card text-gray-400 hover:text-white text-[13px] font-semibold transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
