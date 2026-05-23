import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { createSupabaseServerClient } from "@/lib/supabase";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabaseAdmin.from("users").select("role").eq("id", user.id).single();
  return data?.role === "ADMIN" ? user : null;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const body = await req.json();
    const { action } = body; // 'approve' | 'reject' | 'feature' | 'unfeature'

    let updates: Record<string, unknown> = {};
    let notifType = "";
    let notifTitle = "";
    let notifMsg = "";

    if (action === "approve") {
      updates = { isActive: true, approvalStatus: "ACTIVE" };
      notifType = "product_approved"; notifTitle = "Product approved ✅";
      notifMsg = "Your product listing has been approved and is now live.";
    } else if (action === "reject") {
      updates = { isActive: false, approvalStatus: "REJECTED" };
      notifType = "product_rejected"; notifTitle = "Product rejected ❌";
      notifMsg = body.reason ? `Your listing was rejected: ${body.reason}` : "Your product listing was rejected by admin.";
    } else if (action === "feature") {
      updates = { isFeatured: true };
    } else if (action === "unfeature") {
      updates = { isFeatured: false };
    } else if (action === "update") {
      // Admin edit modal — accept arbitrary editable fields
      const fields = (body.fields ?? {}) as Record<string, unknown>;
      const allowed = [
        "title", "price", "currency", "condition", "brand",
        "carMake", "carModel", "description",
        "isActive", "isFeatured", "approvalStatus", "listingType",
      ];
      for (const key of allowed) {
        if (key in fields) updates[key] = fields[key];
      }
      if (Object.keys(updates).length === 0) {
        return NextResponse.json({ success: false, error: "No editable fields provided" }, { status: 400 });
      }
    } else {
      // Generic update (legacy callers)
      const allowed = ["isActive", "isFeatured", "approvalStatus"];
      for (const key of allowed) { if (key in body) updates[key] = body[key]; }
    }

    const { data, error } = await supabaseAdmin.from("products").update(updates).eq("id", id).select("*, store:stores(userId)").single();
    if (error) throw error;

    // Notify the seller
    if (notifType) {
      const storeUserId = (data as Record<string, unknown> & { store: { userId: string } }).store?.userId;
      if (storeUserId) {
        await supabaseAdmin.from("notifications").insert({
          id: crypto.randomUUID(),
          userId: storeUserId,
          type: notifType,
          title: notifTitle,
          message: notifMsg,
          link: "/dashboard/products",
        });
      }
    }

    revalidatePath("/browse"); revalidatePath("/"); revalidatePath("/search");
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[PUT /api/admin/products/[id]]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/browse"); revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/products/[id]]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
