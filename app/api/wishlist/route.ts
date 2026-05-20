import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, createSupabaseServerClient } from "@/lib/supabase";

// GET — fetch current user's wishlist with product details
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from("wishlists")
      .select(`
        id, createdAt,
        product:products(
          id, title, price, originalPrice, currency, condition, isActive,
          store:stores(id, name, slug, city),
          images:product_images(id, url, "isPrimary", "sortOrder")
        )
      `)
      .eq("userId", user.id)
      .order("createdAt", { ascending: false });

    if (error) throw error;

    // Flatten + sort images, filter out deleted products
    const items = (data ?? [])
      .filter((w) => w.product)
      .map((w) => {
        const prod = w.product as unknown as {
          id: string; title: string; price: number; originalPrice?: number;
          currency: string; condition: string; isActive: boolean;
          store: { id: string; name: string; slug: string; city: string } | null;
          images: Array<{ id: string; url: string; isPrimary: boolean; sortOrder: number }>;
        };
        return {
          wishlistId: w.id,
          savedAt:    w.createdAt,
          ...prod,
          images: (prod.images ?? []).sort((a, b) => a.sortOrder - b.sortOrder),
        };
      });

    return NextResponse.json({ success: true, data: items });
  } catch (err) {
    console.error("[GET /api/wishlist]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

// POST — add product to wishlist
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const { productId } = await req.json();
    if (!productId) return NextResponse.json({ success: false, error: "productId required" }, { status: 400 });

    // Upsert to avoid duplicates
    const { data, error } = await supabaseAdmin
      .from("wishlists")
      .upsert(
        { id: crypto.randomUUID(), userId: user.id, productId, createdAt: new Date().toISOString() },
        { onConflict: "userId,productId", ignoreDuplicates: true }
      )
      .select()
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[POST /api/wishlist]", err);
    return NextResponse.json({ success: false, error: "Failed to add to wishlist" }, { status: 500 });
  }
}

// DELETE — remove product from wishlist
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const productId = req.nextUrl.searchParams.get("productId");
    if (!productId) return NextResponse.json({ success: false, error: "productId required" }, { status: 400 });

    const { error } = await supabaseAdmin
      .from("wishlists")
      .delete()
      .eq("userId", user.id)
      .eq("productId", productId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/wishlist]", err);
    return NextResponse.json({ success: false, error: "Failed to remove from wishlist" }, { status: 500 });
  }
}
