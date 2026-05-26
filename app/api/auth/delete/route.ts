import { NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase";

export async function DELETE() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const userId = user.id;

    // 1. Soft-delete: deactivate all listings so they disappear from search immediately
    // First, fetch the store IDs belonging to this user
    const { data: storeRows } = await supabaseAdmin
      .from("stores")
      .select("id")
      .eq("userId", userId);
    const storeIds = (storeRows ?? []).map((s: { id: string }) => s.id);
    if (storeIds.length > 0) {
      await supabaseAdmin
        .from("products")
        .update({ isActive: false })
        .in("storeId", storeIds);
    }

    // 2. Delete the Supabase auth user (cascades will handle most FK constraints)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("[DELETE /api/auth/delete]", deleteError);
      return NextResponse.json({ success: false, error: "Failed to delete account. Contact support." }, { status: 500 });
    }

    // 3. Sign out the current session (cookies will be cleared)
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/auth/delete]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
