import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Condition } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = "QAR") {
  return `${currency} ${amount.toLocaleString("en-QA")}`;
}

export function conditionLabel(c: Condition) {
  return { NEW: "New", LIKE_NEW: "Like New", USED: "Used" }[c];
}

export function conditionColor(c: Condition) {
  return {
    NEW:      "bg-green-600 text-white",
    LIKE_NEW: "bg-brand-orange text-white",
    USED:     "bg-dark-input text-gray-300",
  }[c];
}

export function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

export function primaryImage(images: { url: string; isPrimary: boolean }[]) {
  return images.find((i) => i.isPrimary)?.url ?? images[0]?.url ?? "/images/placeholder.jpg";
}
