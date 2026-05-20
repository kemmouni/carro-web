import { supabaseAdmin } from "@/lib/supabase";
import { Tag, Car, Package, Users } from "lucide-react";
import Link from "next/link";

async function getStats() {
  const [cats, brands, products, users] = await Promise.all([
    supabaseAdmin.from("categories").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("brands").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("products").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("users").select("id", { count: "exact", head: true }),
  ]);
  return {
    categories: cats.count ?? 0,
    brands:     brands.count ?? 0,
    products:   products.count ?? 0,
    users:      users.count ?? 0,
  };
}

export default async function AdminPage() {
  const stats = await getStats();

  const CARDS = [
    { label: "Categories",  value: stats.categories, icon: Tag,     href: "/admin/categories",  color: "text-blue-400"   },
    { label: "Car Brands",  value: stats.brands,     icon: Car,     href: "/admin/brands",      color: "text-brand-orange" },
    { label: "Products",    value: stats.products,   icon: Package,  href: "/browse",            color: "text-green-400"  },
    { label: "Users",       value: stats.users,      icon: Users,    href: "#",                  color: "text-purple-400" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Admin Overview</h1>
      <p className="text-gray-400 text-sm mb-8">Manage your Carro marketplace assets</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {CARDS.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="card p-5 hover:border-brand-orange/40 transition-colors group"
          >
            <Icon size={22} className={`${color} mb-3 group-hover:scale-110 transition-transform`} />
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Tag size={15} className="text-blue-400" /> Categories
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Upload custom images for each parts category. Images appear on the homepage and browse page.
          </p>
          <Link href="/admin/categories" className="btn-primary text-sm w-fit">
            Manage Categories →
          </Link>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Car size={15} className="text-brand-orange" /> Car Brands
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Upload logos for each car brand. Logos appear in the Browse by Brand section on the homepage.
          </p>
          <Link href="/admin/brands" className="btn-primary text-sm w-fit">
            Manage Brands →
          </Link>
        </div>
      </div>
    </div>
  );
}
