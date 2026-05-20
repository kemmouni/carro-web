/**
 * Maps category slug keywords → Unsplash photo URL
 * Used as fallback when category.imageUrl is not set in the DB
 */
export const CATEGORY_IMAGES: Record<string, string> = {
  "engine":       "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop&auto=format&q=80",
  "drivetrain":   "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop&auto=format&q=80",
  "brake":        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format&q=80",
  "suspension":   "https://images.unsplash.com/photo-1615906655353-58b6aeebab6f?w=600&h=400&fit=crop&auto=format&q=80",
  "electrical":   "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=400&fit=crop&auto=format&q=80",
  "lighting":     "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=400&fit=crop&auto=format&q=80",
  "ac":           "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&h=400&fit=crop&auto=format&q=80",
  "heating":      "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&h=400&fit=crop&auto=format&q=80",
  "filter":       "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&h=400&fit=crop&auto=format&q=80",
  "fluid":        "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&h=400&fit=crop&auto=format&q=80",
  "body":         "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop&auto=format&q=80",
  "exterior":     "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop&auto=format&q=80",
  "interior":     "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=400&fit=crop&auto=format&q=80",
  "accessori":    "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=400&fit=crop&auto=format&q=80",
  "wheel":        "https://images.unsplash.com/photo-1611143999486-a6fb95ddf9c3?w=600&h=400&fit=crop&auto=format&q=80",
  "tire":         "https://images.unsplash.com/photo-1611143999486-a6fb95ddf9c3?w=600&h=400&fit=crop&auto=format&q=80",
  "exhaust":      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&h=400&fit=crop&auto=format&q=80",
  "transmission": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop&auto=format&q=80",
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
