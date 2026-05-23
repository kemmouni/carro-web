import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, createSupabaseServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const { productId, reason, details } = body;

    if (!productId || !reason) {
      return NextResponse.json({ success: false, error: "productId and reason are required" }, { status: 400 });
    }

    const VALID_REASONS = ["fake_listing", "prohibited_item", "wrong_price", "duplicate", "spam", "other"];
    if (!VALID_REASONS.includes(reason)) {
      return NextResponse.json({ success: false, error: "Invalid reason" }, { status: 400 });
    }

    // Insert report
    await supabaseAdmin.from("product_reports").insert({
      id:        crypto.randomUUID(),
      productId,
      reporterId: user?.id ?? null,
      reason,
      details:   details?.trim() ?? null,
      status:    "PENDING",
      createdAt: new Date().toISOString(),
    });

    // Notify admins
    const { data: admins } = await supabaseAdmin
      .from("users").select("id").eq("role", "ADMIN");

    if (admins?.length) {
      const { data: product } = await supabaseAdmin
        .from("products").select("title").eq("id", productId).single();

      await supabaseAdmin.from("notifications").insert(
        admins.map((a: { id: string }) => ({
          id:      crypto.randomUUID(),
          userId:  a.id,
          type:    "product_reported",
          title:   "Listing reported",
          message: `"${(product as { title?: string })?.title ?? productId}" was reported for: ${reason.replace("_", " ")}`,
          link:    `/admin/reports`,
        }))
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/report]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
