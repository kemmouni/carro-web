"use client";

import { useState } from "react";
import Link from "next/link";
import { Flag, ExternalLink, CheckCircle, X, Package } from "lucide-react";
import { toast } from "sonner";

interface Report {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  product: { id: string; title: string } | null;
  reporter: { id: string; email: string; fullName: string } | null;
}

const REASON_LABELS: Record<string, string> = {
  fake_listing:    "Fake / Fraudulent",
  prohibited_item: "Prohibited Item",
  wrong_price:     "Misleading Price",
  duplicate:       "Duplicate Listing",
  spam:            "Spam",
  other:           "Other",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING:   "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  REVIEWED:  "bg-blue-500/15 text-blue-400 border-blue-500/30",
  DISMISSED: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  ACTIONED:  "bg-green-500/15 text-green-400 border-green-500/30",
};

type StatusFilter = "ALL" | "PENDING" | "REVIEWED" | "DISMISSED" | "ACTIONED";

export default function AdminReportsClient({ initialReports }: { initialReports: Report[] }) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [filter, setFilter]   = useState<StatusFilter>("ALL");
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = reports.filter((r) => filter === "ALL" || r.status === filter);

  const counts = {
    ALL:       reports.length,
    PENDING:   reports.filter((r) => r.status === "PENDING").length,
    REVIEWED:  reports.filter((r) => r.status === "REVIEWED").length,
    DISMISSED: reports.filter((r) => r.status === "DISMISSED").length,
    ACTIONED:  reports.filter((r) => r.status === "ACTIONED").length,
  };

  async function updateStatus(id: string, status: string) {
    setLoading(id + status);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status }),
      });
      const j = await res.json();
      if (j.success) {
        setReports((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
        toast.success("Report updated");
      } else {
        toast.error(j.error ?? "Failed");
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Reports</h1>
          <p className="text-gray-500 text-sm mt-0.5">{counts.PENDING} pending review</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["ALL","PENDING","REVIEWED","DISMISSED","ACTIONED"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-[12px] font-semibold transition-colors ${
              filter === s
                ? "bg-brand-orange text-white"
                : "bg-dark-secondary text-gray-400 hover:text-white"
            }`}
          >
            {s} <span className="opacity-60">({counts[s]})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <Flag size={40} className="text-gray-600 mb-3" />
          <p className="text-[14px] font-bold text-white mb-1">No reports</p>
          <p className="text-[12px] text-gray-500">No reports in this category.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">Listing</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5">Reason</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5 hidden md:table-cell">Reporter</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5">Status</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3.5 hidden lg:table-cell">Date</th>
                <th className="px-4 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-dark-secondary/40 transition-colors">
                  {/* Listing */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Package size={13} className="text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="text-[13px] font-semibold text-white max-w-[180px] truncate">
                          {r.product?.title ?? "Deleted listing"}
                        </p>
                        {r.product && (
                          <Link
                            href={`/product/${r.product.id}`}
                            target="_blank"
                            className="text-[11px] text-brand-orange hover:underline flex items-center gap-0.5 mt-0.5"
                          >
                            View <ExternalLink size={9} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Reason */}
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-[12px] font-semibold text-white">
                        {REASON_LABELS[r.reason] ?? r.reason}
                      </p>
                      {r.details && (
                        <p className="text-[11px] text-gray-500 max-w-[180px] truncate mt-0.5">{r.details}</p>
                      )}
                    </div>
                  </td>

                  {/* Reporter */}
                  <td className="px-4 py-4 hidden md:table-cell">
                    {r.reporter ? (
                      <div>
                        <p className="text-[12px] text-white">{r.reporter.fullName || "—"}</p>
                        <p className="text-[11px] text-gray-500">{r.reporter.email}</p>
                      </div>
                    ) : (
                      <span className="text-[12px] text-gray-600">Anonymous</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${STATUS_COLORS[r.status] ?? ""}`}>
                      {r.status}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className="text-[12px] text-gray-500">
                      {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      {r.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => updateStatus(r.id, "REVIEWED")}
                            disabled={!!loading}
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                            title="Mark reviewed"
                          >
                            <CheckCircle size={13} />
                          </button>
                          <button
                            onClick={() => updateStatus(r.id, "ACTIONED")}
                            disabled={!!loading}
                            className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors"
                            title="Actioned (listing removed)"
                          >
                            <Flag size={13} />
                          </button>
                          <button
                            onClick={() => updateStatus(r.id, "DISMISSED")}
                            disabled={!!loading}
                            className="p-1.5 rounded-lg bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 transition-colors"
                            title="Dismiss"
                          >
                            <X size={13} />
                          </button>
                        </>
                      )}
                      {r.status !== "PENDING" && (
                        <button
                          onClick={() => updateStatus(r.id, "PENDING")}
                          disabled={!!loading}
                          className="text-[11px] text-gray-500 hover:text-white transition-colors"
                        >
                          Reopen
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
