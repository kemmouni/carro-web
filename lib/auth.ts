import { cache } from "react";
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase";

/** Returns the currently authenticated Supabase auth user, or null. */
export const getSessionUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
});

/** Returns the store record belonging to the current user, or null. */
export const getSellerStore = cache(async () => {
  const user = await getSessionUser();
  if (!user) return null;

  const { data: store } = await supabaseAdmin
    .from("stores")
    .select("id, name, slug, isVerified")
    .eq("userId", user.id)
    .single();

  return store ?? null;
});
