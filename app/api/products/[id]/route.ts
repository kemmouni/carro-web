import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select(`
        *,
        images:product_images(id, url, "isPrimary", "sortOrder"),
        category:categories(id, name, slug),
        store:stores(id, name, slug, city, "isVerified", phone, "workingHours", "responseRate", "totalSales")
      `)
      .eq("id", id)
      .single();

    if (error || !product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    // Sort images
    const sorted = {
      ...product,
      images: ((product as Record<string, unknown>).images as Array<{ sortOrder: number }> ?? [])
        .sort((a, b) => a.sortOrder - b.sortOrder),
    };

    // Increment view count (fire and forget)
    supabaseAdmin
      .from("products")
      .update({ viewCount: ((product as Record<string, unknown>).viewCount as number ?? 0) + 1 })
      .eq("id", id)
      .then(() => {});

    return NextResponse.json({ success: true, data: sorted });
  } catch (err) {
    console.error("[GET /api/products/[id]]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { data: product, error } = await supabaseAdmin
      .from("products")
      .update({ ...body, updatedAt: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data: product });
  } catch (err) {
    console.error("[PATCH /api/products/[id]]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("products")
      .update({ isActive: false, updatedAt: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/products/[id]]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
