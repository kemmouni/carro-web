import { getSellerStore } from "@/lib/auth";
import { redirect }       from "next/navigation";
import { supabaseAdmin }  from "@/lib/supabase";
import MessagesClient     from "./MessagesClient";

export const dynamic = "force-dynamic";

export default async function DashboardMessagesPage() {
  const store = await getSellerStore();
  if (!store) redirect("/auth/login");

  const { data } = await supabaseAdmin
    .from("messages")
    .select(`*, product:products(id, title)`)
    .eq("storeId", store.id)
    .order("createdAt", { ascending: false });

  return <MessagesClient initialMessages={data ?? []} storeId={store.id} />;
}
