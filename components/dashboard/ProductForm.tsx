"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save, X, Upload, Plus, Loader2, ImageIcon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SERVICE_CATEGORIES, CAR_BODY_TYPES } from "@/lib/listing-types";
import type { ListingType } from "@/lib/listing-types";
import { VinDecoder } from "@/components/ui/VinDecoder";

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
  listingType?: ListingType;
  images?: Array<{ id?: string; url: string; isPrimary?: boolean }>;
}

interface Props {
  categories:  Category[];
  product?:    ProductData;
  storeId:     string;
  listingType?: ListingType;
}

interface ImageSlot { url: string; uploading: boolean; }

const CONDITIONS  = ["NEW", "LIKE_NEW", "USED"];
const CAR_MAKES   = ["Toyota","Nissan","BMW","Mercedes-Benz","Lexus","Honda","KIA","Hyundai","Ford","Chevrolet","Audi","Volkswagen","Land Rover","Porsche","Mitsubishi","Other"];
const TRANSMISSIONS = ["Automatic", "Manual", "CVT"];
const FUELS         = ["Petrol", "Diesel", "Hybrid", "Electric", "Other"];
const COLORS        = ["White","Black","Silver","Grey","Red","Blue","Green","Brown","Beige","Gold","Other"];
const PRICING_MODELS = [
  { id: "fixed",  label: "Fixed Price" },
  { id: "hourly", label: "Hourly Rate" },
  { id: "quote",  label: "Request a Quote" },
];

