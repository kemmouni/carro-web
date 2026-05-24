import { supabaseAdmin } from "@/lib/supabase";
import {
  Tag, Car, Package, Users, ShoppingBag, Store,
  Calendar, Clock, TrendingUp, AlertTriangle, CheckCircle,
} from "lucide-react";
import Link from "next/link";

async function getStats() {
  const [
    cats, brands, products, users, orders, stores, bookings,
    pendingProducts, pendingReports, pendingBookings,
    recentOrders, recentUsers,
  ] = await Promise.all([
    supabaseAdmin.from("categories").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("brands").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("products").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("users").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("orders").select("id, totalAmount", { count: "exact" }),
    supabaseAdmin.from("stores").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("bookings").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("products").select("id", { count: "exact", head: true }).eq("approvalStatus", "PENDING"),
    supabaseAdmin.from("product_reports").select("id", { count: "exact", head: true }).eq("status", "PENDING"),
    supabaseAdmin.from("bookings").select("id", { count: "exact", head: true }).eq("status", "PENDING"),
    supabaseAdmin.from("orders").select("id, totalAmount, status, createdAt, buyerName, store:stores(name)").order("createdAt", { ascending: false }).limit(5),
    supabaseAdmin.from("users").select("id, fullName, email, role, createdAt").order("createdAt", { ascending: false }).limit(5),
  ]);

  const totalRevenue = (orders.data ?? []).reduce((sum: number, o: { totalAmount?: number }) => sum + (o.totalAmount ?? 0), 0);

  return {
    categories:      cats.count ?? 0,
    brands:          brands.count ?? 0,
    products:        products.count ?? 0,
    users:           users.count ?? 0,
    orders:          orders.count ?? 0,
    stores:          stores.count ?? 0,
    bookings:        bookings.count ?? 0,
    pendingProducts: pendingProducts.count ?? 0,
    pendingReports:  pendingReports.count ?? 0,
    pendingBookings: pendingBookings.count ?? 0,
    totalRevenue,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recentOrders:    (recentOrders.data ?? []) as any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recentUsers:     (recentUsers.data ?? []) as any[],
  };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:   "bg-yellow-500/15 text-yellow-400",
  CONFIRMED: "bg-blue-500/15 text-blue-400",
  SHIPPED:   "bg-purple-500/15 text-purple-400",
  DELIVERED: "bg-green-500/15 text-green-400",
  CANCELLED: "bg-red-500/15 text-red-400",
};

