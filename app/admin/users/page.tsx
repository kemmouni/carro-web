import { supabaseAdmin } from "@/lib/supabase";
import UserManagementClient from "./UserManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { data } = await supabaseAdmin
    .from("users")
    .select(`id, email, fullName, role, isBanned, createdAt, store:stores(id, name, slug, isVerified)`)
    .order("createdAt", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <UserManagementClient initialUsers={(data ?? []) as any} />;
}
