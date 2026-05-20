import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from("categories")
      .select("*, products:products(id)")
      .order("sortOrder", { ascending: true });

    if (error) throw error;

    // Attach product count
    const data = (categories ?? []).map((c: Record<string, unknown>) => ({
      ...c,
      _count: { products: Array.isArray(c.products) ? (c.products as unknown[]).length : 0 },
      products: undefined,
    }));

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[GET /api/categories]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
