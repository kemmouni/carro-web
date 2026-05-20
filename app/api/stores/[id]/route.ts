import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function isUUID(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Accept both UUID and slug
    const field = isUUID(id) ? "id" : "slug";
    const { data: store, error } = await supabaseAdmin
      .from("stores").select("*").eq(field, id).single();

    if (error || !store) {
      return NextResponse.json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const [reviewsRes, countRes] = await Promise.all([
      supabaseAdmin
        .from("reviews")
        .select(`*, user:users("fullName", "avatarUrl")`)
        .eq("storeId", store.id)
        .order("createdAt", { ascending: false })
        .limit(20),
      supabaseAdmin
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("storeId", store.id)
        .eq("isActive", true),
    ]);

    const reviews   = reviewsRes.data ?? [];
    const avgRating = reviews.length
      ? Math.round(reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length * 10) / 10
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        ...store,
        reviews,
        avgRating,
        _count: { products: countRes.count ?? 0, reviews: reviews.length },
      },
    });
  } catch (err) {
    console.error("[GET /api/stores/[id]]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body    = await req.json();

    const { data, error } = await supabaseAdmin
      .from("stores")
      .update({
        name:         body.name,
        description:  body.description,
        phone:        body.phone,
        email:        body.email,
        website:      body.website,
        address:      body.address,
        city:         body.city,
        workingHours: body.workingHours,
        logoUrl:      body.logoUrl,
        coverUrl:     body.coverUrl,
        updatedAt:    new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[PUT /api/stores/[id]]", err);
    return NextResponse.json({ success: false, error: "Failed to update store" }, { status: 500 });
  }
}
