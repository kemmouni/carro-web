"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Car, Store } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "BUYER" | "SELLER";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole]         = useState<Role>("BUYER");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error ?? "Registration failed. Please try again.");
        return;
      }

      router.push("/auth/login?registered=1");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark-primary flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[460px]">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-orange flex items-center justify-center">
              <Car size={20} className="text-white" />
            </div>
            <span className="text-[22px] font-black tracking-tight">
              Carro<span className="text-brand-orange">.</span>
            </span>
          </Link>
          <h1 className="text-[26px] font-black text-white">Create your account</h1>
          <p className="text-[13px] text-gray-400 mt-1">Join Qatar's #1 auto parts marketplace</p>
        </div>

        {/* Role toggle */}
        <div className="flex gap-3 mb-5">
          {([
            { value: "BUYER",  label: "I'm a Buyer",  icon: User,  sub: "Browse & buy parts" },
            { value: "SELLER", label: "I'm a Seller", icon: Store, sub: "List & sell parts" },
          ] as const).map(({ value, label, icon: Icon, sub }) => (
            <button
              key={value}
              type="button"
              onClick={() => setRole(value)}
              className={cn(
                "flex-1 p-4 rounded-xl border-2 text-left transition-all",
                role === value
                  ? "border-brand-orange bg-brand-orange-light"
                  : "border-dark-border bg-dark-card hover:border-gray-500"
              )}
            >
              <Icon size={18} className={cn("mb-1.5", role === value ? "text-brand-orange" : "text-gray-400")} />
              <p className={cn("text-[13px] font-bold", role === value ? "text-white" : "text-gray-300")}>{label}</p>
              <p className="text-[11px] text-gray-500">{sub}</p>
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="card p-7">
          <form onSubmit={handleSubmit} className="space-y-4">

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[13px] text-red-400">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">
                {role === "SELLER" ? "Business / Store name" : "Full name"}
              </label>
              <div className="relative">
                {role === "SELLER" ? <Store size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" /> : <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />}
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={role === "SELLER" ? "Auto Parts Doha" : "Mohammed Al-Rashid"}
                  required
                  className="input pl-10 w-full"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input pl-10 w-full"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="input pl-10 pr-10 w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">Confirm password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPw ? "text" : "password"}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className={cn(
                    "input pl-10 w-full",
                    confirm && confirm !== password && "border-red-500 focus:border-red-500"
                  )}
                />
              </div>
              {confirm && confirm !== password && (
                <p className="text-[11px] text-red-400 mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" required className="accent-brand-orange mt-0.5 w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-[12px] text-gray-400 leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-brand-orange hover:opacity-80">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-brand-orange hover:opacity-80">Privacy Policy</Link>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full h-11 bg-brand-orange hover:bg-[#e64d00] text-white text-[14px] font-bold rounded-xl transition-colors",
                loading && "opacity-60 cursor-not-allowed"
              )}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>

          </form>
        </div>

        {/* Login link */}
        <p className="text-center text-[13px] text-gray-500 mt-5">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-brand-orange font-semibold hover:opacity-80 transition-opacity">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
