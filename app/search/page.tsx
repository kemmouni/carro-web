"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronUp, X, MapPin, Clock, Eye, Heart, SlidersHorizontal } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { ConditionBadge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import type { Product, Condition } from "@/lib/types";

// ── Mock data ──────────────────────────────────────────────
const MOCK_STORE = {
  id:"s1", name:"Auto Parts Doha", slug:"auto-parts-doha",
  city:"Doha", country:"Qatar", isVerified:true,
  responseRate:98, totalSales:342, avgRating:4.8,
  logoUrl:"", coverUrl:"", description:"",
  workingHours:"", phone:"", email:"", website:"",
  address:"", lat:0, lng:0, createdAt:new Date().toISOString(),
  _count:{ products:156, reviews:128 },
};

const mock = (id:string, title:string, price:number, oldPrice:number, cond:Condition, seller:string, rating:number, reviews:number, hours:string, views:number): Product => ({
  id, storeId:"s1",
  store:{ ...MOCK_STORE, id:"s"+id, name:seller, avgRating:rating, _count:{ products:100, reviews } },
  categoryId:"c4",
  category:{ id:"c4", name:"AC & Heating", slug:"ac-heating" },
  title, slug:id,
  price, originalPrice:oldPrice, currency:"QAR",
  condition:cond, partNumber:"88320-6A320",
  brand:"Toyota", carMake:"Toyota", carModel:"Land Cruiser",
  carYear:2016, carYearTo:2020,
  images:[{ id:"i"+id, url:"/images/ac-compressor.jpg", isPrimary:true, sortOrder:0 }],
  isActive:true, isFeatured:false, viewCount:views,
  createdAt:new Date(Date.now() - parseInt(hours)*3600000).toISOString(),
});

const PRODUCTS: Product[] = [
  mock("p1","OEM AC Compressor — Toyota Land Cruiser 2016",850,1450,"LIKE_NEW","Auto Parts Doha",4.8,128,"2",24),
  mock("p2","OEM AC Compressor — Toyota Land Cruiser 2016",650,1150,"USED","Parts Zone Qatar",4.6,86,"3",18),
  mock("p3","OEM AC Compressor — Toyota Land Cruiser 2016",950,1600,"LIKE_NEW","Qatar Auto Parts",4.9,203,"5",31),
  mock("p4","OEM AC Compressor — Toyota Land Cruiser 2016",550,950,"USED","Speed Auto Parts",4.4,74,"6",15),
  mock("p5","OEM AC Compressor — Toyota Land Cruiser 2016",900,1500,"LIKE_NEW","Doha Parts Center",4.7,112,"7",27),
  mock("p6","OEM AC Compressor — Toyota Land Cruiser 2016",700,1200,"USED","Auto Hub Qatar",4.5,65,"8",13),
];

// ── Filter sidebar ─────────────────────────────────────────
interface FilterGroup {
  label:   string;
  options: { id: string; label: string; count: number }[];
}

const FILTER_GROUPS: FilterGroup[] = [
  { label:"Category",  options:[{id:"c-eng",label:"Engine",count:234},{id:"c-ac",label:"AC",count:63},{id:"c-elec",label:"Electrical",count:102},{id:"c-susp",label:"Suspension",count:87},{id:"c-brk",label:"Brakes",count:65}] },
  { label:"Brand",     options:[{id:"b-toyota",label:"Toyota",count:63},{id:"b-nissan",label:"Nissan",count:28},{id:"b-mit",label:"Mitsubishi",count:19},{id:"b-honda",label:"Honda",count:14},{id:"b-ford",label:"Ford",count:9}] },
  { label:"Model",     options:[{id:"m-lc",label:"Land Cruiser",count:63},{id:"m-prado",label:"Prado",count:21},{id:"m-hilux",label:"Hilux",count:18},{id:"m-camry",label:"Camry",count:12},{id:"m-cor",label:"Corolla",count:10}] },
  { label:"Year",      options:[{id:"y-2016",label:"2016",count:63},{id:"y-2015",label:"2015",count:42},{id:"y-2017",label:"2017",count:38},{id:"y-2014",label:"2014",count:25},{id:"y-2018",label:"2018",count:19}] },
  { label:"Condition", options:[{id:"cond-ln",label:"Like New",count:21},{id:"cond-used",label:"Used",count:32},{id:"cond-new",label:"New",count:10}] },
  { label:"Location",  options:[{id:"loc-doha",label:"Doha",count:63},{id:"loc-ray",label:"Al Rayyan",count:28},{id:"loc-wak",label:"Al Wakrah",count:16},{id:"loc-sal",label:"Umm Salal",count:9},{id:"loc-khor",label:"Al Khor",count:7}] },
];

