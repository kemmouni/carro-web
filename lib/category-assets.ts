/**
 * Maps category slug keywords → Unsplash photo URL
 * Used as fallback when category.imageUrl is not set in the DB
 */
// AI-generated images (gpt-image-1) stored locally in /public/images/
export const CATEGORY_IMAGES: Record<string, string> = {
  "engine":       "/images/categories/engine.jpg",
  "drivetrain":   "/images/categories/engine.jpg",
  "transmission": "/images/categories/engine.jpg",
  "brake":        "/images/categories/brakes.jpg",
  "suspension":   "/images/categories/suspension.jpg",
  "electrical":   "/images/categories/electrical.jpg",
  "lighting":     "/images/categories/electrical.jpg",
  "ac":           "/images/categories/ac.jpg",
  "heating":      "/images/categories/ac.jpg",
  "filter":       "/images/categories/filters.jpg",
  "fluid":        "/images/categories/filters.jpg",
  "body":         "/images/categories/body.jpg",
  "exterior":     "/images/categories/body.jpg",
  "interior":     "/images/categories/interior.jpg",
  "accessori":    "/images/categories/interior.jpg",
  "wheel":        "/images/categories/wheels.jpg",
  "tire":         "/images/categories/wheels.jpg",
  "exhaust":      "/images/categories/exhaust.jpg",
};

/** Returns the best matching image URL for a category slug */
export function getCategoryImage(slug: string): string | null {
  const lower = slug.toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_IMAGES)) {
    if (lower.includes(key)) return url;
  }
  return null;
}

/**
 * Car brand data: name, domain for logo, and search link
 */
export const CAR_BRANDS = [
  { name: "Toyota",       domain: "toyota.com",        make: "Toyota"       },
  { name: "Nissan",       domain: "nissan.com",         make: "Nissan"       },
  { name: "BMW",          domain: "bmw.com",            make: "BMW"          },
  { name: "Mercedes-Benz",domain: "mercedes-benz.com",  make: "Mercedes-Benz"},
  { name: "Lexus",        domain: "lexus.com",          make: "Lexus"        },
  { name: "Honda",        domain: "honda.com",          make: "Honda"        },
  { name: "KIA",          domain: "kia.com",            make: "KIA"          },
  { name: "Hyundai",      domain: "hyundai.com",        make: "Hyundai"      },
  { name: "Ford",         domain: "ford.com",           make: "Ford"         },
  { name: "Audi",         domain: "audi.com",           make: "Audi"         },
];
