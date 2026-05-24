import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, createSupabaseServerClient } from "@/lib/supabase";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabaseAdmin.from("users").select("role").eq("id", user.id).single();
  return data?.role === "ADMIN" ? user : null;
}

// POST — send notification to one user, a role, or all users
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

  try {
    const { title, message, link, target, userId, role } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ success: false, error: "Title and message are required" }, { status: 400 });
    }

    let userIds: string[] = [];

    if (target === "one" && userId) {
      userIds = [userId];
    } else if (target === "role" && role) {
      const { data } = await supabaseAdmin.from("users").select("id").eq("role", role);
      userIds = (data ?? []).map((u: { id: string }) => u.id);
    } else if (target === "all") {
      const { data } = await supabaseAdmin.from("users").select("id");
      userIds = (data ?? []).map((u: { id: string }) => u.id);
    } else {
      return NextResponse.json({ success: false, error: "Invalid target" }, { status: 400 });
    }

    if (userIds.length === 0) {
      return NextResponse.json({ success: false, error: "No users matched" }, { status: 400 });
    }

    // Insert notifications in batches of 500
    const notifications = userIds.map((uid) => ({
      userId:  uid,
      type:    "admin_announcement",
      title,
      message,
      link:    link || null,
      isRead:  false,
    }));

    const BATCH = 500;
    for (let i = 0; i < notifications.length; i += BATCH) {
      const { error } = await supabaseAdmin
        .from("notifications")
        .insert(notifications.slice(i, i + BATCH));
      if (error) throw error;
    }

    return NextResponse.json({ success: true, sent: userIds.length });
  } catch (err) {
    console.error("[POST /api/admin/notify]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
