import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, createSupabaseServerClient } from "@/lib/supabase";

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

// POST — create a new store (seller onboarding)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const { name, city, phone } = await req.json();
    if (!name?.trim()) return NextResponse.json({ success: false, error: "Store name is required" }, { status: 400 });

    // Make sure they don't already have a store
    const { data: existing } = await supabaseAdmin.from("stores").select("id").eq("userId", user.id).maybeSingle();
    if (existing) return NextResponse.json({ success: false, error: "You already have a store" }, { status: 400 });

    // Generate a unique slug
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const slug  = `${base}-${Math.random().toString(36).slice(2, 6)}`;

    const { data: store, error } = await supabaseAdmin.from("stores").insert({
      id:        crypto.randomUUID(),
      userId:    user.id,
      name:      name.trim(),
      slug,
      city:      city?.trim() || "Doha",
      country:   "Qatar",
      phone:     phone?.trim() || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).select().single();

    if (error) throw error;

    // Promote user to SELLER role
    await supabaseAdmin.from("users").update({ role: "SELLER", updatedAt: new Date().toISOString() }).eq("id", user.id);

    return NextResponse.json({ success: true, data: store });
  } catch (err) {
    console.error("[POST /api/stores]", err);
    return NextResponse.json({ success: false, error: "Failed to create store" }, { status: 500 });
  }
}
