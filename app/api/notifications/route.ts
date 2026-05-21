import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("userId", user.id)
      .order("createdAt", { ascending: false })
      .limit(50);

    if (error) throw error;
    const unread = (data ?? []).filter((n: { isRead: boolean }) => !n.isRead).length;
    return NextResponse.json({ success: true, data: data ?? [], unread });
  } catch (err) {
    console.error("[GET /api/notifications]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PUT — mark all as read
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const ids: string[] | undefined = body.ids;

    let query = supabaseAdmin.from("notifications").update({ isRead: true }).eq("userId", user.id);
    if (ids?.length) query = query.in("id", ids);

    const { error } = await query;
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PUT /api/notifications]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
