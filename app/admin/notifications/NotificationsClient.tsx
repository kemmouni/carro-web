"use client";

import { useState } from "react";
import { Bell, Send, Users, CheckCircle } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

export default function NotificationsClient({ users }: { users: User[] }) {
  const [target, setTarget]   = useState<"all" | "role" | "one">("all");
  const [role, setRole]       = useState("BUYER");
  const [userId, setUserId]   = useState("");
  const [title, setTitle]     = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink]       = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<{ sent: number } | null>(null);
  const [error, setError]     = useState("");

  const recipientCount =
    target === "all"  ? users.length :
    target === "role" ? users.filter((u) => u.role === role).length :
    userId ? 1 : 0;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res  = await fetch("/api/admin/notify", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ target, role, userId, title, message, link: link || undefined }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Failed to send");
      } else {
        setResult({ sent: json.sent });
        setTitle("");
        setMessage("");
        setLink("");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Send Notification</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Broadcast announcements or send targeted messages to users
        </p>
      </div>

      {result && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 mb-6">
          <CheckCircle size={18} />
          <p className="font-semibold">Sent to {result.sent} user{result.sent !== 1 ? "s" : ""} successfully!</p>
        </div>
      )}

      <div className="card p-6">
        <form onSubmit={handleSend} className="space-y-5">

          {/* Target selector */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Recipients</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: "all",  label: "All Users",   icon: Users,  count: users.length },
                { value: "role", label: "By Role",      icon: Users,  count: null },
                { value: "one",  label: "One User",     icon: Bell,   count: null },
              ] as const).map(({ value, label, icon: Icon, count }) => (
                <button key={value} type="button" onClick={() => setTarget(value)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-[12px] font-semibold transition-colors ${
                    target === value
                      ? "bg-brand-orange/10 border-brand-orange text-brand-orange"
                      : "border-dark-border text-gray-400 hover:border-gray-500 hover:text-white"
                  }`}>
                  <Icon size={18} />
                  {label}
                  {count !== null && <span className="text-[10px] opacity-70">{count} users</span>}
                </button>
              ))}
            </div>

            {/* Role picker */}
            {target === "role" && (
              <div className="mt-3">
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-dark-secondary border border-dark-border rounded-lg px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-brand-orange">
                  <option value="BUYER">Buyers ({users.filter((u) => u.role === "BUYER").length})</option>
                  <option value="SELLER">Sellers ({users.filter((u) => u.role === "SELLER").length})</option>
                  <option value="ADMIN">Admins ({users.filter((u) => u.role === "ADMIN").length})</option>
                </select>
              </div>
            )}

            {/* User picker */}
            {target === "one" && (
              <div className="mt-3">
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Select User</label>
                <select value={userId} onChange={(e) => setUserId(e.target.value)}
                  className="w-full bg-dark-secondary border border-dark-border rounded-lg px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-brand-orange">
                  <option value="">— Choose a user —</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name ?? u.email} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required
              placeholder="e.g. New feature available!"
              className="w-full bg-dark-secondary border border-dark-border rounded-lg px-4 py-2.5 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange" />
          </div>

          {/* Message */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Message *</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={4}
              placeholder="Write your message to users…"
              className="w-full bg-dark-secondary border border-dark-border rounded-lg px-4 py-2.5 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange resize-none" />
          </div>

          {/* Link (optional) */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
              Link <span className="text-gray-600 normal-case font-normal">(optional — shown as "Open" button in notification)</span>
            </label>
            <input value={link} onChange={(e) => setLink(e.target.value)}
              placeholder="e.g. /browse or https://carro-web.vercel.app/sale"
              className="w-full bg-dark-secondary border border-dark-border rounded-lg px-4 py-2.5 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange" />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[13px] text-red-400">
              {error}
            </div>
          )}

          {/* Preview */}
          {(title || message) && (
            <div className="border border-dark-border rounded-xl p-4 bg-dark-secondary">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-2">Preview</p>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center flex-shrink-0">
                  <Bell size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">{title || "Title"}</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">{message || "Message"}</p>
                  {link && <p className="text-[11px] text-brand-orange mt-1">→ {link}</p>}
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading || (target === "one" && !userId)}
            className="w-full h-11 bg-brand-orange hover:bg-[#e64d00] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Send size={16} />
            {loading
              ? "Sending…"
              : `Send to ${recipientCount} user${recipientCount !== 1 ? "s" : ""}`}
          </button>

        </form>
      </div>

      {/* Recent history hint */}
      <div className="mt-4 px-4 py-3 rounded-xl bg-dark-secondary border border-dark-border">
        <p className="text-[12px] text-gray-500">
          💡 Notifications appear instantly in users&apos; dashboards with a sound chime and badge. Users can click the bell icon to view all notifications.
        </p>
      </div>
    </div>
  );
}
