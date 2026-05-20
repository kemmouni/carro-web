import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// PUT — update product
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { images, ...fields } = body;

    // Update product fields
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .update({
        title:         fields.title,
        description:   fields.description,
        price:         fields.price,
        originalPrice: fields.originalPrice,
        condition:     fields.condition,
        brand:         fields.brand,
        partNumber:    fields.partNumber,
        carMake:       fields.carMake,
        carModel:      fields.carModel,
        carYear:       fields.carYear,
        carYearTo:     fields.carYearTo,
        categoryId:    fields.categoryId,
        isActive:      fields.isActive,
        isFeatured:    fields.isFeatured,
        updatedAt:     new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Replace images if provided
    if (images?.length) {
      await supabaseAdmin.from("product_images").delete().eq("productId", id);
      await supabaseAdmin.from("product_images").insert(
        images.map((img: { url: string; isPrimary?: boolean; sortOrder?: number }, i: number) => ({
          id:        crypto.randomUUID(),
          productId: id,
          url:       img.url,
          isPrimary: img.isPrimary ?? i === 0,
          sortOrder: img.sortOrder ?? i,
        }))
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (err) {
    console.error("[PUT /api/dashboard/products/:id]", err);
    return NextResponse.json({ success: false, error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE — delete product
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Delete images first (cascade should handle it, but just in case)
    await supabaseAdmin.from("product_images").delete().eq("productId", id);

    const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/dashboard/products/:id]", err);
    return NextResponse.json({ success: false, error: "Failed to delete product" }, { status: 500 });
  }
}
