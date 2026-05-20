"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Car } from "lucide-react";
import { cn } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error ?? "Login failed. Please check your credentials.");
        return;
      }

      const role = json.data?.user?.role;
      const destination = nextPath ?? (role === "SELLER" ? "/dashboard" : "/");
      router.push(destination);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark-primary flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[420px]">

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
          <h1 className="text-[26px] font-black text-white">Welcome back</h1>
          <p className="text-[13px] text-gray-400 mt-1">Sign in to your Carro account</p>
        </div>

        {/* Card */}
        <div className="card p-7">
          <form onSubmit={handleSubmit} className="space-y-4">

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[13px] text-red-400">
                {error}
              </div>
            )}

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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-semibold text-gray-400">Password</label>
                <Link href="/auth/forgot-password" className="text-[12px] text-brand-orange hover:opacity-80 transition-opacity">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full h-11 bg-brand-orange hover:bg-[#e64d00] text-white text-[14px] font-bold rounded-xl transition-colors mt-2",
                loading && "opacity-60 cursor-not-allowed"
              )}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-dark-border" />
            <span className="text-[11px] text-gray-500">or continue with</span>
            <div className="flex-1 h-px bg-dark-border" />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Google", icon: "G" },
              { label: "Apple",  icon: "" },
            ].map(({ label, icon }) => (
              <button
                key={label}
                className="h-10 bg-dark-secondary border border-dark-border hover:border-gray-500 rounded-xl text-[13px] font-medium text-white transition-colors flex items-center justify-center gap-2"
              >
                <span className="font-bold text-[15px]">{icon || "🍎"}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Register link */}
        <p className="text-center text-[13px] text-gray-500 mt-5">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-brand-orange font-semibold hover:opacity-80 transition-opacity">
            Create one free
          </Link>
        </p>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
