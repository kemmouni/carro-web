"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  CheckCircle, XCircle, Star, StarOff, Trash2, Package,
  Search, Filter, Eye, ExternalLink,
} from "lucide-react";

interface AdminProduct {
  id: string;
  title: string;
  price: number;
  condition: string;
  isActive: boolean;
  isFeatured: boolean;
  approvalStatus: string;
  createdAt: string;
  category: { name: string } | null;
  store: { id: string; name: string; slug: string } | null;
  images: Array<{ url: string; isPrimary: boolean; sortOrder: number }>;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:  "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  ACTIVE:   "bg-green-500/15 text-green-400 border border-green-500/30",
  REJECTED: "bg-red-500/15 text-red-400 border border-red-500/30",
};

export default function ProductModerationClient({ initialProducts }: { initialProducts: AdminProduct[] }) {
  const [products, setProducts]     = useState<AdminProduct[]>(initialProducts);
  const [search, setSearch]         = useState("");
  const [filter, setFilter]         = useState<"ALL" | "PENDING" | "ACTIVE" | "REJECTED">("ALL");
  const [loading, setLoading]       = useState<string | null>(null);
  const [rejectId, setRejectId]     = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.store?.name.toLowerCase().includes(search.toLowerCase() ?? "");
      const matchFilter = filter === "ALL" || p.approvalStatus === filter;
      return matchSearch && matchFilter;
    });
  }, [products, search, filter]);

  async function action(id: string, act: string, extra?: Record<string, string>) {
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

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product permanently?")) return;
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

  const counts = {
    ALL:      products.length,
    PENDING:  products.filter((p) => p.approvalStatus === "PENDING").length,
    ACTIVE:   products.filter((p) => p.approvalStatus === "ACTIVE").length,
    REJECTED: products.filter((p) => p.approvalStatus === "REJECTED").length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Product Moderation</h1>
        <p className="text-gray-500 text-sm mt-0.5">Approve or reject seller listings before they go live</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(["ALL", "PENDING", "ACTIVE", "REJECTED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
              filter === f
                ? "bg-brand-orange text-white"
                : "bg-dark-secondary text-gray-400 hover:text-white"
            }`}
          >
            {f} <span className="ml-1 text-[11px] opacity-70">({counts[f]})</span>
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
          <p className="text-gray-500 text-sm">
            {filter === "PENDING" ? "All caught up — no pending listings." : "Try changing your filters."}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Product</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5 hidden md:table-cell">Store</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5 hidden lg:table-cell">Category</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5">Price</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filtered.map((p) => {
                const img = p.images?.sort((a, b) => a.sortOrder - b.sortOrder)[0]?.url;
                const isLoading = (act: string) => loading === p.id + act;
                return (
                  <tr key={p.id} className="hover:bg-dark-secondary/40 transition-colors group">
                    {/* Product */}
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
                          <p className="text-[13px] font-semibold text-white max-w-[180px] truncate">{p.title}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {new Date(p.createdAt).toLocaleDateString()}
                            {p.isFeatured && <span className="ml-2 text-yellow-400">⭐ Featured</span>}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Store */}
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-[12px] text-gray-400">{p.store?.name ?? "—"}</span>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-[12px] text-gray-400">{p.category?.name ?? "—"}</span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] font-bold text-brand-orange">{p.price.toLocaleString()} QAR</span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[p.approvalStatus] ?? ""}`}>
                        {p.approvalStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View */}
                        <a
                          href={`/product/${p.id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg hover:bg-dark-input text-gray-500 hover:text-white transition-colors"
                          title="View"
                        >
                          <ExternalLink size={13} />
                        </a>

                        {/* Approve */}
                        {p.approvalStatus !== "ACTIVE" && (
                          <button
                            onClick={() => action(p.id, "approve")}
                            disabled={!!loading}
                            title="Approve"
                            className="p-1.5 rounded-lg hover:bg-green-500/20 text-gray-500 hover:text-green-400 transition-colors disabled:opacity-40"
                          >
                            {isLoading("approve") ? "…" : <CheckCircle size={13} />}
                          </button>
                        )}

                        {/* Reject */}
                        {p.approvalStatus !== "REJECTED" && (
                          <button
                            onClick={() => { setRejectId(p.id); setRejectReason(""); }}
                            disabled={!!loading}
                            title="Reject"
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors disabled:opacity-40"
                          >
                            <XCircle size={13} />
                          </button>
                        )}

                        {/* Feature toggle */}
                        <button
                          onClick={() => action(p.id, p.isFeatured ? "unfeature" : "feature")}
                          disabled={!!loading}
                          title={p.isFeatured ? "Unfeature" : "Feature"}
                          className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                            p.isFeatured
                              ? "hover:bg-yellow-500/20 text-yellow-400 hover:text-yellow-300"
                              : "hover:bg-yellow-500/20 text-gray-500 hover:text-yellow-400"
                          }`}
                        >
                          {isLoading("feature") || isLoading("unfeature") ? "…" : p.isFeatured ? <Star size={13} /> : <StarOff size={13} />}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => deleteProduct(p.id)}
                          disabled={!!loading}
                          title="Delete"
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-40"
                        >
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
              <button
                onClick={submitReject}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold py-2.5 rounded-lg transition-colors"
              >
                Confirm Reject
              </button>
              <button
                onClick={() => setRejectId(null)}
                className="flex-1 bg-dark-secondary hover:bg-dark-input text-gray-300 text-[13px] font-semibold py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
