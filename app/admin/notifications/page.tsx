import { supabaseAdmin } from "@/lib/supabase";
import NotificationsClient from "./NotificationsClient";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const { data: users } = await supabaseAdmin
    .from("users")
    .select("id, fullName, email, role")
    .order("fullName", { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <NotificationsClient users={(users ?? []) as any} />;
}
