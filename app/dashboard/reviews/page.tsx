import { supabaseAdmin } from "@/lib/supabase";
import { getSellerStore } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Star } from "lucide-react";

export default async function DashboardReviewsPage() {
  const store = await getSellerStore();
  if (!store) redirect("/auth/login");

  const { data: reviews } = await supabaseAdmin
    .from("reviews")
    .select(`*, user:users("fullName", email)`)
    .eq("storeId", store.id)
    .order("createdAt", { ascending: false });

  const items = reviews ?? [];
  const avg   = items.length
    ? (items.reduce((s, r) => s + r.rating, 0) / items.length).toFixed(1)
    : null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Reviews</h1>
          <p className="text-gray-500 text-sm mt-0.5">{items.length} review{items.length !== 1 ? "s" : ""}</p>
        </div>
        {avg && (
          <div className="card px-5 py-3 flex items-center gap-2">
            <Star size={18} className="fill-yellow-400 text-yellow-400" />
            <span className="text-2xl font-black text-white">{avg}</span>
            <span className="text-gray-500 text-sm">/ 5</span>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-24 text-center">
          <Star size={48} className="text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No reviews yet</h3>
          <p className="text-gray-500 text-sm">Reviews from customers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[13px] font-semibold text-white">
                    {(r as { user?: { fullName?: string; email: string } }).user?.fullName ?? (r as { user?: { email: string } }).user?.email ?? "Anonymous"}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={13} className={i <= r.rating ? "fill-yellow-400 text-yellow-400" : "fill-dark-border text-dark-border"} />
                  ))}
                </div>
              </div>
              {r.comment && <p className="text-[13px] text-gray-400 leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
