import { supabaseAdmin } from "@/lib/supabase";
import { getSellerStore } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Wrench, Car, Package } from "lucide-react";
import { ProductForm } from "@/components/dashboard/ProductForm";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const store = await getSellerStore();
  if (!store) redirect("/auth/login");

  const { type } = await searchParams;

  const { data: categories } = await supabaseAdmin
    .from("categories").select("id, name").order("sortOrder");

  // No type selected → show picker
  if (!type || !["part", "service", "car"].includes(type)) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 text-[12px] text-gray-500 mb-6">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <ChevronRight size={12} />
          <span className="text-white">New Listing</span>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-black text-white">What are you listing?</h1>
          <p className="text-gray-500 text-sm mt-1">Choose the type of listing you want to create.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl">
          {[
            {
              type: "part",
              icon: Package,
              title: "Auto Part",
              titleAr: "قطعة غيار",
              desc: "Sell a new or used car part, accessory, or component.",
              color: "text-blue-400",
              bg: "bg-blue-400/10 border-blue-400/20 hover:border-blue-400/60",
            },
            {
              type: "service",
              icon: Wrench,
              title: "Service",
              titleAr: "خدمة",
              desc: "List a workshop, repair, maintenance, or automotive service.",
              color: "text-brand-orange",
              bg: "bg-brand-orange/10 border-brand-orange/20 hover:border-brand-orange/60",
            },
            {
              type: "car",
              icon: Car,
              title: "Car for Sale",
              titleAr: "سيارة للبيع",
              desc: "List a vehicle for sale — new, used, or luxury.",
              color: "text-green-400",
              bg: "bg-green-400/10 border-green-400/20 hover:border-green-400/60",
            },
          ].map(({ type: t, icon: Icon, title, titleAr, desc, color, bg }) => (
            <Link
              key={t}
              href={`/dashboard/products/new?type=${t}`}
              className={`card border-2 p-6 flex flex-col gap-4 transition-all group ${bg}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-current/10`}>
                <Icon size={24} className={color} />
              </div>
              <div>
                <p className="text-[16px] font-bold text-white">{title}</p>
                <p className="text-[11px] text-gray-500 mt-0.5" dir="rtl">{titleAr}</p>
                <p className="text-[12px] text-gray-400 mt-2 leading-relaxed">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const listingType = type === "service" ? "SERVICE" : type === "car" ? "CAR" : "PART";
  const typeLabel   = type === "service" ? "Service" : type === "car" ? "Car for Sale" : "Auto Part";

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-[12px] text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
        <ChevronRight size={12} />
        <Link href="/dashboard/products" className="hover:text-white">Products</Link>
        <ChevronRight size={12} />
        <Link href="/dashboard/products/new" className="hover:text-white">New Listing</Link>
        <ChevronRight size={12} />
        <span className="text-white">{typeLabel}</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Add {typeLabel}</h1>
        <p className="text-gray-500 text-sm mt-0.5">Fill in the details to list your {typeLabel.toLowerCase()}.</p>
      </div>

      <ProductForm categories={categories ?? []} storeId={store.id} listingType={listingType} />
    </div>
  );
}