export default async function AdminPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Admin Overview</h1>
      <p className="text-gray-400 text-sm mb-8">Full control of the Carro marketplace</p>

      {/* Alerts row */}
      {(stats.pendingProducts > 0 || stats.pendingReports > 0 || stats.pendingBookings > 0) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {stats.pendingProducts > 0 && (
            <Link href="/admin/products?filter=PENDING" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-semibold hover:bg-yellow-500/20 transition-colors">
              <AlertTriangle size={15} />
              {stats.pendingProducts} products awaiting approval
            </Link>
          )}
          {stats.pendingReports > 0 && (
            <Link href="/admin/reports" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-colors">
              <AlertTriangle size={15} />
              {stats.pendingReports} open reports
            </Link>
          )}
          {stats.pendingBookings > 0 && (
            <Link href="/admin/bookings?filter=PENDING" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold hover:bg-blue-500/20 transition-colors">
              <Clock size={15} />
              {stats.pendingBookings} pending bookings
            </Link>
          )}
        </div>
      )}

      {/* Main stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Users",    value: stats.users,    icon: Users,       href: "/admin/users",    color: "text-purple-400" },
          { label: "Active Stores",  value: stats.stores,   icon: Store,       href: "/admin/stores",   color: "text-brand-orange" },
          { label: "Total Products", value: stats.products, icon: Package,     href: "/admin/products", color: "text-green-400" },
          { label: "Total Orders",   value: stats.orders,   icon: ShoppingBag, href: "/admin/orders",   color: "text-blue-400" },
        ].map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href} className="card p-5 hover:border-brand-orange/40 transition-colors group">
            <Icon size={20} className={`${color} mb-3 group-hover:scale-110 transition-transform`} />
            <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Revenue (QAR)",   value: `QAR ${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, href: "/admin/orders",    color: "text-emerald-400", isText: true },
          { label: "Bookings",        value: stats.bookings,    icon: Calendar, href: "/admin/bookings",   color: "text-cyan-400" },
          { label: "Categories",      value: stats.categories,  icon: Tag,      href: "/admin/categories", color: "text-blue-400" },
          { label: "Car Brands",      value: stats.brands,      icon: Car,      href: "/admin/brands",     color: "text-yellow-400" },
        ].map(({ label, value, icon: Icon, href, color, isText }) => (
          <Link key={label} href={href} className="card p-5 hover:border-brand-orange/40 transition-colors group">
            <Icon size={20} className={`${color} mb-3 group-hover:scale-110 transition-transform`} />
            <p className={`font-bold text-white mb-0.5 ${isText ? "text-lg" : "text-2xl"}`}>{value.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <ShoppingBag size={16} className="text-blue-400" /> Recent Orders
            </h2>
            <Link href="/admin/orders" className="text-xs text-brand-orange hover:opacity-80">View all →</Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-dark-border last:border-0">
                  <div>
                    <p className="text-[13px] font-semibold text-white">{o.buyerName ?? "Customer"}</p>
                    <p className="text-[11px] text-gray-500">{o.store?.name ?? "—"} · {new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status] ?? "bg-gray-500/15 text-gray-400"}`}>
                      {o.status}
                    </span>
                    <span className="text-[13px] font-bold text-white">QAR {(o.totalAmount ?? 0).toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent users */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Users size={16} className="text-purple-400" /> Recent Sign-ups
            </h2>
            <Link href="/admin/users" className="text-xs text-brand-orange hover:opacity-80">View all →</Link>
          </div>
          {stats.recentUsers.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No users yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b border-dark-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-dark-input flex items-center justify-center text-[12px] font-bold text-brand-orange">
                      {(u.fullName ?? u.email ?? "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-white">{u.fullName ?? "—"}</p>
                      <p className="text-[11px] text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      u.role === "ADMIN" ? "bg-purple-500/15 text-purple-400" :
                      u.role === "SELLER" ? "bg-blue-500/15 text-blue-400" :
                      "bg-gray-500/15 text-gray-400"
                    }`}>{u.role}</span>
                    <span className="text-[11px] text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card p-6">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-400" /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Approve Products",   href: "/admin/products",      color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20" },
              { label: "Verify Stores",      href: "/admin/stores",        color: "bg-brand-orange/10 border-brand-orange/20 text-brand-orange hover:bg-brand-orange/20" },
              { label: "Handle Reports",     href: "/admin/reports",       color: "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20" },
              { label: "Manage Users",       href: "/admin/users",         color: "bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20" },
              { label: "Send Notification",  href: "/admin/notifications", color: "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20" },
              { label: "View All Orders",    href: "/admin/orders",        color: "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20" },
            ].map(({ label, href, color }) => (
              <Link key={label} href={href} className={`border rounded-xl px-4 py-3 text-sm font-semibold transition-colors text-center ${color}`}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Platform health */}
        <div className="card p-6">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-400" /> Platform Health
          </h2>
          <div className="space-y-3">
            {[
              { label: "Products pending approval", value: stats.pendingProducts, warn: stats.pendingProducts > 0 },
              { label: "Open reports",              value: stats.pendingReports,  warn: stats.pendingReports > 0 },
              { label: "Pending bookings",          value: stats.pendingBookings, warn: stats.pendingBookings > 0 },
            ].map(({ label, value, warn }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-dark-border last:border-0">
                <span className="text-sm text-gray-400">{label}</span>
                <span className={`text-sm font-bold ${warn ? "text-yellow-400" : "text-green-400"}`}>
                  {value === 0 ? "✓ Clear" : value}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-400">Total revenue</span>
              <span className="text-sm font-bold text-emerald-400">QAR {stats.totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
