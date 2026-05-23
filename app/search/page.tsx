"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronUp, X, MapPin, Clock, Eye, SlidersHorizontal, Loader2 } from "lucide-react";
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
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-dark-border py-4">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full mb-3">
        <span className="text-[11px] font-bold tracking-widest uppercase text-white">{title}</span>
        {open ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
      </button>
      {open && children}
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
  const [category,  setCategory]  = useState(searchParams.get("category")  ?? "");
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
  const Sidebar = () => (
    <aside className="space-y-0">
      <div className="flex items-center justify-between mb-2 py-2">
        <span className="text-[15px] font-bold text-white">Filters</span>
        {hasFilters && (
          <button onClick={clearAll} className="text-[12px] text-brand-orange font-medium hover:opacity-70">
            Clear all
          </button>
        )}
      </div>

      <FilterSection title="Listing Type">
        <div className="space-y-2">
          {[
            { id: "" as const,        label: "All listings" },
            { id: "PART" as const,    label: "Parts" },
            { id: "SERVICE" as const, label: "Services" },
            { id: "CAR" as const,     label: "Cars for Sale" },
          ].map((t) => (
            <label key={t.id || "all"} className="flex items-center gap-2.5 cursor-pointer">
              <input type="radio" name="ltype" checked={type === t.id} onChange={() => changeType(t.id)} className="accent-brand-orange" />
              <span className={cn("text-[13px]", type === t.id ? "text-white font-semibold" : "text-gray-400")}>{t.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Type-specific sub-filter */}
      {type === "SERVICE" && (
        <FilterSection title="Service">
          <select className="input w-full text-[13px]" value={service} onChange={(e) => setService(e.target.value)}>
            <option value="">All services</option>
            {SERVICE_CATEGORIES.map((s) => (
              <option key={s.slug} value={s.slug}>{s.name}</option>
            ))}
          </select>
        </FilterSection>
      )}

      {type === "CAR" && (
        <FilterSection title="Body Type">
          <select className="input w-full text-[13px]" value={body} onChange={(e) => setBody(e.target.value)}>
            <option value="">All body types</option>
            {CAR_BODY_TYPES.map((b) => (
              <option key={b.slug} value={b.slug}>{b.name}</option>
            ))}
          </select>
        </FilterSection>
      )}

      <FilterSection title="Category">
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="radio" name="cat" checked={!category} onChange={() => setCategory("")} className="accent-brand-orange" />
            <span className="text-[13px] text-gray-400">All categories</span>
          </label>
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2.5 cursor-pointer">
              <input type="radio" name="cat" checked={category === c.slug} onChange={() => setCategory(c.slug)} className="accent-brand-orange" />
              <span className={cn("text-[13px]", category === c.slug ? "text-white font-semibold" : "text-gray-400")}>
                {c.name}
              </span>
              <span className="ml-auto text-[11px] text-gray-600">{c._count?.products ?? 0}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Car Make">
        <select
          className="input w-full text-[13px]"
          value={carMake}
          onChange={(e) => setCarMake(e.target.value)}
        >
          <option value="">Any make</option>
          {CAR_MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </FilterSection>

      {carMake && (
        <FilterSection title="Car Model">
          <input
            className="input w-full text-[13px]"
            placeholder="e.g. Land Cruiser"
            value={carModel}
            onChange={(e) => setCarModel(e.target.value)}
          />
        </FilterSection>
      )}

      <FilterSection title="Condition">
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="radio" name="cond" checked={!condition} onChange={() => setCondition("")} className="accent-brand-orange" />
            <span className="text-[13px] text-gray-400">Any condition</span>
          </label>
          {CONDITIONS.map((c) => (
            <label key={c.value} className="flex items-center gap-2.5 cursor-pointer">
              <input type="radio" name="cond" checked={condition === c.value} onChange={() => setCondition(c.value)} className="accent-brand-orange" />
              <span className={cn("text-[13px]", condition === c.value ? "text-white font-semibold" : "text-gray-400")}>{c.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range (QAR)">
        <div className="flex gap-2">
          <input type="number" min="0" className="input flex-1 text-[13px]" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          <input type="number" min="0" className="input flex-1 text-[13px]" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        </div>
        <button onClick={applyFilters} className="w-full h-9 mt-3 bg-brand-orange text-white text-[13px] font-semibold rounded-lg hover:bg-[#e64d00] transition-colors">
          Apply Filters
        </button>
      </FilterSection>
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
        <div className="w-[218px] flex-shrink-0 hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-dark-secondary p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-white">Filters</span>
                <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
              </div>
              <Sidebar />
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
