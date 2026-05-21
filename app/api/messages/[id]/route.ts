import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase";

// PUT — mark as read
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const { data, error } = await supabaseAdmin
      .from("messages")
      .update({ isRead: body.isRead ?? true })
      .eq("id", id)
      .select().single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[PUT /api/messages/[id]]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
