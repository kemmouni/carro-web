import { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://carro.qa";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const statics: MetadataRoute.Sitemap = [
    { url: BASE_URL,                      lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/browse`,          lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/search`,          lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE_URL}/search/by-car`,   lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE_URL}/terms`,           lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`,         lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  // Products
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("id, createdAt")
    .eq("isActive", true)
    .eq("approvalStatus", "ACTIVE")
    .order("createdAt", { ascending: false })
    .limit(5000);

  const productPages: MetadataRoute.Sitemap = (products ?? []).map((p: { id: string; createdAt: string }) => ({
    url: `${BASE_URL}/product/${p.id}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Stores
  const { data: stores } = await supabaseAdmin
    .from("stores")
    .select("slug, createdAt")
    .limit(1000);

  const storePages: MetadataRoute.Sitemap = (stores ?? []).map((s: { slug: string; createdAt: string }) => ({
    url: `${BASE_URL}/store/${s.slug}`,
    lastModified: new Date(s.createdAt),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Categories
  const { data: categories } = await supabaseAdmin
    .from("categories")
    .select("slug");

  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map((c: { slug: string }) => ({
    url: `${BASE_URL}/search?category=${c.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.75,
  }));

  return [...statics, ...productPages, ...storePages, ...categoryPages];
}
