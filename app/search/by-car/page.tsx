"use client";

import { useState, useEffect, useCallback } from "react";
import { Car, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

const MAKES = [
  "Toyota", "Nissan", "BMW", "Mercedes-Benz", "Lexus", "Honda",
  "KIA", "Hyundai", "Ford", "Chevrolet", "Audi", "Volkswagen",
  "Land Rover", "Porsche", "Mitsubishi", "Mazda", "Subaru", "Other",
];

// NHTSA models lookup
async function fetchModels(make: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(make)}?format=json`
    );
    const data = await res.json();
    return (data.Results ?? []).map((r: { Model_Name: string }) => r.Model_Name).sort();
  } catch {
    return [];
  }
}

interface Product {
  id:        string;
  title:     string;
  price:     number;
  currency:  string;
  condition: string;
  images:    { url: string; isPrimary: boolean }[];
  store:     { name: string; slug: string };
}

export default function SearchByCarPage() {
  const [make,    setMake]    = useState("");
  const [model,   setModel]   = useState("");
  const [year,    setYear]    = useState("");
  const [models,  setModels]  = useState<string[]>([]);
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!make) { setModels([]); setModel(""); return; }
    fetchModels(make).then(setModels);
    setModel("");
  }, [make]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => String(currentYear - i));

  const search = useCallback(async () => {
    if (!make) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ type: "PART" });
      if (make)  params.set("carMake",  make);
      if (model) params.set("carModel", model);
      if (year)  params.set("carYear",  year);
      if (query) params.set("q",        query);

      const res = await fetch(`/api/products?${params}`);
      const j   = await res.json();
      setResults(j.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [make, model, year, query]);

  return (
    <div className="min-h-screen bg-dark-primary pt-6 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-orange/20 flex items-center justify-center">
            <Car size={20} className="text-brand-orange" />
          </div>
          <div>
            <h1 className="text-[22px] font-black text-white">Find Parts by Car</h1>
            <p className="text-[13px] text-gray-400">Pick your vehicle to see compatible parts</p>
          </div>
        </div>

        {/* Filter card */}
        <div className="card p-5 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
                Make *
              </label>
              <select
                value={make}
                onChange={e => setMake(e.target.value)}
                className="w-full h-10 bg-dark-primary border border-dark-border rounded-xl px-3 text-[13px] text-white focus:outline-none focus:border-brand-orange"
              >
                <option value="">Select make</option>
                {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
                Model
              </label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                disabled={!make || models.length === 0}
                className="w-full h-10 bg-dark-primary border border-dark-border rounded-xl px-3 text-[13px] text-white focus:outline-none focus:border-brand-orange disabled:opacity-50"
              >
                <option value="">All models</option>
                {models.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
                Year
              </label>
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                className="w-full h-10 bg-dark-primary border border-dark-border rounded-xl px-3 text-[13px] text-white focus:outline-none focus:border-brand-orange"
              >
                <option value="">Any year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && search()}
              placeholder='Search within results, e.g. "brake pads", "headlight"'
              className="flex-1 h-10 bg-dark-primary border border-dark-border rounded-xl px-3 text-[13px] text-white placeholder-gray-600 focus:outline-none focus:border-brand-orange"
            />
            <button
              onClick={search}
              disabled={!make || loading}
              className="h-10 px-5 bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-50 text-white rounded-xl font-bold text-[13px] flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Search size={14} /> Search</>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {searched && !loading && (
          <div>
            <p className="text-[13px] text-gray-400 mb-4">
              {results.length === 0
                ? "No parts found. Try a different make or model."
                : `${results.length} part${results.length !== 1 ? "s" : ""} found for ${make}${model ? ` ${model}` : ""}${year ? ` (${year})` : ""}`
              }
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.map(p => {
                const img = p.images.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))[0];
                return (
                  <Link
                    key={p.id}
                    href={`/product/${p.id}`}
                    className="card p-3 flex gap-3 items-start hover:border-brand-orange transition-colors"
                  >
                    {img ? (
                      <img
                        src={img.url}
                        alt={p.title}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-dark-secondary"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-dark-secondary flex items-center justify-center flex-shrink-0">
                        <Car size={20} className="text-gray-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-white line-clamp-2">{p.title}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{p.store.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[14px] font-black text-brand-orange">
                          {formatPrice(p.price, p.currency)}
                        </span>
                        <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                          View <ChevronRight size={10} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {!searched && (
          <div className="text-center py-16 text-gray-600">
            <Car size={56} className="mx-auto mb-4 opacity-30" />
            <p className="text-[14px]">Select your vehicle make above to find compatible parts</p>
          </div>
        )}
      </div>
    </div>
  );
}
