"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Phone, Copy, MapPin, ChevronRight, Shield, BadgeCheck, Lock, ChevronLeft } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { ConditionBadge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { ProductCard } from "@/components/ui/ProductCard";
import { toast } from "sonner";
import type { Product } from "@/lib/types";

// ── Mock product ───────────────────────────────────────────
const STORE = {
  id:"s1", name:"Al Rayyan Auto Parts", slug:"al-rayyan-auto-parts",
  city:"Al Rayyan", country:"Qatar", isVerified:true,
  responseRate:98, totalSales:342, avgRating:4.9,
  logoUrl:"", coverUrl:"", description:"",
  workingHours:"Sat–Thu 8 AM – 8 PM", phone:"+974 5555 1234", email:"",
  website:"", address:"Industrial Area, Street 15, Doha", lat:25.28, lng:51.52,
  createdAt:new Date().toISOString(),
  _count:{ products:156, reviews:127 },
};

const PRODUCT: Product = {
  id:"p1", storeId:"s1", store:STORE,
  categoryId:"c4", category:{ id:"c4", name:"AC & Heating", slug:"ac-heating" },
  title:"OEM AC Compressor — Toyota Land Cruiser 2016-2020",
  slug:"oem-ac-compressor-lc-2016",
  price:850, originalPrice:1200, currency:"QAR",
  condition:"LIKE_NEW", partNumber:"88320-6A320",
  brand:"Toyota (OEM)", carMake:"Toyota", carModel:"Land Cruiser",
  carYear:2016, carYearTo:2020,
  images:[
    { id:"i1", url:"/images/ac-compressor.jpg",  isPrimary:true,  sortOrder:0 },
    { id:"i2", url:"/images/ac-compressor2.jpg", isPrimary:false, sortOrder:1 },
    { id:"i3", url:"/images/ac-compressor.jpg",  isPrimary:false, sortOrder:2 },
    { id:"i4", url:"/images/ac-compressor2.jpg", isPrimary:false, sortOrder:3 },
    { id:"i5", url:"/images/ac-compressor.jpg",  isPrimary:false, sortOrder:4 },
  ],
  isActive:true, isFeatured:true, viewCount:234,
  createdAt:new Date().toISOString(),
};

const RELATED: Product[] = [0,1,2,3,4].map((i) => ({
  ...PRODUCT,
  id:`rel-${i}`,
  title:["OEM AC Compressor — Toyota Prado 2014-2019","AC Compressor — Lexus GX460 2010-2019","OEM AC Compressor — Toyota Fortuner 2016-2020","AC Compressor — Toyota Hilux 2016-2020","OEM AC Compressor — Toyota Camry 2012-2017"][i],
  price:[750,780,680,620,650][i],
  originalPrice:undefined,
}));

const REVIEWS = [
  { id:"r1", user:{ fullName:"Mohammed A.", initials:"MA" }, rating:5, comment:"Excellent condition and works perfectly. Genuine part and fast delivery. Highly recommended!", daysAgo:2, verified:true },
  { id:"r2", user:{ fullName:"Ahmed K.",    initials:"AK" }, rating:5, comment:"Great seller, fast response. Part fits perfectly.", daysAgo:5, verified:true },
];

