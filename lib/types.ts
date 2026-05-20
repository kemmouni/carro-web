// ─── Shared TypeScript types ──────────────────────────────

export type Condition = "NEW" | "LIKE_NEW" | "USED";
export type UserRole  = "BUYER" | "SELLER" | "ADMIN";
export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface Category {
  id:          string;
  name:        string;
  slug:        string;
  imageUrl?:   string;
  description?: string;
  parentId?:   string;
  children?:   Category[];
  _count?:     { products: number };
}

export interface Store {
  id:           string;
  name:         string;
  slug:         string;
  description?: string;
  logoUrl?:     string;
  coverUrl?:    string;
  phone?:       string;
  email?:       string;
  website?:     string;
  address?:     string;
  city:         string;
  country:      string;
  lat?:         number;
  lng?:         number;
  workingHours?: string;
  isVerified:   boolean;
  responseRate: number;
  totalSales:   number;
  createdAt:    string;
  _count?:      { products: number; reviews: number };
  avgRating?:   number;
}

export interface ProductImage {
  id:        string;
  url:       string;
  altText?:  string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Product {
  id:            string;
  storeId:       string;
  store:         Store;
  categoryId:    string;
  category:      Category;
  title:         string;
  slug:          string;
  description?:  string;
  price:         number;
  originalPrice?: number;
  currency:      string;
  condition:     Condition;
  partNumber?:   string;
  brand?:        string;
  carMake?:      string;
  carModel?:     string;
  carYear?:      number;
  carYearTo?:    number;
  images:        ProductImage[];
  isActive:      boolean;
  isFeatured:    boolean;
  viewCount:     number;
  createdAt:     string;
}

export interface Review {
  id:        string;
  userId:    string;
  user:      { id: string; fullName?: string; avatarUrl?: string };
  storeId:   string;
  rating:    number;
  comment?:  string;
  createdAt: string;
}

export interface Brand {
  id:          string;
  name:        string;
  slug:        string;
  logoUrl?:    string;
  country?:    string;
  isPopular:   boolean;
  sortOrder:   number;
  createdAt:   string;
}

// ─── API response wrappers ────────────────────────────────
export interface ApiResponse<T> {
  data:    T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data:       T[];
  total:      number;
  page:       number;
  perPage:    number;
  totalPages: number;
}

// ─── Search / filter params ───────────────────────────────
export interface ProductFilters {
  query?:       string;
  categoryId?:  string;
  brand?:       string;
  carMake?:     string;
  carModel?:    string;
  carYear?:     number;
  condition?:   Condition;
  minPrice?:    number;
  maxPrice?:    number;
  city?:        string;
  sortBy?:      "relevance" | "price_asc" | "price_desc" | "newest" | "most_viewed";
  page?:        number;
  perPage?:     number;
}
