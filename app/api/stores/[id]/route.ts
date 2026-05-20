import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const [storeRes, reviewsRes, countsRes] = await Promise.all([
      supabaseAdmin.from("stores").select("*").eq("id", id).single(),
      supabaseAdmin
        .from("reviews")
        .select(`*, user:users("fullName", "avatarUrl")`)
        .eq("storeId", id)
        .order("createdAt", { ascending: false })
        .limit(10),
      supabaseAdmin.from("products").select("id", { count: "exact" }).eq("storeId", id).eq("isActive", true),
    ]);

    if (storeRes.error || !storeRes.data) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...storeRes.data,
        reviews: reviewsRes.data ?? [],
        _count: {
          products: countsRes.count ?? 0,
          reviews:  (reviewsRes.data ?? []).length,
        },
      },
    });
  } catch (err) {
    console.error("[GET /api/stores/[id]]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
