import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase";

// GET — seller fetches their inbox
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { data: store } = await supabaseAdmin.from("stores").select("id").eq("userId", user.id).maybeSingle();
    if (!store) return NextResponse.json({ success: false, error: "No store" }, { status: 403 });

    const { data, error } = await supabaseAdmin
      .from("messages")
      .select(`*, product:products(id, title)`)
      .eq("storeId", store.id)
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (err) {
    console.error("[GET /api/messages]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST — anyone can send an inquiry
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, storeId, fromName, fromEmail, fromPhone, content } = body;

    if (!storeId || !fromName || !content) {
      return NextResponse.json({ success: false, error: "storeId, fromName, and content required" }, { status: 400 });
    }

    // Get user id if logged in
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabaseAdmin.from("messages").insert({
      id: crypto.randomUUID(),
      productId: productId ?? null,
      storeId,
      fromUserId: user?.id ?? null,
      fromName: fromName.trim(),
      fromEmail: fromEmail?.trim() ?? null,
      fromPhone: fromPhone?.trim() ?? null,
      content: content.trim(),
    }).select().single();

    if (error) throw error;

    // Create notification for store owner
    const { data: store } = await supabaseAdmin.from("stores").select("userId, name").eq("id", storeId).single();
    if (store?.userId) {
      await supabaseAdmin.from("notifications").insert({
        id: crypto.randomUUID(),
        userId: store.userId,
        type: "new_message",
        title: "New inquiry received",
        message: `${fromName} sent you a message${productId ? " about a product" : ""}`,
        link: "/dashboard/messages",
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[POST /api/messages]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