export function ProductForm({ categories, product, storeId, listingType: ltProp }: Props) {
  const router = useRouter();
  const type: ListingType = ltProp ?? product?.listingType ?? "PART";
  const isEdit = !!product?.id;

  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [slots, setSlots] = useState<ImageSlot[]>(
    product?.images?.length
      ? product.images.map((i) => ({ url: i.url, uploading: false }))
      : [{ url: "", uploading: false }]
  );

  // Shared fields
  const [form, setForm] = useState({
    title:         product?.title         ?? "",
    description:   product?.description   ?? "",
    price:         product?.price         ?? "",
    originalPrice: product?.originalPrice ?? "",
    condition:     product?.condition     ?? "NEW",
    brand:         product?.brand         ?? "",        // service slug | body slug | part brand
    partNumber:    product?.partNumber    ?? "",
    carMake:       product?.carMake       ?? "",
    carModel:      product?.carModel      ?? "",
    carYear:       product?.carYear       ?? "",
    carYearTo:     product?.carYearTo     ?? "",
    categoryId:    product?.categoryId    ?? (categories[0]?.id ?? ""),
    isActive:      product?.isActive      ?? true,
    isFeatured:    product?.isFeatured    ?? false,
    // SERVICE-specific
    pricingModel:  "fixed",
    // CAR-specific
    mileage:       "",
    transmission:  "Automatic",
    fuelType:      "Petrol",
    color:         "White",
    bodyType:      "sedan",     // stored in `brand` col
  });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  // ── File upload ──
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  async function uploadFile(file: File, idx: number) {
    setSlots((prev) => prev.map((s, i) => i === idx ? { ...s, uploading: true } : s));
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res  = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Upload failed");
      setSlots((prev) => prev.map((s, i) => i === idx ? { url: json.url, uploading: false } : s));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setSlots((prev) => prev.map((s, i) => i === idx ? { ...s, uploading: false } : s));
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file, idx);
    e.target.value = "";
  }

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const images = slots
      .filter((s) => s.url.trim())
      .map((s, i) => ({ url: s.url, isPrimary: i === 0, sortOrder: i }));

    const slug = form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").substring(0, 80)
      + (isEdit ? "" : `-${Date.now()}`);

    // Build brand + category based on listing type
    let brandValue    = form.brand;
    let categoryIdVal = form.categoryId;

    if (type === "SERVICE") {
      brandValue    = form.brand;     // service slug
      categoryIdVal = categories[0]?.id ?? form.categoryId;
    } else if (type === "CAR") {
      brandValue    = form.bodyType;  // body type slug
      categoryIdVal = categories[0]?.id ?? form.categoryId;
    }

    // For CAR listings, append vehicle specs to description since no dedicated DB columns exist
    let descriptionValue = form.description;
    if (type === "CAR") {
      const specs = [
        form.mileage      && `Mileage: ${parseInt(String(form.mileage)).toLocaleString()} km`,
        form.transmission && `Transmission: ${form.transmission}`,
        form.fuelType     && `Fuel Type: ${form.fuelType}`,
        form.color        && `Color: ${form.color}`,
      ].filter(Boolean).join(" · ");
      if (specs) {
        descriptionValue = form.description
          ? `${form.description}\n\n📋 ${specs}`
          : `📋 ${specs}`;
      }
    }

    const payload = {
      storeId,
      listingType: type,
      title:         form.title,
      description:   descriptionValue,
      slug,
      price:         form.pricingModel === "quote" ? 0 : parseFloat(String(form.price)) || 0,
      originalPrice: form.originalPrice ? parseFloat(String(form.originalPrice)) : null,
      condition:     type === "SERVICE" ? "NEW" : form.condition,
      brand:         brandValue,
      partNumber:    type === "PART" ? form.partNumber : null,
      carMake:       type === "CAR" ? form.carMake : null,
      carModel:      type === "CAR" ? form.carModel : null,
      carYear:       type === "CAR" && form.carYear ? parseInt(String(form.carYear)) : (type === "PART" && form.carYear ? parseInt(String(form.carYear)) : null),
      carYearTo:     type === "CAR" && form.carYearTo ? parseInt(String(form.carYearTo)) : (type === "PART" && form.carYearTo ? parseInt(String(form.carYearTo)) : null),
      categoryId:    categoryIdVal,
      isActive:      form.isActive,
      isFeatured:    form.isFeatured,
      images,
    };

    try {
      const url    = isEdit ? `/api/dashboard/products/${product!.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";
      const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data   = await res.json();
      if (!data.success) throw new Error(data.error ?? "Failed to save listing");
      if (isEdit) {
        router.push("/dashboard/products");
        router.refresh();
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen (new listing only) ──
  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-6">
        <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-green-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Listing Submitted!</h2>
        <p className="text-gray-400 text-[14px] leading-relaxed mb-2">
          Your listing has been submitted and is <span className="text-yellow-400 font-semibold">pending review</span> by our team.
        </p>
        <p className="text-gray-500 text-[13px] mb-8">
          Most listings are approved within a few hours. You&apos;ll be able to see the status in your products list.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push("/dashboard/products/new")}
            className="px-5 py-2.5 rounded-xl bg-brand-orange text-white font-bold text-[13px] hover:bg-[#e64d00] transition-colors"
          >
            + Add Another Listing
          </button>
          <button
            onClick={() => { router.push("/dashboard/products"); router.refresh(); }}
            className="px-5 py-2.5 rounded-xl bg-dark-card border border-dark-border text-gray-300 font-semibold text-[13px] hover:text-white transition-colors"
          >
            View My Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && (
        <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <X size={14} /> {error}
        </div>
      )}

      {/* ── SERVICE FORM ── */}
      {type === "SERVICE" && (
        <>
          <div className="card p-6 space-y-4">
            <h2 className="text-[15px] font-bold text-white">Service Information</h2>

            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Service Title *</label>
              <input className="input w-full" placeholder="e.g. Professional Oil Change + Filter"
                value={form.title} onChange={(e) => set("title", e.target.value)} required />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-2">Service Category *</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {SERVICE_CATEGORIES.map((s) => (
                  <button
                    key={s.slug}
                    type="button"
                    onClick={() => set("brand", s.slug)}
                    className={cn(
                      "py-2 px-3 rounded-lg border text-[11px] font-semibold text-center transition-all",
                      form.brand === s.slug
                        ? "bg-brand-orange border-brand-orange text-white"
                        : "border-dark-border text-gray-400 hover:border-brand-orange hover:text-white"
                    )}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Description *</label>
              <textarea className="input w-full min-h-[100px] resize-y"
                placeholder="Describe your service, what's included, turnaround time..."
                value={form.description} onChange={(e) => set("description", e.target.value)} required />
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="text-[15px] font-bold text-white">Pricing</h2>
            <div className="flex gap-3">
              {PRICING_MODELS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => set("pricingModel", m.id)}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg border text-[12px] font-semibold transition-all",
                    form.pricingModel === m.id
                      ? "bg-brand-orange border-brand-orange text-white"
                      : "border-dark-border text-gray-400 hover:border-brand-orange"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
            {form.pricingModel !== "quote" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">
                    {form.pricingModel === "hourly" ? "Rate (QAR/hr)" : "Price (QAR)"} *
                  </label>
                  <input type="number" min="0" step="0.01" className="input w-full" placeholder="0.00"
                    value={form.price} onChange={(e) => set("price", e.target.value)} required />
                </div>
              </div>
            )}
            {form.pricingModel === "quote" && (
              <p className="text-[12px] text-gray-500 bg-dark-input rounded-lg px-3 py-2.5">
                Buyers will contact you for a custom quote. Price will be shown as "Request Quote".
              </p>
            )}
          </div>
        </>
      )}

      {/* ── CAR FORM ── */}
      {type === "CAR" && (
        <>
          <VinDecoder
            onDecoded={(v) => {
              if (v.make)  set("carMake",  v.make);
              if (v.model) set("carModel", v.model);
              if (v.year)  set("carYear",  v.year);
              if (v.transmission) set("transmission", v.transmission.includes("Manual") ? "Manual" : "Automatic");
              if (v.fuelType) set("fuel", v.fuelType.toLowerCase().includes("electric") ? "Electric" : v.fuelType.toLowerCase().includes("diesel") ? "Diesel" : v.fuelType.toLowerCase().includes("hybrid") ? "Hybrid" : "Petrol");
            }}
          />
          <div className="card p-6 space-y-4">
            <h2 className="text-[15px] font-bold text-white">Vehicle Information</h2>

            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Listing Title *</label>
              <input className="input w-full" placeholder="e.g. 2021 Toyota Land Cruiser GXR — Full Option"
                value={form.title} onChange={(e) => set("title", e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Make *</label>
                <select className="input w-full" value={form.carMake} onChange={(e) => set("carMake", e.target.value)} required>
                  <option value="">Select make</option>
                  {CAR_MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Model *</label>
                <input className="input w-full" placeholder="e.g. Land Cruiser, Patrol"
                  value={form.carModel} onChange={(e) => set("carModel", e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Year *</label>
                <input type="number" min="1990" max="2026" className="input w-full" placeholder="2021"
                  value={form.carYear} onChange={(e) => set("carYear", e.target.value)} required />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Mileage (km)</label>
                <input type="number" min="0" className="input w-full" placeholder="e.g. 45000"
                  value={form.mileage} onChange={(e) => set("mileage", e.target.value)} />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Condition *</label>
                <select className="input w-full" value={form.condition} onChange={(e) => set("condition", e.target.value)}>
                  <option value="NEW">New</option>
                  <option value="LIKE_NEW">Like New</option>
                  <option value="USED">Used</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Transmission</label>
                <select className="input w-full" value={form.transmission} onChange={(e) => set("transmission", e.target.value)}>
                  {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Fuel Type</label>
                <select className="input w-full" value={form.fuelType} onChange={(e) => set("fuelType", e.target.value)}>
                  {FUELS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Color</label>
                <select className="input w-full" value={form.color} onChange={(e) => set("color", e.target.value)}>
                  {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Body Type</label>
                <select className="input w-full" value={form.bodyType} onChange={(e) => set("bodyType", e.target.value)}>
                  {CAR_BODY_TYPES.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Description</label>
              <textarea className="input w-full min-h-[100px] resize-y"
                placeholder="Describe the vehicle — features, history, why you're selling..."
                value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="text-[15px] font-bold text-white">Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Asking Price (QAR) *</label>
                <input type="number" min="0" step="1" className="input w-full" placeholder="0"
                  value={form.price} onChange={(e) => set("price", e.target.value)} required />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Original Price (optional)</label>
                <input type="number" min="0" step="1" className="input w-full" placeholder="0"
                  value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── PART FORM ── */}
      {type === "PART" && (
        <>
          <div className="card p-6 space-y-4">
            <h2 className="text-[15px] font-bold text-white">Product Information</h2>

            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Title *</label>
              <input className="input w-full" placeholder="e.g. Toyota Land Cruiser AC Compressor 2016-2020"
                value={form.title} onChange={(e) => set("title", e.target.value)} required />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Description</label>
              <textarea className="input w-full min-h-[100px] resize-y"
                placeholder="Describe the part, its condition, and compatibility..."
                value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Category *</label>
                <select className="input w-full" value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} required>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Condition *</label>
                <select className="input w-full" value={form.condition} onChange={(e) => set("condition", e.target.value)}>
                  {CONDITIONS.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="text-[15px] font-bold text-white">Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Price (QAR) *</label>
                <input type="number" min="0" step="0.01" className="input w-full" placeholder="0.00"
                  value={form.price} onChange={(e) => set("price", e.target.value)} required />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Original Price (optional)</label>
                <input type="number" min="0" step="0.01" className="input w-full" placeholder="0.00"
                  value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="text-[15px] font-bold text-white">Vehicle Compatibility</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Brand</label>
                <input className="input w-full" placeholder="e.g. Toyota, Bosch" value={form.brand} onChange={(e) => set("brand", e.target.value)} />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Part Number</label>
                <input className="input w-full" placeholder="e.g. 88320-6A320" value={form.partNumber} onChange={(e) => set("partNumber", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Car Make</label>
                <select className="input w-full" value={form.carMake} onChange={(e) => set("carMake", e.target.value)}>
                  <option value="">Any make</option>
                  {CAR_MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Car Model</label>
                <input className="input w-full" placeholder="e.g. Land Cruiser, Patrol" value={form.carModel} onChange={(e) => set("carModel", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Year From</label>
                <input type="number" min="1990" max="2030" className="input w-full" placeholder="2016"
                  value={form.carYear} onChange={(e) => set("carYear", e.target.value)} />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Year To</label>
                <input type="number" min="1990" max="2030" className="input w-full" placeholder="2022"
                  value={form.carYearTo} onChange={(e) => set("carYearTo", e.target.value)} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Photos (shared) ── */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-white">
            {type === "SERVICE" ? "Service Photos" : type === "CAR" ? "Vehicle Photos" : "Product Photos"}
          </h2>
          <span className="text-[11px] text-gray-500">First photo = main image · Max 6</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {slots.map((slot, idx) => (
            <div key={idx} className="relative group">
              <input
                ref={(el) => { fileInputRefs.current[idx] = el; }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, idx)}
              />
              <div
                onClick={() => !slot.uploading && fileInputRefs.current[idx]?.click()}
                className={cn(
                  "aspect-square rounded-xl border-2 overflow-hidden cursor-pointer transition-all",
                  slot.url
                    ? "border-dark-border hover:border-brand-orange"
                    : "border-dashed border-dark-border hover:border-brand-orange hover:bg-brand-orange/5"
                )}
              >
                {slot.uploading ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-brand-orange">
                    <Loader2 size={22} className="animate-spin" />
                    <span className="text-[11px]">Uploading…</span>
                  </div>
                ) : slot.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={slot.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-600">
                    <ImageIcon size={22} />
                    <span className="text-[11px]">{idx === 0 ? "Main photo" : `Photo ${idx + 1}`}</span>
                    <div className="flex items-center gap-1 text-[10px] text-brand-orange">
                      <Upload size={10} /> Click to upload
                    </div>
                  </div>
                )}
              </div>
              {slot.url && !slot.uploading && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSlots((prev) => prev.filter((_, i) => i !== idx)); }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 hover:bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={11} />
                </button>
              )}
              {idx === 0 && (
                <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-orange text-white">MAIN</span>
              )}
            </div>
          ))}

          {slots.length < 6 && (
            <button
              type="button"
              onClick={() => setSlots((prev) => [...prev, { url: "", uploading: false }])}
              className="aspect-square rounded-xl border-2 border-dashed border-dark-border hover:border-brand-orange hover:bg-brand-orange/5 transition-all flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-brand-orange"
            >
              <Plus size={22} />
              <span className="text-[11px]">Add photo</span>
            </button>
          )}
        </div>
        <p className="text-[11px] text-gray-600">JPG, PNG, WebP · Max 5 MB each</p>
      </div>

      {/* ── Visibility (shared) ── */}
      <div className="card p-6">
        <h2 className="text-[15px] font-bold text-white mb-4">Visibility</h2>
        <div className="space-y-3">
          {([
            { key: "isActive",   label: "Active",   sub: "Listing is visible to buyers" },
            { key: "isFeatured", label: "Featured", sub: "Show in Featured Listings section" },
          ] as const).map(({ key, label, sub }) => (
            <label key={key} className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-[13px] font-medium text-white">{label}</p>
                <p className="text-[11px] text-gray-500">{sub}</p>
              </div>
              <div
                onClick={() => set(key, !form[key])}
                className={cn("w-10 h-5 rounded-full transition-colors relative cursor-pointer",
                  form[key] ? "bg-brand-orange" : "bg-dark-input")}
              >
                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                  form[key] ? "translate-x-5" : "translate-x-0.5")} />
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading || slots.some((s) => s.uploading)} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {loading ? "Saving…" : isEdit ? "Save Changes" : "Publish Listing"}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl bg-dark-card text-gray-400 hover:text-white text-[13px] font-semibold transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
