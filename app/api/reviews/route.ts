import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, createSupabaseServerClient } from "@/lib/supabase";

// GET — fetch reviews for a store
export async function GET(req: NextRequest) {
  try {
    const storeId = req.nextUrl.searchParams.get("storeId");
    if (!storeId) return NextResponse.json({ success: false, error: "storeId required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("reviews")
      .select(`*, user:users("fullName", email)`)
      .eq("storeId", storeId)
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (err) {
    console.error("[GET /api/reviews]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST — create a review (authenticated buyers only)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const { storeId, rating, comment } = await req.json();
    if (!storeId)                              return NextResponse.json({ success: false, error: "storeId required" }, { status: 400 });
    if (!rating || rating < 1 || rating > 5)   return NextResponse.json({ success: false, error: "Rating must be 1–5" }, { status: 400 });

    // Prevent sellers reviewing their own store
    const { data: store } = await supabaseAdmin.from("stores").select("userId").eq("id", storeId).single();
    if (store?.userId === user.id) return NextResponse.json({ success: false, error: "You cannot review your own store" }, { status: 400 });

    // One review per user per store
    const { data: existing } = await supabaseAdmin.from("reviews").select("id").eq("storeId", storeId).eq("userId", user.id).maybeSingle();
    if (existing) return NextResponse.json({ success: false, error: "You have already reviewed this store" }, { status: 400 });

    const { data, error } = await supabaseAdmin.from("reviews").insert({
      id:        crypto.randomUUID(),
      storeId,
      userId:    user.id,
      rating:    Number(rating),
      comment:   comment?.trim() || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).select(`*, user:users("fullName", email)`).single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[POST /api/reviews]", err);
    return NextResponse.json({ success: false, error: "Failed to submit review" }, { status: 500 });
  }
}

// DELETE — delete own review
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const reviewId = req.nextUrl.searchParams.get("id");
    if (!reviewId) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

    const { error } = await supabaseAdmin.from("reviews").delete().eq("id", reviewId).eq("userId", user.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/reviews]", err);
    return NextResponse.json({ success: false, error: "Failed to delete review" }, { status: 500 });
  }
}
