import { supabaseAdmin } from "@/lib/supabase";
import BannersClient from "./BannersClient";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const { data } = await supabaseAdmin
    .from("hero_banners")
    .select("*")
    .order("sortOrder", { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <BannersClient initialBanners={(data ?? []) as any} />;
}
