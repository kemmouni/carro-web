/**
 * Injects a JSON-LD <script> block into the page <head>.
 * Safe for Server Components — no client JS needed.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ── Pre-built schemas ────────────────────────────────────────────────────────

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://warsha.plus";

/** Organization schema for the homepage / brand identity */
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type":    "Organization",
  name:        "Warsha+",
  url:         BASE,
  logo:        `${BASE}/logo.png`,
  description: "Qatar's #1 marketplace for quality auto parts. 2,000+ verified sellers across Doha and beyond.",
  address: {
    "@type":          "PostalAddress",
    addressLocality:  "Doha",
    addressCountry:   "QA",
  },
  contactPoint: {
    "@type":       "ContactPoint",
    contactType:   "customer support",
    email:         "support@warsha.plus",
    availableLanguage: ["English", "Arabic"],
  },
  sameAs: [
    "https://www.instagram.com/warsha.plus",
    "https://twitter.com/warshaplus",
  ],
};

/** WebSite schema — enables Google's Sitelinks Search Box */
export const websiteSchema = {
  "@context":      "https://schema.org",
  "@type":         "WebSite",
  name:            "Warsha+",
  url:             BASE,
  potentialAction: {
    "@type":       "SearchAction",
    target:        { "@type": "EntryPoint", urlTemplate: `${BASE}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

/** Product schema for individual listing pages */
export function buildProductSchema(p: {
  id:          string;
  title:       string;
  description?: string | null;
  price:       number;
  currency?:   string | null;
  condition:   string;
  brand?:      string | null;
  imageUrl?:   string | null;
  storeName?:  string | null;
  storeSlug?:  string | null;
  createdAt:   string;
}) {
  const conditionMap: Record<string, string> = {
    NEW:      "https://schema.org/NewCondition",
    LIKE_NEW: "https://schema.org/LikeNewCondition",
    USED:     "https://schema.org/UsedCondition",
  };

  return {
    "@context":   "https://schema.org",
    "@type":      "Product",
    name:          p.title,
    description:   p.description ?? p.title,
    image:         p.imageUrl ? [p.imageUrl] : undefined,
    brand:         p.brand ? { "@type": "Brand", name: p.brand } : undefined,
    itemCondition: conditionMap[p.condition] ?? "https://schema.org/UsedCondition",
    offers: {
      "@type":       "Offer",
      url:           `${BASE}/product/${p.id}`,
      priceCurrency: p.currency ?? "QAR",
      price:         p.price,
      availability:  "https://schema.org/InStock",
      seller:        p.storeName
        ? { "@type": "Organization", name: p.storeName, url: p.storeSlug ? `${BASE}/store/${p.storeSlug}` : undefined }
        : undefined,
    },
  };
}
