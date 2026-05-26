import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase";
import AdminSidebar from "./AdminSidebar";

export const metadata = { title: "Admin Panel — Warsha+" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("role, fullName")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen bg-dark-bg flex">
      <AdminSidebar adminName={profile.fullName ?? user.email ?? "Admin"} />
      <main className="flex-1 ml-60 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