function FilterSection({ group, checked, toggle }: { group: FilterGroup; checked: Set<string>; toggle: (id: string) => void }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-dark-border py-4">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full mb-3">
        <span className="text-[11px] font-bold tracking-widest uppercase text-white">{group.label}</span>
        {open ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
      </button>
      {open && (
        <div className="space-y-2.5">
          {group.options.map((opt) => (
            <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={checked.has(opt.id)}
                onChange={() => toggle(opt.id)}
                className="accent-brand-orange w-3.5 h-3.5"
              />
              <span className={cn("flex-1 text-[13px]", checked.has(opt.id) ? "text-white font-semibold" : "text-gray-400 group-hover:text-gray-200")}>
                {opt.label}
              </span>
              <span className={cn("text-[11px]", checked.has(opt.id) ? "text-brand-orange" : "text-gray-600")}>
                {opt.count}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Listing card ───────────────────────────────────────────
function ListingCard({ product }: { product: Product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const hoursAgo = Math.floor((Date.now() - new Date(product.createdAt).getTime()) / 3600000);

  return (
    <Link href={`/product/${product.id}`} className="card card-hover group block overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square bg-dark-secondary overflow-hidden">
        <Image src={product.images[0].url} alt={product.title} fill className="object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
        <div className="absolute top-2 left-2"><ConditionBadge condition={product.condition} /></div>
        <button
          onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted); }}
          className={cn("absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-all",
            wishlisted ? "bg-brand-orange text-white" : "bg-black/50 text-gray-400 hover:text-brand-orange")}
        >
          <Heart size={13} fill={wishlisted ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Body */}
      <div className="p-3.5">
        <h3 className="text-[13px] font-semibold text-white leading-snug mb-2">{product.title}</h3>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-[18px] font-black text-brand-orange">{formatPrice(product.price, product.currency)}</span>
          {product.originalPrice && <span className="text-[12px] text-gray-500 line-through">{formatPrice(product.originalPrice, product.currency)}</span>}
        </div>

        {/* Seller */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-dark-secondary border border-dark-border flex items-center justify-center text-[9px] font-bold text-brand-orange flex-shrink-0">
            {product.store.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-gray-300 truncate">{product.store.name}</p>
            {product.store.avgRating && <StarRating rating={product.store.avgRating} count={product.store._count?.reviews} size={10} />}
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><MapPin size={9} />{product.store.city}</span>
          <span className="flex items-center gap-1"><Clock size={9} />{hoursAgo}h ago</span>
          <span className="flex items-center gap-1"><Eye size={9} />{product.viewCount} views</span>
        </div>
      </div>
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────
export default function SearchPage() {
  const [checked, setChecked] = useState<Set<string>>(new Set(["c-ac","b-toyota","m-lc","y-2016","cond-ln","loc-doha"]));
  const [activeTags, setActiveTags] = useState(["Toyota","Land Cruiser","2016","Doha"]);
  const [sort, setSort] = useState("Relevance");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggle = (id: string) => setChecked(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  return (
    <div className="max-w-screen-xl mx-auto px-6 flex gap-6 py-7 min-h-screen">

      {/* ── Sidebar ── */}
      <aside className={cn("w-[218px] flex-shrink-0 hidden lg:block")}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[15px] font-bold">Filters</span>
          <button onClick={() => setActiveTags([])} className="text-[12px] text-brand-orange font-medium hover:opacity-70">Clear all</button>
        </div>
        {FILTER_GROUPS.map((g) => (
          <FilterSection key={g.label} group={g} checked={checked} toggle={toggle} />
        ))}
        {/* Price Range */}
        <div className="border-b border-dark-border py-4">
          <p className="text-[11px] font-bold tracking-widest uppercase text-white mb-3">Price Range</p>
          <div className="flex justify-between text-[11px] text-gray-400 mb-2">
            <span>QAR 500</span><span>QAR 2,000</span>
          </div>
          <input type="range" min={0} max={5000} defaultValue={2000} className="w-full accent-brand-orange" />
          <button className="w-full h-9 mt-3 bg-brand-orange text-white text-[13px] font-semibold rounded-lg hover:bg-brand-orange-hover transition-colors">Apply</button>
        </div>
      </aside>

      {/* ── Results ── */}
      <div className="flex-1 min-w-0">

        {/* Results header */}
        <div className="flex items-start justify-between mb-4 gap-4">
          <div>
            <h1 className="text-[22px] font-black">AC Compressor</h1>
            <p className="text-[13px] text-gray-400 mt-0.5">63 results found</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[13px] text-gray-400 hidden sm:inline">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-9 bg-dark-card border border-dark-border rounded-lg px-3 text-[13px] text-white min-w-[140px] cursor-pointer focus:outline-none focus:border-brand-orange"
            >
              {["Relevance","Price: Low to High","Price: High to Low","Newest First","Most Viewed"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {/* Active filter chips */}
        {activeTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-5">
            {activeTags.map((tag) => (
              <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-brand-orange-light border border-brand-orange/30 rounded-lg text-[12px] text-brand-orange font-medium">
                {tag}
                <button onClick={() => setActiveTags(t => t.filter(x => x !== tag))} className="opacity-60 hover:opacity-100">
                  <X size={12} />
                </button>
              </span>
            ))}
            <button onClick={() => setActiveTags([])} className="text-[12px] text-gray-400 hover:text-brand-orange transition-colors">Clear all</button>
          </div>
        )}

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {PRODUCTS.map((p) => <ListingCard key={p.id} product={p} />)}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-10">
          {["‹", "1", "2", "3", "···", "6", "›"].map((pg, i) => (
            <button
              key={i}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-lg text-[13px] font-semibold transition-colors",
                pg === "1" ? "bg-brand-orange text-white" : "bg-dark-card border border-dark-border text-gray-300 hover:border-brand-orange hover:text-brand-orange",
                pg === "···" && "border-transparent bg-transparent cursor-default"
              )}
            >
              {pg}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
