"use client";

import { useState } from "react";
import { Save, Store, CheckCircle } from "lucide-react";

export default function DashboardStorePage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name:         "Al Rayyan Auto Parts",
    description:  "",
    phone:        "",
    email:        "seller@carro.qa",
    website:      "",
    address:      "",
    workingHours: "Sat–Thu 8am–8pm",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: connect to store update API
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Store Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your store profile and contact details.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        {saved && (
          <div className="bg-green-500/15 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle size={14} /> Store settings saved!
          </div>
        )}

        {/* Store Identity */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-orange-light flex items-center justify-center">
              <Store size={18} className="text-brand-orange" />
            </div>
            <h2 className="text-[15px] font-bold text-white">Store Identity</h2>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Store Name *</label>
            <input className="input w-full" value={form.name} onChange={e => set("name", e.target.value)} required />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Description</label>
            <textarea className="input w-full min-h-[90px] resize-y" placeholder="Tell customers about your store..." value={form.description} onChange={e => set("description", e.target.value)} />
          </div>

          {/* Logo & Cover placeholder */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Logo</label>
              <div className="h-24 rounded-xl border-2 border-dashed border-dark-border flex items-center justify-center text-gray-600 text-[12px] cursor-pointer hover:border-brand-orange hover:text-brand-orange transition-colors">
                Upload Logo
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Cover Image</label>
              <div className="h-24 rounded-xl border-2 border-dashed border-dark-border flex items-center justify-center text-gray-600 text-[12px] cursor-pointer hover:border-brand-orange hover:text-brand-orange transition-colors">
                Upload Cover
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card p-6 space-y-4">
          <h2 className="text-[15px] font-bold text-white">Contact & Location</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Phone</label>
              <input className="input w-full" placeholder="+974 5555 1234" value={form.phone} onChange={e => set("phone", e.target.value)} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Email</label>
              <input type="email" className="input w-full" value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Address</label>
            <input className="input w-full" placeholder="Street, Area, Doha, Qatar" value={form.address} onChange={e => set("address", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Website</label>
              <input className="input w-full" placeholder="https://yourstore.qa" value={form.website} onChange={e => set("website", e.target.value)} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Working Hours</label>
              <input className="input w-full" placeholder="Sat–Thu 8am–8pm" value={form.workingHours} onChange={e => set("workingHours", e.target.value)} />
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary">
          <Save size={16} /> Save Changes
        </button>
      </form>
    </div>
  );
}
