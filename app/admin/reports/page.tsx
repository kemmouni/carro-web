import { supabaseAdmin } from "@/lib/supabase";
import { Flag, Package } from "lucide-react";
import Link from "next/link";
import AdminReportsClient from "./AdminReportsClient";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const { data: reports } = await supabaseAdmin
    .from("product_reports")
    .select(`
      id, reason, details, status, "createdAt",
      product:products(id, title),
      reporter:users!product_reports_reporterId_fkey(id, email, "fullName")
    `)
    .order("createdAt", { ascending: false });

  return <AdminReportsClient initialReports={(reports ?? []) as never[]} />;
}
