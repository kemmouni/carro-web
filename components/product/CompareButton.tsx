"use client";

import { useState, useEffect } from "react";
import { GitCompareArrows, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const COMPARE_KEY = "carro_compare";
const MAX_COMPARE = 3;

export function getCompareIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(COMPARE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function setCompareIds(ids: string[]) {
  localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("compare-updated"));
}

export default function CompareButton({ productId }: { productId: string }) {
  const [inList, setInList] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const update = () => setInList(getCompareIds().includes(productId));
    update();
    window.addEventListener("compare-updated", update);
    return () => window.removeEventListener("compare-updated", update);
  }, [productId]);

  function toggle() {
    const ids = getCompareIds();
    if (inList) {
      setCompareIds(ids.filter((id) => id !== productId));
      toast.success("Removed from compare");
    } else {
      if (ids.length >= MAX_COMPARE) {
        toast.error(`You can compare up to ${MAX_COMPARE} products at once. Remove one first.`);
        return;
      }
      const next = [...ids, productId];
      setCompareIds(next);
      if (next.length >= 2) {
        toast.success(`${next.length} products selected`, {
          description: "Ready to compare side by side",
          action: {
            label: "Compare now",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick: () => router.push(`/compare?ids=${next.join(",")}` as any),
          },
        });
      } else {
        toast.success("Added to compare");
      }
    }
  }

  return (
    <button
      onClick={toggle}
      title={inList ? "Remove from compare" : "Add to compare"}
      className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
        inList
          ? "bg-brand-orange/15 border-brand-orange/40 text-brand-orange"
          : "bg-dark-secondary border-dark-border text-gray-400 hover:text-white hover:border-gray-500"
      }`}
    >
      {inList ? <Check size={12} /> : <GitCompareArrows size={12} />}
      {inList ? "Added" : "Compare"}
    </button>
  );
}
