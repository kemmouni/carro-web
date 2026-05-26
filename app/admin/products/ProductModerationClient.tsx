"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  CheckCircle, XCircle, Star, StarOff, Trash2, Package,
  Search, Eye, ExternalLink, Pencil, X,
} from "lucide-react";
import { toast } from "sonner";

interface AdminProduct {
  id: string;
  title: string;
  price: number;
  currency?: string | null;
  condition: string;
  brand?: string | null;
  carMake?: string | null;
  carModel?: string | null;
  description?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  approvalStatus: string;
  listingType?: string | null;
  createdAt: string;
  category: { id?: string; name: string; slug?: string } | null;
  store: { id: string; name: string; slug: string } | null;
  images: Array<{ url: string; isPrimary: boolean; sortOrder: number }>;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:  "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  ACTIVE:   "bg-green-500/15 text-green-400 border border-green-500/30",
  REJECTED: "bg-red-500/15 text-red-400 border border-red-500/30",
};

const TYPE_COLORS: Record<string, string> = {
  PART:    "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  SERVICE: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
  CAR:     "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
};

const CONDITIONS = [
  { value: "NEW", label: "New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "USED", label: "Used" },
];

type StatusFilter = "ALL" | "PENDING" | "ACTIVE" | "REJECTED";
type TypeFilter = "ALL" | "PART" | "SERVICE" | "CAR";

export default function ProductModerationClient({
  initialProducts,
}: {
  initialProducts: AdminProduct[];
}) {
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [editing, setEditing] = useState<AdminProduct | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.store?.name.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchStatus = filter === "ALL" || p.approvalStatus === filter;
      const matchType = typeFilter === "ALL"
        || (typeFilter === "PART" && (p.listingType === "PART" || !p.listingType))
        || p.listingType === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [products, search, filter, typeFilter]);

  async function action(id: string, act: string, extra?: Record<string, unknown>) {
    setLoading(id + act);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: act, ...extra }),
      });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...json.data } : p))
        );
      }
    } finally {
      setLoading(null);
    }
  }

  async function saveEdit(patch: Partial<AdminProduct>) {
    if (!editing) return;
    setLoading(editing.id + "edit");
    try {
      const res = await fetch(`/api/admin/products/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", fields: patch }),
      });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editing.id ? { ...p, ...patch } : p))
        );
        setEditing(null);
      } else {
        toast.error(json.error || "Update failed");
      }
    } finally {
      setLoading(null);
    }
  }

  async function deleteProduct(id: string) {
    if (!window.confirm("Delete this product permanently? This cannot be undone.")) return;
    setLoading(id + "delete");
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) setProducts((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setLoading(null);
    }
  }

  async function submitReject() {
    if (!rejectId) return;
    await action(rejectId, "reject", rejectReason ? { reason: rejectReason } : {});
    setRejectId(null);
    setRejectReason("");
  }

  const statusCounts = {
    ALL:      products.length,
    PENDING:  products.filter((p) => p.approvalStatus === "PENDING").length,
    ACTIVE:   products.filter((p) => p.approvalStatus === "ACTIVE").length,
    REJECTED: products.filter((p) => p.approvalStatus === "REJECTED").length,
  };

  const typeCounts = {
    ALL:     products.length,
    PART:    products.filter((p) => p.listingType === "PART" || !p.listingType).length,
    SERVICE: products.filter((p) => p.listingType === "SERVICE").length,
    CAR:     products.filter((p) => p.listingType === "CAR").length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Product Moderation</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Approve, reject, edit, or delete any listing — parts, services, and cars.
        </p>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {(["ALL", "PART", "SERVICE", "CAR"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
              typeFilter === t
                ? "bg-brand-orange text-white"
                : "bg-dark-secondary text-gray-400 hover:text-white"
            }`}
          >
            {t === "ALL" ? "All Types" : t === "PART" ? "Parts" : t === "SERVICE" ? "Services" : "Cars"}
            <span className="ml-1 text-[11px] opacity-70">({typeCounts[t]})</span>
          </button>
        ))}
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(["ALL", "PENDING", "ACTIVE", "REJECTED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
              filter === f
                ? "bg-white/10 text-white border border-white/20"
                : "bg-dark-secondary text-gray-500 hover:text-white"
            }`}
          >
            {f}
            <span className="ml-1 text-[10px] opacity-70">({statusCounts[f]})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or store…"
          className="w-full bg-dark-secondary border border-dark-border rounded-lg pl-9 pr-4 py-2.5 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center py-20 text-center">
          <Package size={48} className="text-gray-600 mb-4" />
          <p className="text-lg font-bold text-white mb-1">No products found</p>
          <p className="text-gray-500 text-sm">Try changing your filters.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Product</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5 hidden md:table-cell">Type</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5 hidden md:table-cell">Store</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5">Price</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filtered.map((p) => {
                const img = p.images?.sort((a, b) => a.sortOrder - b.sortOrder)[0]?.url;
                const isLoading = (act: string) => loading === p.id + act;
                const ptype = p.listingType || "PART";
                return (
                  <tr key={p.id} className="hover:bg-dark-secondary/40 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-dark-input flex-shrink-0 overflow-hidden">
                          {img ? (
                            <Image src={img} alt="" width={44} height={44} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={14} className="text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-white max-w-[220px] truncate">{p.title}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {new Date(p.createdAt).toLocaleDateString()}
                            {p.isFeatured && <span className="ml-2 text-yellow-400">⭐ Featured</span>}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${TYPE_COLORS[ptype] ?? ""}`}>
                        {ptype}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-[12px] text-gray-400">{p.store?.name ?? "—"}</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-[13px] font-bold text-brand-orange">{p.price.toLocaleString()} {p.currency ?? "QAR"}</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[p.approvalStatus] ?? ""}`}>
                        {p.approvalStatus}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <a href={`/product/${p.id}`} target="_blank" className="p-1.5 rounded-lg hover:bg-dark-input text-gray-500 hover:text-white transition-colors" title="View">
                          <Eye size={13} />
                        </a>

                        <button onClick={() => setEditing(p)} title="Edit fields"
                          className="p-1.5 rounded-lg hover:bg-brand-orange/20 text-gray-500 hover:text-brand-orange transition-colors">
                          <Pencil size={13} />
                        </button>

                        {p.approvalStatus !== "ACTIVE" && (
                          <button onClick={() => action(p.id, "approve")} disabled={!!loading} title="Approve"
                            className="p-1.5 rounded-lg hover:bg-green-500/20 text-gray-500 hover:text-green-400 transition-colors disabled:opacity-40">
                            {isLoading("approve") ? "…" : <CheckCircle size={13} />}
                          </button>
                        )}

                        {p.approvalStatus !== "REJECTED" && (
                          <button onClick={() => { setRejectId(p.id); setRejectReason(""); }} disabled={!!loading} title="Reject"
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors disabled:opacity-40">
                            <XCircle size={13} />
                          </button>
                        )}

                        <button onClick={() => action(p.id, p.isFeatured ? "unfeature" : "feature")} disabled={!!loading} title={p.isFeatured ? "Unfeature" : "Feature"}
                          className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                            p.isFeatured
                              ? "hover:bg-yellow-500/20 text-yellow-400 hover:text-yellow-300"
                              : "hover:bg-yellow-500/20 text-gray-500 hover:text-yellow-400"
                          }`}>
                          {isLoading("feature") || isLoading("unfeature") ? "…" : p.isFeatured ? <Star size={13} /> : <StarOff size={13} />}
                        </button>

                        <button onClick={() => deleteProduct(p.id)} disabled={!!loading} title="Delete"
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-40">
                          {isLoading("delete") ? "…" : <Trash2 size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-white mb-1">Reject Listing</h3>
            <p className="text-sm text-gray-400 mb-4">Optionally provide a reason — it will be sent to the seller.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Insufficient photos, incorrect category…"
              rows={3}
              className="w-full bg-dark-input border border-dark-border rounded-lg px-3 py-2.5 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={submitReject} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold py-2.5 rounded-lg transition-colors">
                Confirm Reject
              </button>
              <button onClick={() => setRejectId(null)} className="flex-1 bg-dark-secondary hover:bg-dark-input text-gray-300 text-[13px] font-semibold py-2.5 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <EditProductModal
          product={editing}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
          saving={loading === editing.id + "edit"}
        />
      )}
    </div>
  );
}

