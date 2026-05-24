"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Car, ArrowLeft, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res  = await fetch("/api/auth/password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error ?? "Failed to send reset email. Please try again.");
        return;
      }

      setSent(true);
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
          <h1 className="text-[26px] font-black text-white">Reset password</h1>
          <p className="text-[13px] text-gray-400 mt-1">
            {sent
              ? "Check your inbox for a reset link"
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        <div className="card p-7">
          {sent ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle size={28} className="text-green-400" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-white mb-1">Email sent!</p>
                <p className="text-[13px] text-gray-400">
                  We sent a password reset link to{" "}
                  <span className="text-white font-medium">{email}</span>.
                  Check your spam folder if you don&apos;t see it.
                </p>
              </div>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-[13px] text-brand-orange hover:opacity-80 transition-opacity"
              >
                Send to a different email
              </button>
            </div>
          ) : (
            /* ── Form state ── */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[13px] text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">
                  Email address
                </label>
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

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full h-11 bg-brand-orange hover:bg-[#e64d00] text-white text-[14px] font-bold rounded-xl transition-colors mt-2",
                  loading && "opacity-60 cursor-not-allowed"
                )}
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[13px] text-gray-500 mt-5">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-brand-orange font-semibold hover:opacity-80 transition-opacity"
          >
            <ArrowLeft size={13} />
            Back to sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
