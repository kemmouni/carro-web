"use client";

import { useState } from "react";
import { Search, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface VinResult {
  make:         string;
  model:        string;
  year:         string;
  bodyClass:    string;
  engineSize:   string;
  fuelType:     string;
  transmission: string;
  drive:        string;
}

interface Props {
  onDecoded: (result: VinResult) => void;
}

export function VinDecoder({ onDecoded }: Props) {
  const [vin,     setVin]     = useState("");
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<VinResult | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  function pick(vars: { Variable: string; Value: string | null }[], name: string) {
    return vars.find(v => v.Variable === name)?.Value ?? "";
  }

  async function decode() {
    const clean = vin.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (clean.length !== 17) {
      setError("VIN must be exactly 17 characters");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${clean}?format=json`
      );
      const data = await res.json();
      const vars: { Variable: string; Value: string | null }[] = data.Results ?? [];

      const decoded: VinResult = {
        make:         pick(vars, "Make"),
        model:        pick(vars, "Model"),
        year:         pick(vars, "Model Year"),
        bodyClass:    pick(vars, "Body Class"),
        engineSize:   pick(vars, "Displacement (L)"),
        fuelType:     pick(vars, "Fuel Type - Primary"),
        transmission: pick(vars, "Transmission Style"),
        drive:        pick(vars, "Drive Type"),
      };

      if (!decoded.make && !decoded.model) {
        setError("Could not decode this VIN. Please check and try again.");
        return;
      }

      setResult(decoded);
      onDecoded(decoded);
    } catch {
      setError("Failed to decode VIN. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-dark-secondary border border-dark-border rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-[13px] font-bold text-white">
        <Search size={14} className="text-brand-orange" />
        VIN Decoder
        <span className="text-[10px] font-normal text-gray-500 ml-1">auto-fill from chassis number</span>
      </div>

      <div className="flex gap-2">
        <input
          value={vin}
          onChange={e => { setVin(e.target.value.toUpperCase()); setError(null); setResult(null); }}
          placeholder="e.g. 1HGBH41JXMN109186"
          maxLength={17}
          className="flex-1 h-10 bg-dark-primary border border-dark-border rounded-xl px-3 text-[13px] text-white placeholder-gray-600 focus:outline-none focus:border-brand-orange font-mono tracking-wider"
        />
        <button
          onClick={decode}
          disabled={loading || vin.trim().length < 17}
          className="h-10 px-4 bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-50 text-white rounded-xl text-[13px] font-bold flex items-center gap-2 transition-colors"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : "Decode"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-[12px] text-red-400">
          <AlertCircle size={13} /> {error}
        </div>
      )}

      {result && (
        <div className="bg-dark-primary border border-green-500/20 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2 text-[12px] text-green-400 font-semibold mb-2">
            <CheckCircle size={13} /> Decoded successfully — fields auto-filled below
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
            {[
              ["Make",          result.make],
              ["Model",         result.model],
              ["Year",          result.year],
              ["Body",          result.bodyClass],
              ["Engine",        result.engineSize ? `${result.engineSize}L` : ""],
              ["Fuel",          result.fuelType],
              ["Transmission",  result.transmission],
              ["Drive",         result.drive],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="flex gap-1.5">
                <span className="text-gray-500 w-20 flex-shrink-0">{k}:</span>
                <span className="text-white font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
