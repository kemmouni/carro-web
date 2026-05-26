"use client";

import { useState, useEffect } from "react";
import { Save, Lock, User, CheckCircle, X, Loader2, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DashboardSettingsPage() {
  const router = useRouter();
  const [user,     setUser]     = useState<{ id: string; email: string; fullName: string } | null>(null);
  const [loading,  setLoading]  = useState(true);

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Profile form
  const [name,          setName]          = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg,    setProfileMsg]    = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Password form
  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [showPw,     setShowPw]     = useState(false);
  const [savingPw,   setSavingPw]   = useState(false);
  const [pwMsg,      setPwMsg]      = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setUser({ id: j.data.id, email: j.data.email, fullName: j.data.fullName ?? "" });
          setName(j.data.fullName ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res  = await fetch("/api/auth/profile", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ fullName: name }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to save");
      setProfileMsg({ type: "ok", text: "Profile updated!" });
      setUser((u) => u ? { ...u, fullName: name } : u);
    } catch (err) {
      setProfileMsg({ type: "err", text: err instanceof Error ? err.message : "Something went wrong" });
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) { setPwMsg({ type: "err", text: "Passwords do not match" }); return; }
    if (newPw.length < 8)    { setPwMsg({ type: "err", text: "Password must be at least 8 characters" }); return; }
    setSavingPw(true);
    setPwMsg(null);
    try {
      const res  = await fetch("/api/auth/password", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to update password");
      setPwMsg({ type: "ok", text: "Password updated successfully!" });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err) {
      setPwMsg({ type: "err", text: err instanceof Error ? err.message : "Something went wrong" });
    } finally {
      setSavingPw(false);
    }
  }

  async function deleteAccount() {
    setDeleting(true);
    try {
      const res  = await fetch("/api/auth/delete", { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to delete account");
      toast.success("Account deleted. Goodbye!");
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Account Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your personal info and security.</p>
      </div>

      <div className="space-y-6 max-w-2xl">

        {/* ── Profile ── */}
        <form onSubmit={saveProfile} className="card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-orange-light flex items-center justify-center">
              <User size={18} className="text-brand-orange" />
            </div>
            <h2 className="text-[15px] font-bold text-white">Profile</h2>
          </div>

          {profileMsg && (
            <div className={`px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${profileMsg.type === "ok" ? "bg-green-500/15 border border-green-500/30 text-green-400" : "bg-red-500/15 border border-red-500/30 text-red-400"}`}>
              {profileMsg.type === "ok" ? <CheckCircle size={14} /> : <X size={14} />} {profileMsg.text}
            </div>
          )}

          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Full Name</label>
            <input className="input w-full" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Email</label>
            <input className="input w-full opacity-60 cursor-not-allowed" value={user?.email ?? ""} disabled />
            <p className="text-[11px] text-gray-600 mt-1">Email cannot be changed here. Contact support if needed.</p>
          </div>

          <button type="submit" disabled={savingProfile} className="btn-primary disabled:opacity-60 h-10 px-5">
            {savingProfile ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {savingProfile ? "Saving…" : "Save Profile"}
          </button>
        </form>

        {/* ── Password ── */}
        <form onSubmit={savePassword} className="card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-orange-light flex items-center justify-center">
              <Lock size={18} className="text-brand-orange" />
            </div>
            <h2 className="text-[15px] font-bold text-white">Change Password</h2>
          </div>

          {pwMsg && (
            <div className={`px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${pwMsg.type === "ok" ? "bg-green-500/15 border border-green-500/30 text-green-400" : "bg-red-500/15 border border-red-500/30 text-red-400"}`}>
              {pwMsg.type === "ok" ? <CheckCircle size={14} /> : <X size={14} />} {pwMsg.text}
            </div>
          )}

          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Current Password</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} className="input w-full pr-10" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required placeholder="••••••••" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">New Password</label>
            <input type={showPw ? "text" : "password"} className="input w-full" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={8} placeholder="Min. 8 characters" />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Confirm New Password</label>
            <input
              type={showPw ? "text" : "password"}
              className={`input w-full ${confirmPw && confirmPw !== newPw ? "border-red-500" : ""}`}
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
              placeholder="Re-enter new password"
            />
            {confirmPw && confirmPw !== newPw && <p className="text-[11px] text-red-400 mt-1">Passwords do not match</p>}
          </div>

          <button type="submit" disabled={savingPw} className="btn-primary disabled:opacity-60 h-10 px-5">
            {savingPw ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
            {savingPw ? "Updating…" : "Update Password"}
          </button>
        </form>

        {/* ── Danger zone ── */}
        <div className="card p-6 border-red-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <h2 className="text-[15px] font-bold text-red-400">Danger Zone</h2>
          </div>
          <p className="text-[13px] text-gray-400 mb-4">
            Once you delete your account, all your data and listings will be permanently removed. This action cannot be undone.
          </p>
          <button
            type="button"
            className="h-10 px-5 rounded-xl border border-red-500/40 text-red-400 text-[13px] font-semibold hover:bg-red-500/10 transition-colors"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* ── Delete Account Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-dark-card border border-red-500/30 rounded-2xl p-6 shadow-card animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-[16px]">Delete your account?</h3>
                <p className="text-gray-400 text-[12px]">This cannot be undone.</p>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5 text-[12px] text-red-300 space-y-1">
              <p>• All your listings will be removed</p>
              <p>• Your store profile will be deleted</p>
              <p>• Order history will be lost</p>
              <p>• This action is <strong>permanent and irreversible</strong></p>
            </div>

            <div className="mb-5">
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">
                Type <span className="text-red-400 font-bold">DELETE</span> to confirm
              </label>
              <input
                className="input w-full border-red-500/30 focus:border-red-500"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
                className="flex-1 h-10 rounded-xl border border-dark-border text-gray-300 text-[13px] font-semibold hover:border-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== "DELETE" || deleting}
                onClick={deleteAccount}
                className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-bold transition-colors flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
                {deleting ? "Deleting…" : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
