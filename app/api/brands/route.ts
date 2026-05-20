import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("brands")
      .select("id, name, slug, logoUrl, country, isPopular, sortOrder")
      .order("sortOrder", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (err) {
    console.error("[GET /api/brands]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
