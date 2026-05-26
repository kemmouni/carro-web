import type { MetadataRoute } from "next";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://warsha.plus").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Private / auth-gated sections
          "/admin/",
          "/dashboard/",
          "/auth/",
          "/seller/",
          // User-specific pages — different per session, no indexing value
          "/wishlist",
          // Internal API routes
          "/api/",
          // Redirect pages (crawl budget waste)
          "/browse",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
