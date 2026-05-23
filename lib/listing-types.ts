// ─────────────────────────────────────────────────────────────
// Listing-type catalog shared between web + mobile.
// Mirror of carro_mobile/lib/data/{service,car}_categories.dart
// ─────────────────────────────────────────────────────────────

export type ListingType = "PART" | "SERVICE" | "CAR";

export const LISTING_TYPES: {
  id: ListingType;
  label: string;
  labelAr: string;
  slug: string;
}[] = [
  { id: "PART", label: "Parts", labelAr: "قطع غيار", slug: "parts" },
  { id: "SERVICE", label: "Services", labelAr: "خدمات", slug: "services" },
  { id: "CAR", label: "Cars for Sale", labelAr: "سيارات للبيع", slug: "cars" },
];

export function listingTypeFromSlug(slug?: string | string[]): ListingType {
  const v = Array.isArray(slug) ? slug[0] : slug;
  if (v === "services") return "SERVICE";
  if (v === "cars") return "CAR";
  return "PART";
}

// ─────────────────────────────────────────────────────────────
// Service categories
// ─────────────────────────────────────────────────────────────
export interface ServiceCategory {
  slug: string;
  name: string;
  nameAr: string;
  iconName: string; // Lucide icon name
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { slug: "mechanic", name: "Mechanic", nameAr: "ميكانيكي", iconName: "wrench" },
  { slug: "inspection", name: "Inspection Garage", nameAr: "جاراج فحص", iconName: "clipboard-check" },
  { slug: "insurance", name: "Insurance", nameAr: "تأمين", iconName: "shield-check" },
  { slug: "detailing", name: "Detailing", nameAr: "تلميع", iconName: "sparkles" },
  { slug: "car-wash", name: "Car Wash", nameAr: "غسيل", iconName: "droplets" },
  { slug: "tires", name: "Tire Shop", nameAr: "إطارات", iconName: "circle-dot" },
  { slug: "body-shop", name: "Body Shop", nameAr: "سمكرة", iconName: "car" },
  { slug: "paint", name: "Paint Shop", nameAr: "دهان", iconName: "paint-bucket" },
  { slug: "ac-repair", name: "AC Repair", nameAr: "تكييف", iconName: "snowflake" },
  { slug: "battery", name: "Battery", nameAr: "بطاريات", iconName: "battery-charging" },
  { slug: "tow", name: "Tow Truck", nameAr: "سطحة", iconName: "truck" },
  { slug: "tinting", name: "Window Tinting", nameAr: "تظليل", iconName: "sun-dim" },
  { slug: "roadside", name: "Roadside Help", nameAr: "إنقاذ على الطريق", iconName: "life-buoy" },
  { slug: "glass", name: "Glass Repair", nameAr: "إصلاح زجاج", iconName: "square-dashed" },
  { slug: "alignment", name: "Wheel Alignment", nameAr: "محاذاة العجلات", iconName: "git-compare" },
  { slug: "oil-change", name: "Oil Change", nameAr: "تغيير زيت", iconName: "droplet" },
  { slug: "rental", name: "Car Rental", nameAr: "تأجير", iconName: "key-round" },
  { slug: "transport", name: "Transport", nameAr: "نقل", iconName: "truck" },
];

// ─────────────────────────────────────────────────────────────
// Car body types
// ─────────────────────────────────────────────────────────────
export interface CarBodyType {
  slug: string;
  name: string;
  nameAr: string;
  iconName: string;
}

export const CAR_BODY_TYPES: CarBodyType[] = [
  { slug: "sedan", name: "Sedan", nameAr: "سيدان", iconName: "car" },
  { slug: "suv", name: "SUV", nameAr: "دفع رباعي", iconName: "car-front" },
  { slug: "hatchback", name: "Hatchback", nameAr: "هاتشباك", iconName: "car" },
  { slug: "coupe", name: "Coupe", nameAr: "كوبيه", iconName: "car" },
  { slug: "pickup", name: "Pickup", nameAr: "بيك أب", iconName: "truck" },
  { slug: "van", name: "Van", nameAr: "فان", iconName: "truck" },
  { slug: "convertible", name: "Convertible", nameAr: "مكشوفة", iconName: "wind" },
  { slug: "sports", name: "Sports Car", nameAr: "رياضية", iconName: "zap" },
  { slug: "electric", name: "Electric", nameAr: "كهربائية", iconName: "battery-charging" },
  { slug: "luxury", name: "Luxury", nameAr: "فاخرة", iconName: "gem" },
  { slug: "classic", name: "Classic", nameAr: "كلاسيكية", iconName: "clock" },
  { slug: "commercial", name: "Commercial", nameAr: "تجارية", iconName: "briefcase" },
];
