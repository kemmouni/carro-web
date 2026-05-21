import { supabaseAdmin } from "@/lib/supabase";
import { notFound }      from "next/navigation";
import Link              from "next/link";
import Image             from "next/image";
import { formatPrice, conditionLabel } from "@/lib/utils";
import type { Product }  from "@/lib/types";
import { ArrowLeft, CheckCircle, XCircle, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

async function getProducts(ids: string[]) {
  const { data } = await supabaseAdmin
    .from("products")
    .select(`*, images:product_images(id, url, isPrimary, sortOrder), category:categories(name), store:stores(name, slug, isVerified)`)
    .in("id", ids)
    .eq("isActive", true);
  return (data ?? []).map((p: Record<string, unknown>) => ({
    ...p,
    images: ((p.images as Array<{ sortOrder: number }>) ?? []).sort((a, b) => a.sortOrder - b.sortOrder),
  }));
}

function Row({ label, values }: { label: string; values: (string | undefined | null)[] }) {
  const allSame = values.every((v) => v === values[0]);
  return (
    <tr className="border-b border-dark-border">
      <td className="px-4 py-3 text-[12px] font-semibold text-gray-500 bg-dark-secondary w-32">{label}</td>
      {values.map((v, i) => (
        <td
          key={i}
          className={`px-4 py-3 text-[13px] text-white ${!allSame ? "text-brand-orange font-semibold" : ""}`}
        >
          {v ?? <span className="text-gray-600">—</span>}
        </td>
      ))}
    </tr>
  );
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const sp  = await searchParams;
  const raw = sp.ids ?? "";
  const ids = raw.split(",").filter(Boolean).slice(0, 3);

  if (ids.length < 2) {
    return (
      <div className="max-w-screen-xl mx-auto px-6 py-16 text-center">
        <p className="text-lg font-bold text-white mb-2">Need at least 2 products to compare</p>
        <p className="text-gray-500 text-sm mb-6">Add products to compare using the &quot;Compare&quot; button on product cards.</p>
        <Link href="/browse" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  const products = await getProducts(ids);
  if (products.length < 2) notFound();

  const ps = products as unknown as Product[];

  const specs: Array<{ label: string; key: keyof Product | ((p: Product) => string | null | undefined) }> = [
    { label: "Price",      key: (p) => formatPrice(p.price, p.currency) },
    { label: "Condition",  key: (p) => conditionLabel(p.condition) },
    { label: "Category",   key: (p) => p.category?.name },
    { label: "Brand",      key: "brand" },
    { label: "Part Number", key: "partNumber" },
    { label: "Car Make",   key: "carMake" },
    { label: "Car Model",  key: "carModel" },
    { label: "Year Range", key: (p) => p.carYear ? `${p.carYear}${p.carYearTo && p.carYearTo !== p.carYear ? `–${p.carYearTo}` : ""}` : null },
    { label: "Store",      key: (p) => p.store?.name },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/browse" className="flex items-center gap-2 text-gray-400 hover:text-white text-[13px] transition-colors">
          <ArrowLeft size={14} />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white">Compare Parts</h1>
          <p className="text-gray-500 text-sm">Side-by-side comparison of {ps.length} products</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          {/* Product headers */}
          <thead>
            <tr>
              <th className="w-32 bg-dark-secondary" />
              {ps.map((p) => (
                <th key={p.id} className="p-4 text-left">
                  <div className="card p-3 text-left">
                    {p.images[0]?.url && (
                      <div className="aspect-[4/3] relative rounded-lg overflow-hidden mb-3 bg-dark-input">
                        <Image src={p.images[0].url} alt={p.title} fill className="object-contain p-2" />
                      </div>
                    )}
                    <p className="text-[13px] font-bold text-white leading-snug mb-1">{p.title}</p>
                    <p className="text-[16px] font-black text-brand-orange mb-2">{formatPrice(p.price, p.currency)}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/product/${p.id}`} className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-brand-orange transition-colors">
                        <ExternalLink size={11} />
                        View
                      </Link>
                      <Link href={`/store/${p.store?.slug}`} className="text-[11px] text-gray-500 hover:text-white transition-colors truncate max-w-[100px]">
                        {p.store?.name}
                        {p.store?.isVerified && <span className="text-green-400 ml-1">✓</span>}
                      </Link>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Specs */}
          <tbody>
            {specs.map(({ label, key }) => (
              <Row
                key={label}
                label={label}
                values={ps.map((p) => typeof key === "function" ? key(p) : p[key] as string | undefined)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 text-center">
        <Link href="/browse" className="btn-secondary">Browse More Products</Link>
      </div>
    </div>
  );
}
