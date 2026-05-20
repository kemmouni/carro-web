import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page  = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(48, parseInt(searchParams.get("limit") ?? "20"));
    const q     = searchParams.get("q");
    const city  = searchParams.get("city");

    let query = supabaseAdmin
      .from("stores")
      .select("*, products:products(id), reviews:reviews(id)", { count: "exact" })
      .order("createdAt", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (q)    query = query.ilike("name", `%${q}%`);
    if (city) query = query.ilike("city", city);

    const { data, count, error } = await query;
    if (error) throw error;

    const stores = (data ?? []).map((s: Record<string, unknown>) => ({
      ...s,
      _count: {
        products: Array.isArray(s.products) ? (s.products as unknown[]).length : 0,
        reviews:  Array.isArray(s.reviews)  ? (s.reviews  as unknown[]).length : 0,
      },
      products: undefined,
      reviews:  undefined,
    }));

    return NextResponse.json({
      success: true,
      data: stores,
      pagination: { page, limit, total: count ?? 0, pages: Math.ceil((count ?? 0) / limit) },
    });
  } catch (err) {
    console.error("[GET /api/stores]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
