"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BannerSlide {
  id: string;
  title: string;
  subtitle: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  imageUrl: string | null;
}

const FALLBACK_SLIDES: BannerSlide[] = [
  {
    id: "fallback-1",
    title: "Qatar's #1 Auto Parts Marketplace",
    subtitle: "Find genuine OEM and aftermarket parts for all car makes",
    ctaText: "Browse Parts",
    ctaLink: "/browse",
    imageUrl: null,
  },
  {
    id: "fallback-2",
    title: "Sell Your Auto Parts",
    subtitle: "Reach 50,000+ buyers across Qatar. List for free.",
    ctaText: "Start Selling",
    ctaLink: "/seller/setup",
    imageUrl: null,
  },
];

interface HeroBannerProps {
  slides?: BannerSlide[];
}

export function HeroBanner({ slides }: HeroBannerProps) {
  const displaySlides = slides && slides.length > 0 ? slides : FALLBACK_SLIDES;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (displaySlides.length <= 1) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % displaySlides.length), 5000);
    return () => clearInterval(t);
  }, [displaySlides.length]);

  // Clamp current index if slides change
  const idx = Math.min(current, displaySlides.length - 1);
  const slide = displaySlides[idx];

  return (
    <section className="relative bg-[#111] overflow-hidden min-h-[360px] flex items-center">
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_80%_50%,rgba(255,85,0,0.15),transparent_65%)]" />
      </div>

      <div className="max-w-screen-xl mx-auto px-6 w-full relative z-10 flex items-center">
        {/* Text */}
        <div className="py-14 max-w-[480px]">
          <h1 className="text-5xl sm:text-[56px] font-black leading-[1.02] tracking-tight uppercase mb-3 animate-slide-up text-white">
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="text-[16px] text-gray-300 mb-7 leading-relaxed">
              {slide.subtitle}
            </p>
          )}
          {slide.ctaText && slide.ctaLink && (
            <Link href={slide.ctaLink} className="btn-primary w-fit">
              {slide.ctaText}
              <ChevronRight size={16} />
            </Link>
          )}

          {/* Dots */}
          {displaySlides.length > 1 && (
            <div className="flex gap-2 mt-7">
              {displaySlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-300",
                    i === idx ? "bg-brand-orange w-6" : "bg-gray-600 w-2.5"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Hero image */}
        <div className="absolute right-0 top-0 bottom-0 w-[52%] pointer-events-none hidden md:block">
          <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-[#111] to-transparent z-10" />
          {slide.imageUrl && (
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              className="object-cover object-left"
              priority={idx === 0}
              sizes="(max-width: 768px) 0vw, 52vw"
              quality={80}
            />
          )}
        </div>
      </div>
    </section>
  );
}
