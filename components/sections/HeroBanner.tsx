"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    headline: ["FIND AUTO PARTS", "IN QATAR"],
    sub: "<strong class='text-brand-orange'>2,000+</strong> verified sellers. Quality parts. Best prices.",
    cta: { label: "Browse Parts", href: "/browse" },
    image: "/images/hero-parts.jpg",
  },
  {
    headline: ["SELL YOUR", "AUTO PARTS"],
    sub: "Reach <strong class='text-brand-orange'>50,000+</strong> buyers across Qatar. List for free.",
    cta: { label: "Start Selling", href: "/auth/register?role=seller" },
    image: "/images/hero-sell.jpg",
  },
];

export function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[current];

  return (
    <section className="relative bg-[#111] overflow-hidden min-h-[360px] flex items-center">
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_80%_50%,rgba(255,85,0,0.15),transparent_65%)]" />
      </div>

      <div className="max-w-screen-xl mx-auto px-6 w-full relative z-10 flex items-center">
        {/* Text */}
        <div className="py-14 max-w-[480px]">
          <h1 className="text-5xl sm:text-[56px] font-black leading-[1.02] tracking-tight uppercase mb-3 animate-slide-up">
            {slide.headline[0]}
            <span className="block text-brand-orange">{slide.headline[1]}</span>
          </h1>
          <p
            className="text-[16px] text-gray-300 mb-7 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: slide.sub }}
          />
          <Link href={slide.cta.href} className="btn-primary w-fit">
            {slide.cta.label}
            <ChevronRight size={16} />
          </Link>

          {/* Dots */}
          <div className="flex gap-2 mt-7">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-300",
                  i === current ? "bg-brand-orange w-6" : "bg-gray-600 w-2.5"
                )}
              />
            ))}
          </div>
        </div>

        {/* Hero image */}
        <div className="absolute right-0 top-0 bottom-0 w-[52%] pointer-events-none hidden md:block">
          <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-[#111] to-transparent z-10" />
          {slide.image && (
            <Image
              src={slide.image}
              alt="Auto Parts"
              fill
              className="object-cover object-left"
              priority
            />
          )}
        </div>
      </div>
    </section>
  );
}
