import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase";

// Regenerate at most once per hour at the CDN edge
export const revalidate = 3600;

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://warsha.plus").replace(/\/$/, "");

// ─── Static public routes ─────────────────────────────────
const STATIC: MetadataRoute.Sitemap = [
  { url: `${BASE}/`,              priority: 1.0, changeFrequency: "daily"   },
  { url: `${BASE}/search`,        priority: 0.9, changeFrequency: "hourly"  },
  { url: `${BASE}/search/by-car`, priority: 0.8, changeFrequency: "daily"   },
  { url: `${BASE}/deals`,         priority: 0.8, changeFrequency: "daily"   },
  { url: `${BASE}/how-it-works`,  priority: 0.6, changeFrequency: "monthly" },
  { url: `${BASE}/about`,         priority: 0.5, changeFrequency: "monthly" },
  { url: `${BASE}/contact`,       priority: 0.5, changeFrequency: "monthly" },
  { url: `${BASE}/help`,          priority: 0.5, changeFrequency: "monthly" },
  { url: `${BASE}/careers`,       priority: 0.4, changeFrequency: "monthly" },
  { url: `${BASE}/privacy`,       priority: 0.3, changeFrequency: "yearly"  },
  { url: `${BASE}/terms`,         priority: 0.3, changeFrequency: "yearly"  },
  { url: `${BASE}/shipping`,      priority: 0.3, changeFrequency: "yearly"  },
  { url: `${BASE}/returns`,       priority: 0.3, changeFrequency: "yearly"  },
];

// ─── Sitemap ──────────────────────────────────────────────
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // All live, approved products — prefer updatedAt for freshness signals
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("id, updatedAt")
    .eq("isActive", true)
    .eq("approvalStatus", "ACTIVE")
    .order("updatedAt", { ascending: false })
    .limit(5000);

  // All stores with a slug
  const { data: stores } = await supabaseAdmin
    .from("stores")
    .select("slug, updatedAt")
    .not("slug", "is", null)
    .limit(2000);

  const productUrls: MetadataRoute.Sitemap = (products ?? []).map(
    (p: { id: string; updatedAt: string | null }) => ({
      url:             `${BASE}/product/${p.id}`,
      lastModified:    p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority:        0.7,
    }),
  );

  const storeUrls: MetadataRoute.Sitemap = (stores ?? [])
    .filter((s: { slug: string | null; updatedAt: string | null }) => !!s.slug)
    .map((s: { slug: string; updatedAt: string | null }) => ({
      url:             `${BASE}/store/${s.slug}`,
      lastModified:    s.updatedAt ? new Date(s.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority:        0.6,
    }));

  return [...STATIC, ...productUrls, ...storeUrls];
}