// ── Edit modal ────────────────────────────────────────────
function EditProductModal({
  product,
  onClose,
  onSave,
  saving,
}: {
  product: AdminProduct;
  onClose: () => void;
  onSave: (patch: Partial<AdminProduct>) => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState(product.title);
  const [price, setPrice] = useState(String(product.price));
  const [condition, setCondition] = useState(product.condition);
  const [brand, setBrand] = useState(product.brand ?? "");
  const [carMake, setCarMake] = useState(product.carMake ?? "");
  const [carModel, setCarModel] = useState(product.carModel ?? "");
  const [description, setDescription] = useState(product.description ?? "");
  const [listingType, setListingType] = useState(product.listingType ?? "PART");
  const [isActive, setIsActive] = useState(product.isActive);
  const [isFeatured, setIsFeatured] = useState(product.isFeatured);
  const [approvalStatus, setApprovalStatus] = useState(product.approvalStatus);

  function submit() {
    const priceNum = Number(price);
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!Number.isFinite(priceNum) || priceNum < 0) { toast.error("Invalid price"); return; }

    onSave({
      title: title.trim(),
      price: priceNum,
      condition,
      brand: brand.trim() || null,
      carMake: carMake.trim() || null,
      carModel: carModel.trim() || null,
      description: description.trim() || null,
      listingType,
      isActive,
      isFeatured,
      approvalStatus,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-dark-card border-b border-dark-border px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-white">Edit Listing</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="md:col-span-2">
            <Label>Title *</Label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input w-full text-[13px]" />
          </div>

          {/* Listing type */}
          <div>
            <Label>Listing Type</Label>
            <select value={listingType} onChange={(e) => setListingType(e.target.value)} className="input w-full text-[13px]">
              <option value="PART">Part</option>
              <option value="SERVICE">Service</option>
              <option value="CAR">Car for Sale</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <Label>Price (QAR) *</Label>
            <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="input w-full text-[13px]" />
          </div>

          {/* Condition */}
          <div>
            <Label>Condition</Label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className="input w-full text-[13px]">
              {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Approval status */}
          <div>
            <Label>Approval Status</Label>
            <select value={approvalStatus} onChange={(e) => setApprovalStatus(e.target.value)} className="input w-full text-[13px]">
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Brand / service slug / body slug */}
          <div className="md:col-span-2">
            <Label>
              {listingType === "SERVICE" ? "Service Slug" : listingType === "CAR" ? "Body Type Slug" : "Brand"}
            </Label>
            <input value={brand} onChange={(e) => setBrand(e.target.value)} className="input w-full text-[13px]"
              placeholder={listingType === "SERVICE" ? "mechanic, insurance, tow…" : listingType === "CAR" ? "sedan, suv, sports…" : "Bosch, Brembo…"}
            />
          </div>

          {/* Car make / model */}
          <div>
            <Label>Car Make</Label>
            <input value={carMake} onChange={(e) => setCarMake(e.target.value)} className="input w-full text-[13px]" />
          </div>
          <div>
            <Label>Car Model</Label>
            <input value={carModel} onChange={(e) => setCarModel(e.target.value)} className="input w-full text-[13px]" />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <Label>Description</Label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="input w-full text-[13px] resize-none" />
          </div>

          {/* Toggles */}
          <div className="md:col-span-2 flex flex-wrap gap-5 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-[13px] text-gray-300">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-brand-orange w-4 h-4" />
              Active
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-[13px] text-gray-300">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-brand-orange w-4 h-4" />
              Featured
            </label>
          </div>
        </div>

        <div className="sticky bottom-0 bg-dark-card border-t border-dark-border px-6 py-4 flex gap-3">
          <button onClick={submit} disabled={saving}
            className="flex-1 bg-brand-orange hover:bg-[#e64d00] text-white text-[13px] font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <button onClick={onClose}
            className="flex-1 bg-dark-secondary hover:bg-dark-input text-gray-300 text-[13px] font-semibold py-2.5 rounded-lg transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}
