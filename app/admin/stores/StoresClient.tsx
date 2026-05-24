"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Store, Search, CheckCircle, XCircle, ExternalLink, Trash2, ShieldCheck,
} from "lucide-react";

interface AdminStore {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  isVerified: boolean;
  createdAt: string;
  productCount: number;
  owner: { id: string; fullName: string | null; email: string } | null;
}

export default function StoresClient({ initialStores }: { initialStores: AdminStore[] }) {
  const [stores, setStores]   = useState<AdminStore[]>(initialStores);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<"ALL" | "VERIFIED" | "UNVERIFIED">("ALL");
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return stores.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(q) ||
        (s.owner?.email ?? "").toLowerCase().includes(q) ||
        (s.owner?.fullName ?? "").toLowerCase().includes(q);
      const matchFilter =
        filter === "ALL"        ? true :
        filter === "VERIFIED"   ? s.isVerified :
        !s.isVerified;
      return matchSearch && matchFilter;
    });
  }, [stores, search, filter]);

  async function update(id: string, updates: Record<string, unknown>) {
    setLoading(id);
    try {
      const res  = await fetch(`/api/admin/stores/${id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(updates),
      });
      const json = await res.json();
      if (json.success) {
        setStores((prev) => prev.map((s) => s.id === id ? { ...s, ...json.data } : s));
      } else {
        alert(json.error ?? "Failed");
      }
    } finally {
      setLoading(null);
    }
  }

  async function deleteStore(id: string, name: string) {
    if (!confirm(`Delete store "${name}"? This cannot be undone.`)) return;
    setLoading(id);
    try {
      const res  = await fetch(`/api/admin/stores/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setStores((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert(json.error ?? "Failed");
      }
    } finally {
      setLoading(null);
    }
  }

  const counts = {
    ALL:       stores.length,
    VERIFIED:  stores.filter((s) => s.isVerified).length,
    UNVERIFIED: stores.filter((s) => !s.isVerified).length,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Stores</h1>
        <p className="text-gray-500 text-sm mt-0.5">Verify stores and manage seller accounts</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(["ALL", "VERIFIED", "UNVERIFIED"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
              filter === f ? "bg-brand-orange text-white" : "bg-dark-secondary text-gray-400 hover:text-white"
            }`}>
            {f} <span className="ml-1 text-[11px] opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by store name or owner email…"
          className="w-full bg-dark-secondary border border-dark-border rounded-lg pl-9 pr-4 py-2.5 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange" />
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center py-20 text-center">
          <Store size={48} className="text-gray-600 mb-4" />
          <p className="text-lg font-bold text-white mb-1">No stores found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Store</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5 hidden md:table-cell">Owner</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5">Products</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5 hidden lg:table-cell">Joined</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filtered.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-dark-secondary/40">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                        <Store size={16} className="text-brand-orange" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-white">{s.name}</p>
                        <p className="text-[11px] text-gray-500">/{s.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <p className="text-[13px] text-white">{s.owner?.fullName ?? "—"}</p>
                    <p className="text-[11px] text-gray-500">{s.owner?.email ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[13px] font-semibold text-white">{s.productCount}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="text-[12px] text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    {s.isVerified ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full w-fit">
                        <ShieldCheck size={11} /> Verified
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full w-fit">
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/store/${s.slug}`} target="_blank"
                        className="p-1.5 rounded-lg hover:bg-dark-card text-gray-500 hover:text-white transition-colors" title="View store">
                        <ExternalLink size={13} />
                      </Link>
                      {s.isVerified ? (
                        <button onClick={() => update(s.id, { isVerified: false })} disabled={loading === s.id}
                          title="Remove verification"
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-green-400 hover:text-red-400 transition-colors disabled:opacity-40">
                          <XCircle size={13} />
                        </button>
                      ) : (
                        <button onClick={() => update(s.id, { isVerified: true })} disabled={loading === s.id}
                          title="Verify store"
                          className="p-1.5 rounded-lg hover:bg-green-500/20 text-gray-500 hover:text-green-400 transition-colors disabled:opacity-40">
                          <CheckCircle size={13} />
                        </button>
                      )}
                      <button onClick={() => deleteStore(s.id, s.name)} disabled={loading === s.id}
                        title="Delete store"
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors disabled:opacity-40">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
