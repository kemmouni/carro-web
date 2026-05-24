import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import {
  Settings, ExternalLink, Database, Mail, Shield, Globe,
} from "lucide-react";

async function getStats() {
  const [users, stores, products, orders] = await Promise.all([
    supabaseAdmin.from("users").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("stores").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("products").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("orders").select("id, totalAmount"),
  ]);

  const revenue = (orders.data ?? []).reduce((sum: number, o: { totalAmount?: number }) => sum + (o.totalAmount ?? 0), 0);

  return {
    users:    users.count ?? 0,
    stores:   stores.count ?? 0,
    products: products.count ?? 0,
    orders:   (orders.data ?? []).length,
    revenue,
  };
}

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const stats = await getStats();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const projectRef  = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1] ?? "";

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings size={22} /> Settings & Info
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Platform configuration and external service links</p>
      </div>

      {/* Platform stats */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
          <Database size={16} className="text-brand-orange" /> Platform Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Users",    value: stats.users },
            { label: "Stores",   value: stats.stores },
            { label: "Products", value: stats.products },
            { label: "Orders",   value: stats.orders },
          ].map(({ label, value }) => (
            <div key={label} className="text-center py-3 rounded-xl bg-dark-secondary">
              <p className="text-2xl font-black text-white">{value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-dark-border flex items-center justify-between">
          <span className="text-sm text-gray-400">Total Revenue</span>
          <span className="text-lg font-black text-emerald-400">QAR {stats.revenue.toLocaleString()}</span>
        </div>
      </div>

      {/* External links */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
          <Globe size={16} className="text-blue-400" /> External Services
        </h2>
        <div className="space-y-3">
          {[
            {
              label:       "Supabase Dashboard",
              description: "Manage database, auth, storage and edge functions",
              href:        `https://supabase.com/dashboard/project/${projectRef}`,
              color:       "text-emerald-400",
              icon:        Database,
            },
            {
              label:       "Supabase Auth Settings",
              description: "Email templates, redirect URLs, OAuth providers",
              href:        `https://supabase.com/dashboard/project/${projectRef}/auth/users`,
              color:       "text-emerald-400",
              icon:        Shield,
            },
            {
              label:       "Supabase Email Templates",
              description: "Customize reset-password, confirm-email branding",
              href:        `https://supabase.com/dashboard/project/${projectRef}/auth/templates`,
              color:       "text-emerald-400",
              icon:        Mail,
            },
            {
              label:       "Vercel Dashboard",
              description: "Deployments, environment variables, domain settings",
              href:        "https://vercel.com/kemmouni-4504s-projects/carro-web",
              color:       "text-blue-400",
              icon:        Globe,
            },
            {
              label:       "GitHub Repository",
              description: "Source code, branches, pull requests",
              href:        "https://github.com/kemmouni/carro-web",
              color:       "text-white",
              icon:        Globe,
            },
          ].map(({ label, description, href, color, icon: Icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl bg-dark-secondary hover:bg-dark-border transition-colors group">
              <div className="flex items-center gap-3">
                <Icon size={18} className={color} />
                <div>
                  <p className="text-[13px] font-semibold text-white">{label}</p>
                  <p className="text-[11px] text-gray-500">{description}</p>
                </div>
              </div>
              <ExternalLink size={14} className="text-gray-500 group-hover:text-white transition-colors" />
            </a>
          ))}
        </div>
      </div>

      {/* Admin accounts */}
      <div className="card p-6">
        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
          <Shield size={16} className="text-purple-400" /> Admin Access
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          To grant or revoke admin access, go to User Management and change the user&apos;s role.
        </p>
        <Link href="/admin/users?filter=ADMIN"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-semibold hover:bg-purple-500/20 transition-colors">
          <Shield size={14} />
          Manage Admin Users
        </Link>
      </div>
    </div>
  );
}