// ── Gallery ────────────────────────────────────────────────
function Gallery({ images }: { images: Product["images"] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="card overflow-hidden">
      {/* Main image */}
      <div className="relative aspect-[4/3] bg-dark-secondary overflow-hidden">
        <Image src={images[active].url} alt="Product" fill className="object-cover transition-opacity duration-300" priority />

        {/* Badges */}
        <div className="absolute top-3 left-3">
          <ConditionBadge condition={PRODUCT.condition} />
        </div>

        {/* Expand */}
        <button className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-lg flex items-center justify-center text-white hover:bg-brand-orange transition-colors backdrop-blur-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
        </button>

        {/* Prev / Next */}
        {images.length > 1 && (
          <>
            <button onClick={() => setActive((a) => (a - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-brand-orange transition-colors backdrop-blur-sm">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setActive((a) => (a + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-brand-orange transition-colors backdrop-blur-sm">
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 p-3 bg-[#161616] overflow-x-auto no-scrollbar">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setActive(i)}
            className={cn("w-[78px] h-[62px] rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors",
              i === active ? "border-brand-orange" : "border-transparent hover:border-gray-500"
            )}
          >
            <Image src={img.url} alt="" width={78} height={62} className="object-cover w-full h-full" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────
export default function ProductDetailPage() {
  const [wishlisted, setWishlisted] = useState(false);
  const p = PRODUCT;

  function copyPartNumber() {
    navigator.clipboard.writeText(p.partNumber!).then(() => toast.success("Part number copied!"));
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-6 pb-16">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand-orange">Home</Link>
        <ChevronRight size={12} />
        <Link href="/browse/ac-heating" className="hover:text-brand-orange">AC & Heating</Link>
        <ChevronRight size={12} />
        <span className="text-white">AC Compressor</span>
      </nav>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-6">

        {/* Left: Gallery + Desc + Related */}
        <div className="space-y-5">
          <Gallery images={p.images} />

          {/* Description + Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="text-[14px] font-bold mb-3 pb-3 border-b border-dark-border">Description</h3>
              <p className="text-[13px] text-gray-300 leading-relaxed">
                OEM AC Compressor for Toyota Land Cruiser 2016-2020. Like new condition. Genuine Toyota part. Fully tested and working perfectly.<br /><br />No leaks, no noise. Ready to install.
              </p>
            </div>
            <div className="card p-5">
              <h3 className="text-[14px] font-bold mb-3 pb-3 border-b border-dark-border">Specifications</h3>
              <div className="space-y-0">
                {[
                  ["Condition",     "Like New"],
                  ["Category",      "AC & Heating"],
                  ["Part Number",   p.partNumber],
                  ["Brand",         p.brand],
                  ["Compatibility", `${p.carMake} ${p.carModel} ${p.carYear}-${p.carYearTo}`],
                  ["Type",          "AC Compressor"],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3 py-2 border-b border-dark-border last:border-none text-[13px]">
                    <span className="text-gray-400 min-w-[110px]">{k}</span>
                    <span className="text-white font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Related Products</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
              {RELATED.map((rp) => (
                <ProductCard key={rp.id} product={rp} className="min-w-[180px] w-[180px] flex-shrink-0" />
              ))}
            </div>
          </div>
        </div>

        {/* Right: sticky info panel */}
        <div className="space-y-4 lg:sticky lg:top-[84px] self-start">

          {/* Info card */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <ConditionBadge condition={p.condition} />
              <button
                onClick={() => setWishlisted(!wishlisted)}
                className={cn("flex items-center gap-1.5 text-[12px] font-medium transition-colors",
                  wishlisted ? "text-brand-orange" : "text-gray-400 hover:text-brand-orange")}
              >
                <Heart size={14} fill={wishlisted ? "currentColor" : "none"} />
                Save to Favorites
              </button>
            </div>

            <h1 className="text-[20px] font-black leading-snug mb-3">{p.title}</h1>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-[30px] font-black text-brand-orange">{formatPrice(p.price, p.currency)}</span>
              {p.originalPrice && <span className="text-[16px] text-gray-500 line-through">{formatPrice(p.originalPrice, p.currency)}</span>}
            </div>

            <div className="flex items-center gap-2 text-[12px] text-gray-400 pb-4 border-b border-dark-border">
              Part Number:
              <span className="text-gray-200 font-medium">{p.partNumber}</span>
              <button onClick={copyPartNumber} className="text-gray-500 hover:text-brand-orange transition-colors">
                <Copy size={12} />
              </button>
            </div>
          </div>

          {/* Seller card */}
          <Link href={`/store/${STORE.slug}`} className="card p-4 flex items-center gap-3 hover:border-brand-orange transition-colors block">
            <div className="w-12 h-12 rounded-full border-2 border-brand-orange bg-brand-orange flex items-center justify-center text-[14px] font-black text-white flex-shrink-0">
              AR
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[14px] font-bold">{STORE.name}</p>
                <BadgeCheck size={15} className="text-green-400 flex-shrink-0" />
              </div>
              <StarRating rating={STORE.avgRating!} count={STORE._count.reviews} size={12} />
              <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1"><MapPin size={9} />{STORE.city}, Qatar</p>
            </div>
          </Link>

          {/* Contact buttons */}
          <div className="space-y-3">
            <button className="w-full h-12 bg-brand-orange text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2.5 hover:bg-brand-orange-hover transition-colors active:scale-[0.98]">
              <MessageCircle size={18} /> Message Seller
            </button>
            <button className="w-full h-12 bg-transparent border border-dark-border text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2.5 hover:border-brand-orange hover:text-brand-orange transition-colors">
              <Phone size={16} /> Call Seller
            </button>
          </div>

          {/* Trust */}
          <div className="card p-3.5 flex items-center justify-between">
            {[
              { icon: Shield,    label: "Genuine OEM" },
              { icon: BadgeCheck,label: "Quality Checked" },
              { icon: Lock,      label: "Secure Transaction" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <Icon size={13} className="text-green-400" />
                {label}
              </div>
            ))}
          </div>

          {/* Map */}
          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-dark-border text-[12px] font-semibold">
              <MapPin size={13} className="text-brand-orange" />
              {STORE.city}, Qatar
            </div>
            <div className="h-36 bg-[#1a2525] relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0"
                style={{ backgroundImage:"linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize:"28px 28px" }} />
              <div className="relative z-10">
                <div className="w-9 h-9 bg-brand-orange rounded-tl-full rounded-tr-full rounded-br-full rotate-45 flex items-center justify-center shadow-orange">
                  <div className="w-3 h-3 bg-white rounded-full -rotate-45" />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-brand-orange/30 animate-pulse-slow" />
              </div>
            </div>
            <Link href={`/store/${STORE.slug}`}
              className="w-full py-3 text-brand-orange text-[13px] font-bold flex items-center justify-center hover:bg-brand-orange-light transition-colors">
              View Store
            </Link>
          </div>

          {/* Reviews panel */}
          <div className="card p-4">
            <h3 className="text-[14px] font-bold mb-4 pb-3 border-b border-dark-border">Reviews</h3>

            {/* Score */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-dark-border">
              <div>
                <p className="text-[48px] font-black text-brand-orange leading-none">{STORE.avgRating}</p>
                <StarRating rating={STORE.avgRating!} size={14} showCount={false} />
                <p className="text-[11px] text-gray-400 mt-1">Based on {STORE._count.reviews} reviews</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5,4,3,2,1].map((star, i) => {
                  const vals = [89,8,2,1,1];
                  return (
                    <div key={star} className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-gray-400 w-3 text-right">{star}</span>
                      <span className="text-yellow-400">★</span>
                      <div className="flex-1 h-1.5 bg-dark-border rounded-full overflow-hidden">
                        <div className="h-full bg-brand-orange rounded-full" style={{ width:`${vals[i]}%` }} />
                      </div>
                      <span className="text-gray-500 w-5 text-right">{[113,10,2,1,1][i]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review items */}
            {REVIEWS.map((r) => (
              <div key={r.id} className="py-3 border-b border-dark-border last:border-none">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-dark-secondary flex items-center justify-center text-[11px] font-bold">{r.user.initials}</div>
                    <div>
                      <p className="text-[13px] font-semibold">{r.user.fullName}</p>
                      {r.verified && <p className="text-[11px] text-green-400 flex items-center gap-1"><BadgeCheck size={10} /> Verified Buyer</p>}
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-500">{r.daysAgo} days ago</span>
                </div>
                <StarRating rating={r.rating} showCount={false} size={12} className="mb-1.5" />
                <p className="text-[13px] text-gray-300 leading-relaxed">{r.comment}</p>
              </div>
            ))}

            <button className="w-full h-10 mt-3 border border-dark-border rounded-lg text-brand-orange text-[13px] font-semibold hover:bg-brand-orange-light hover:border-brand-orange transition-colors">
              View All Reviews
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
