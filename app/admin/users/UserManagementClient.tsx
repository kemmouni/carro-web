"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Users, Search, Shield, ShieldOff, Ban, CheckCircle, Store } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isBanned: boolean;
  createdAt: string;
  store: { id: string; name: string; slug: string; isVerified: boolean } | null;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN:  "bg-purple-500/15 text-purple-400 border border-purple-500/30",
  SELLER: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  BUYER:  "bg-gray-500/15 text-gray-400 border border-gray-500/30",
};

export default function UserManagementClient({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers]     = useState<AdminUser[]>(initialUsers);
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<"ALL" | "ADMIN" | "SELLER" | "BUYER" | "BANNED">("ALL");
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch = u.email.toLowerCase().includes(q) || (u.name ?? "").toLowerCase().includes(q);
      const matchFilter =
        filter === "ALL" ? true :
        filter === "BANNED" ? u.isBanned :
        u.role === filter;
      return matchSearch && matchFilter;
    });
  }, [users, search, filter]);

  async function update(id: string, updates: Record<string, unknown>) {
    setLoading(id);
    try {
      const res  = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...json.data } : u)));
      } else {
        alert(json.error ?? "Failed");
      }
    } finally {
      setLoading(null);
    }
  }

  const counts = {
    ALL:    users.length,
    ADMIN:  users.filter((u) => u.role === "ADMIN").length,
    SELLER: users.filter((u) => u.role === "SELLER").length,
    BUYER:  users.filter((u) => u.role === "BUYER").length,
    BANNED: users.filter((u) => u.isBanned).length,
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">User Management</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage roles and access for all platform users</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(["ALL", "ADMIN", "SELLER", "BUYER", "BANNED"] as const).map((f) => (
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
          placeholder="Search by name or email…"
          className="w-full bg-dark-secondary border border-dark-border rounded-lg pl-9 pr-4 py-2.5 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center py-20 text-center">
          <Users size={48} className="text-gray-600 mb-4" />
          <p className="text-lg font-bold text-white mb-1">No users found</p>
          <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">User</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5 hidden md:table-cell">Store</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5">Role</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5 hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filtered.map((u) => (
                <tr key={u.id} className={`transition-colors hover:bg-dark-secondary/40 ${u.isBanned ? "opacity-60" : ""}`}>
                  {/* User */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-dark-input flex items-center justify-center flex-shrink-0 text-[13px] font-bold text-brand-orange">
                        {(u.name ?? u.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-white">{u.name ?? "—"}</p>
                        <p className="text-[11px] text-gray-500">{u.email}</p>
                        {u.isBanned && <p className="text-[11px] text-red-400 font-semibold">BANNED</p>}
                      </div>
                    </div>
                  </td>

                  {/* Store */}
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    {u.store ? (
                      <Link href={`/store/${u.store.slug}`} target="_blank" className="text-[12px] text-brand-orange hover:underline flex items-center gap-1">
                        <Store size={11} />
                        {u.store.name}
                        {u.store.isVerified && <span className="text-green-400 ml-1">✓</span>}
                      </Link>
                    ) : (
                      <span className="text-[12px] text-gray-600">—</span>
                    )}
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[u.role] ?? ""}`}>
                      {u.role}
                    </span>
                  </td>

                  {/* Joined */}
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="text-[12px] text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Promote to admin / demote */}
                      {u.role !== "ADMIN" ? (
                        <button
                          onClick={() => update(u.id, { role: "ADMIN" })}
                          disabled={loading === u.id}
                          title="Make Admin"
                          className="p-1.5 rounded-lg hover:bg-purple-500/20 text-gray-500 hover:text-purple-400 transition-colors disabled:opacity-40"
                        >
                          <Shield size={13} />
                        </button>
                      ) : (
                        <button
                          onClick={() => update(u.id, { role: "SELLER" })}
                          disabled={loading === u.id}
                          title="Remove Admin"
                          className="p-1.5 rounded-lg hover:bg-gray-500/20 text-purple-400 hover:text-gray-400 transition-colors disabled:opacity-40"
                        >
                          <ShieldOff size={13} />
                        </button>
                      )}

                      {/* Promote to seller (if buyer) */}
                      {u.role === "BUYER" && (
                        <button
                          onClick={() => update(u.id, { role: "SELLER" })}
                          disabled={loading === u.id}
                          title="Promote to Seller"
                          className="p-1.5 rounded-lg hover:bg-blue-500/20 text-gray-500 hover:text-blue-400 transition-colors text-[11px] font-semibold disabled:opacity-40 px-2"
                        >
                          → Seller
                        </button>
                      )}

                      {/* Ban / unban */}
                      {u.isBanned ? (
                        <button
                          onClick={() => update(u.id, { isBanned: false })}
                          disabled={loading === u.id}
                          title="Unban"
                          className="p-1.5 rounded-lg hover:bg-green-500/20 text-red-400 hover:text-green-400 transition-colors disabled:opacity-40"
                        >
                          <CheckCircle size={13} />
                        </button>
                      ) : (
                        <button
                          onClick={() => { if (confirm(`Ban ${u.email}?`)) update(u.id, { isBanned: true }); }}
                          disabled={loading === u.id || u.role === "ADMIN"}
                          title="Ban user"
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors disabled:opacity-40"
                        >
                          <Ban size={13} />
                        </button>
                      )}
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
