"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronUp, X, MapPin, Clock, Eye, SlidersHorizontal, Loader2, Search, Sparkles } from "lucide-react";
import { cn, formatPrice, timeAgo } from "@/lib/utils";
import { ConditionBadge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import type { Product, Category } from "@/lib/types";
import { SERVICE_CATEGORIES, CAR_BODY_TYPES, type ListingType } from "@/lib/listing-types";

const CAR_MAKES  = ["Toyota", "Nissan", "BMW", "Mercedes-Benz", "Lexus", "Honda", "KIA", "Hyundai", "Ford", "Chevrolet", "Audi", "Volkswagen"];
const CONDITIONS = [{ value: "NEW", label: "New" }, { value: "LIKE_NEW", label: "Like New" }, { value: "USED", label: "Used" }];

// URL slug for ?type=... param
function typeToSlug(t: ListingType | ""): string {
  if (t === "SERVICE") return "services";
  if (t === "CAR") return "cars";
  if (t === "PART") return "parts";
  return "";
}
function slugToType(s: string | null): ListingType | "" {
  if (s === "services") return "SERVICE";
  if (s === "cars") return "CAR";
  if (s === "parts") return "PART";
  return "";
}

// ── Listing card ───────────────────────────────────────────
function ListingCard({ product: p }: { product: Product }) {
  const img = p.images[0]?.url;

  return (
    <Link href={`/product/${p.id}`} className="card card-hover group block overflow-hidden">
      <div className="relative aspect-square bg-dark-secondary overflow-hidden">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={p.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-700">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
        )}
        <div className="absolute top-2 left-2"><ConditionBadge condition={p.condition} /></div>
      </div>
      <div className="p-3.5">
        <h3 className="text-[13px] font-semibold text-white leading-snug mb-2 line-clamp-2">{p.title}</h3>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-[18px] font-black text-brand-orange">{formatPrice(p.price, p.currency)}</span>
          {p.originalPrice && <span className="text-[12px] text-gray-500 line-through">{formatPrice(p.originalPrice, p.currency)}</span>}
        </div>
        {p.store && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-dark-secondary border border-dark-border flex items-center justify-center text-[9px] font-bold text-brand-orange flex-shrink-0">
              {p.store.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-gray-300 truncate">{p.store.name}</p>
              {(p.store.avgRating ?? 0) > 0 && <StarRating rating={p.store.avgRating!} count={p.store._count?.reviews} size={10} />}
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          {p.store?.city && <span className="flex items-center gap-1"><MapPin size={9} />{p.store.city}</span>}
          <span className="flex items-center gap-1"><Clock size={9} />{timeAgo(p.createdAt)}</span>
          <span className="flex items-center gap-1"><Eye size={9} />{p.viewCount}</span>
        </div>
      </div>
    </Link>
  );
}

// ── Filter section ─────────────────────────────────────────
function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-dark-border/60 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3.5 group"
      >
        <span className="text-[12px] font-semibold text-gray-300 group-hover:text-white transition-colors">{title}</span>
        <div className={cn("w-5 h-5 rounded-full flex items-center justify-center transition-all", open ? "bg-brand-orange/20 text-brand-orange" : "bg-dark-border text-gray-500")}>
          {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </div>
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

// ── Main search component ──────────────────────────────────
function SearchContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  // Filters from URL
  const [q,         setQ]         = useState(searchParams.get("q")         ?? "");
  const [type,      setType]      = useState<ListingType | "">(slugToType(searchParams.get("type")));
  const [service,   setService]   = useState(searchParams.get("service")   ?? "");
  const [body,      setBody]      = useState(searchParams.get("body")      ?? "");
  // Category is only valid for PART listings — ignore it from URL when type is CAR/SERVICE
  const urlType = slugToType(searchParams.get("type"));
  const [category,  setCategory]  = useState(
    (urlType === "" || urlType === "PART") ? (searchParams.get("category") ?? "") : ""
  );
  const [carMake,   setCarMake]   = useState(searchParams.get("carMake")   ?? "");
  const [carModel,  setCarModel]  = useState(searchParams.get("carModel")  ?? "");
  const [condition, setCondition] = useState(searchParams.get("condition") ?? "");
  const [minPrice,  setMinPrice]  = useState(searchParams.get("minPrice")  ?? "");
  const [maxPrice,  setMaxPrice]  = useState(searchParams.get("maxPrice")  ?? "");
  const [sort,      setSort]      = useState(searchParams.get("sort")      ?? "newest");
  const [page,      setPage]      = useState(1);

  // Data
  const [products,   setProducts]   = useState<Product[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load categories once
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((j) => j.success && setCategories(j.data))
      .catch(() => {});
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q)         params.set("q", q);
    if (type)      params.set("type", typeToSlug(type));
    if (service)   params.set("service", service);
    if (body)      params.set("body", body);
    if (category)  params.set("category", category);
    if (carMake)   params.set("carMake", carMake);
    if (carModel)  params.set("carModel", carModel);
    if (condition) params.set("condition", condition);
    if (minPrice)  params.set("minPrice", minPrice);
    if (maxPrice)  params.set("maxPrice", maxPrice);
    params.set("sort",  sort);
    params.set("page",  String(page));
    params.set("limit", "24");

    try {
      const res  = await fetch(`/api/products?${params}`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data ?? []);
        setTotal(json.pagination?.total ?? 0);
        setTotalPages(json.pagination?.pages ?? 1);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [q, type, service, body, category, carMake, carModel, condition, minPrice, maxPrice, sort, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Sync active filters back to URL
  function applyFilters() {
    const params = new URLSearchParams();
    if (q)         params.set("q",        q);
    if (type)      params.set("type",     typeToSlug(type));
    if (service)   params.set("service",  service);
    if (body)      params.set("body",     body);
    if (category)  params.set("category", category);
    if (carMake)   params.set("carMake",  carMake);
    if (carModel)  params.set("carModel", carModel);
    if (condition) params.set("condition",condition);
    if (minPrice)  params.set("minPrice", minPrice);
    if (maxPrice)  params.set("maxPrice", maxPrice);
    params.set("sort", sort);
    router.push(`/search?${params}`, { scroll: false });
    setPage(1);
    setSidebarOpen(false);
  }

  function clearAll() {
    setQ(""); setType(""); setService(""); setBody("");
    setCategory(""); setCarMake(""); setCarModel("");
    setCondition(""); setMinPrice(""); setMaxPrice(""); setSort("newest");
    setPage(1);
    router.push("/search", { scroll: false });
  }

  // Auto-apply filter when type/service/body changes (clearing type-specific subfilters)
  function changeType(newType: ListingType | "") {
    setType(newType);
    setService(""); setBody(""); setCategory(""); setCarMake(""); setCarModel("");
    setCondition("");
    setPage(1);
  }

  const hasFilters = !!(q || type || service || body || category || carMake || carModel || condition || minPrice || maxPrice);

  const serviceName = SERVICE_CATEGORIES.find((s) => s.slug === service)?.name ?? service;
  const bodyName = CAR_BODY_TYPES.find((b) => b.slug === body)?.name ?? body;
  const typeName = type === "PART" ? "Parts" : type === "SERVICE" ? "Services" : type === "CAR" ? "Cars" : "";

  const activeTags = [
    q        && { label: q,         clear: () => setQ("") },
    typeName && { label: typeName,  clear: () => changeType("") },
    service  && { label: serviceName,  clear: () => setService("") },
    body     && { label: bodyName,  clear: () => setBody("") },
    category && { label: categories.find((c) => c.slug === category)?.name ?? category, clear: () => setCategory("") },
    carMake  && { label: carMake,   clear: () => setCarMake("") },
    carModel && { label: carModel,  clear: () => setCarModel("") },
    condition && { label: condition.replace("_", " "), clear: () => setCondition("") },
    (minPrice || maxPrice) && { label: `QAR ${minPrice || "0"} – ${maxPrice || "∞"}`, clear: () => { setMinPrice(""); setMaxPrice(""); } },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  // ── Sidebar filters ──────────────────────────────────────
  const activeCount = activeTags.length;

  const Sidebar = () => (
    <aside className="rounded-2xl bg-dark-card border border-dark-border/60 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-dark-border/60 bg-dark-secondary/40">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-brand-orange" />
          <span className="text-[14px] font-bold text-white">Filters</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand-orange text-white text-[10px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-[11px] text-gray-400 hover:text-brand-orange font-medium transition-colors flex items-center gap-1"
          >
            <X size={11} /> Clear all
          </button>
        )}
      </div>

      <div className="px-4 divide-y divide-dark-border/40">

        {/* Listing Type — pill toggle */}
        <FilterSection title="Listing Type">
          <div className="grid grid-cols-2 gap-1.5">
            {([
              { id: "" as const,        label: "All",      emoji: "🔍" },
              { id: "PART" as const,    label: "Parts",    emoji: "⚙️" },
              { id: "SERVICE" as const, label: "Services", emoji: "🔧" },
              { id: "CAR" as const,     label: "Cars",     emoji: "🚗" },
            ] as const).map((t) => (
              <button
                key={t.id || "all"}
                onClick={() => changeType(t.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all border",
                  type === t.id
                    ? "bg-brand-orange text-white border-brand-orange shadow-sm shadow-brand-orange/25"
                    : "bg-dark-secondary border-dark-border text-gray-400 hover:border-gray-500 hover:text-gray-200"
                )}
              >
                <span className="text-[13px]">{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Service sub-filter */}
        {type === "SERVICE" && (
          <FilterSection title="Service Category">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setService("")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border",
                  !service ? "bg-brand-orange/20 border-brand-orange/40 text-brand-orange" : "bg-dark-secondary border-dark-border text-gray-400 hover:border-gray-500"
                )}
              >All</button>
              {SERVICE_CATEGORIES.map((s) => (
                <button
                  key={s.slug}
                  onClick={() => setService(s.slug)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border",
                    service === s.slug ? "bg-brand-orange/20 border-brand-orange/40 text-brand-orange" : "bg-dark-secondary border-dark-border text-gray-400 hover:border-gray-500"
                  )}
                >{s.name}</button>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Body Type sub-filter */}
        {type === "CAR" && (
          <FilterSection title="Body Type">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setBody("")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border",
                  !body ? "bg-brand-orange/20 border-brand-orange/40 text-brand-orange" : "bg-dark-secondary border-dark-border text-gray-400 hover:border-gray-500"
                )}
              >Any</button>
              {CAR_BODY_TYPES.map((b) => (
                <button
                  key={b.slug}
                  onClick={() => setBody(b.slug)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border",
                    body === b.slug ? "bg-brand-orange/20 border-brand-orange/40 text-brand-orange" : "bg-dark-secondary border-dark-border text-gray-400 hover:border-gray-500"
                  )}
                >{b.name}</button>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Category — only relevant for Parts */}
        {(type === "" || type === "PART") && (
        <FilterSection title="Category">
          <div className="space-y-0.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
            <button
              onClick={() => setCategory("")}
              className={cn(
                "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[12px] transition-all",
                !category ? "bg-brand-orange/15 text-brand-orange font-semibold" : "text-gray-400 hover:bg-dark-secondary hover:text-gray-200"
              )}
            >
              <span>All categories</span>
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.slug)}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[12px] transition-all",
                  category === c.slug ? "bg-brand-orange/15 text-brand-orange font-semibold" : "text-gray-400 hover:bg-dark-secondary hover:text-gray-200"
                )}
              >
                <span className="text-left leading-snug">{c.name}</span>
                {(c._count?.products ?? 0) > 0 && (
                  <span className={cn("text-[10px] tabular-nums flex-shrink-0 ml-2", category === c.slug ? "text-brand-orange/70" : "text-gray-600")}>
                    {c._count?.products}
                  </span>
                )}
              </button>
            ))}
          </div>
        </FilterSection>
        )}

        {/* Car Make */}
        <FilterSection title="Car Make">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setCarMake("")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border",
                !carMake ? "bg-brand-orange/20 border-brand-orange/40 text-brand-orange" : "bg-dark-secondary border-dark-border text-gray-400 hover:border-gray-500"
              )}
            >Any</button>
            {CAR_MAKES.map((m) => (
              <button
                key={m}
                onClick={() => setCarMake(carMake === m ? "" : m)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border",
                  carMake === m ? "bg-brand-orange/20 border-brand-orange/40 text-brand-orange" : "bg-dark-secondary border-dark-border text-gray-400 hover:border-gray-500"
                )}
              >{m}</button>
            ))}
          </div>
        </FilterSection>

        {/* Car Model (shown only when make is selected) */}
        {carMake && (
          <FilterSection title={`${carMake} Model`}>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                className="input w-full text-[13px] pl-8"
                placeholder="e.g. Land Cruiser"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
              />
            </div>
          </FilterSection>
        )}

        {/* Condition — pill chips */}
        <FilterSection title="Condition">
          <div className="flex gap-2">
            {[
              { value: "", label: "Any" },
              { value: "NEW", label: "New" },
              { value: "LIKE_NEW", label: "Like New" },
              { value: "USED", label: "Used" },
            ].map((c) => (
              <button
                key={c.value}
                onClick={() => setCondition(c.value)}
                className={cn(
                  "flex-1 py-2 rounded-xl text-[11px] font-semibold transition-all border",
                  condition === c.value
                    ? "bg-brand-orange text-white border-brand-orange shadow-sm shadow-brand-orange/25"
                    : "bg-dark-secondary border-dark-border text-gray-400 hover:border-gray-500 hover:text-gray-200"
                )}
              >{c.label}</button>
            ))}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection title="Price Range (QAR)">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-medium">Min</span>
              <input
                type="number"
                min="0"
                className="input w-full text-[12px] pl-8 text-right"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div className="w-3 h-px bg-dark-border flex-shrink-0" />
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-medium">Max</span>
              <input
                type="number"
                min="0"
                className="input w-full text-[12px] pl-8 text-right"
                placeholder="Any"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Quick price presets */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {[
              { label: "Under 500", min: "", max: "500" },
              { label: "500–2K",    min: "500",  max: "2000" },
              { label: "2K–10K",   min: "2000", max: "10000" },
              { label: "10K+",     min: "10000", max: "" },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => { setMinPrice(p.min); setMaxPrice(p.max); }}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border",
                  minPrice === p.min && maxPrice === p.max
                    ? "bg-brand-orange/20 border-brand-orange/40 text-brand-orange"
                    : "bg-dark-secondary border-dark-border text-gray-400 hover:border-gray-500"
                )}
              >{p.label}</button>
            ))}
          </div>
        </FilterSection>

      </div>

      {/* Apply button — sticky at bottom */}
      <div className="px-4 py-3.5 bg-dark-secondary/40 border-t border-dark-border/60">
        <button
          onClick={applyFilters}
          className="w-full h-10 bg-brand-orange hover:bg-[#e64d00] text-white text-[13px] font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles size={14} />
          Apply Filters
          {activeCount > 0 && <span className="w-5 h-5 rounded-full bg-white/20 text-white text-[10px] font-bold flex items-center justify-center">{activeCount}</span>}
        </button>
      </div>

    </aside>
  );

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-7 min-h-screen">

      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          className="input flex-1"
          placeholder="Search parts, brands, models…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
        />
        <button onClick={applyFilters} className="h-11 px-6 bg-brand-orange hover:bg-[#e64d00] text-white font-bold rounded-xl transition-colors">
          Search
        </button>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden h-11 px-4 bg-dark-card border border-dark-border rounded-xl text-white hover:border-brand-orange transition-colors flex items-center gap-2"
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>

      <div className="flex gap-6">

        {/* Sidebar — desktop */}
        <div className="w-[240px] flex-shrink-0 hidden lg:block">
          <div className="sticky top-4">
            <Sidebar />
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-dark-primary overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between px-4 py-4 border-b border-dark-border sticky top-0 bg-dark-primary z-10">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={15} className="text-brand-orange" />
                  <span className="font-bold text-white">Filters</span>
                  {activeCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-brand-orange text-white text-[10px] font-bold flex items-center justify-center">{activeCount}</span>
                  )}
                </div>
                <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-lg bg-dark-secondary flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-4">
                <Sidebar />
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 gap-4">
            <div>
              <h1 className="text-[22px] font-black">
                {q
                  ? `"${q}"`
                  : service
                    ? serviceName
                    : body
                      ? bodyName
                      : category
                        ? (categories.find((c) => c.slug === category)?.name ?? "Listings")
                        : type === "SERVICE"
                          ? "Available Services"
                          : type === "CAR"
                            ? "Cars for Sale"
                            : type === "PART"
                              ? "Auto Parts"
                              : "All Listings"}
              </h1>
              <p className="text-[13px] text-gray-400 mt-0.5">
                {loading ? "Loading…" : `${total.toLocaleString()} result${total !== 1 ? "s" : ""}`}
              </p>
            </div>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="h-9 bg-dark-card border border-dark-border rounded-lg px-3 text-[13px] text-white min-w-[160px] focus:outline-none focus:border-brand-orange flex-shrink-0"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="views">Most Viewed</option>
              <option value="deals">Special Offers</option>
            </select>
          </div>

          {/* Active filter chips */}
          {activeTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-5">
              {activeTags.map((tag) => (
                <span key={tag.label} className="flex items-center gap-1.5 px-3 py-1 bg-brand-orange-light border border-brand-orange/30 rounded-lg text-[12px] text-brand-orange font-medium">
                  {tag.label}
                  <button onClick={() => { tag.clear(); setPage(1); }} className="opacity-60 hover:opacity-100">
                    <X size={12} />
                  </button>
                </span>
              ))}
              <button onClick={clearAll} className="text-[12px] text-gray-400 hover:text-brand-orange transition-colors">Clear all</button>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={32} className="animate-spin text-brand-orange" />
            </div>
          ) : products.length === 0 ? (
            <div className="card py-20 text-center">
              <p className="text-gray-400 font-semibold mb-2">No listings found</p>
              <p className="text-gray-600 text-[13px]">Try removing some filters or searching for something else.</p>
              {hasFilters && (
                <button onClick={clearAll} className="mt-4 text-brand-orange text-[13px] font-semibold hover:opacity-80">
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {products.map((p) => <ListingCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-dark-card border border-dark-border text-gray-300 hover:border-brand-orange hover:text-brand-orange disabled:opacity-40 disabled:cursor-not-allowed"
              >‹</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "w-9 h-9 flex items-center justify-center rounded-lg text-[13px] font-semibold transition-colors",
                      p === page ? "bg-brand-orange text-white" : "bg-dark-card border border-dark-border text-gray-300 hover:border-brand-orange hover:text-brand-orange"
                    )}
                  >{p}</button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-dark-card border border-dark-border text-gray-300 hover:border-brand-orange hover:text-brand-orange disabled:opacity-40 disabled:cursor-not-allowed"
              >›</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
