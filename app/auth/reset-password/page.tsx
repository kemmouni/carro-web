"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Eye, EyeOff, Car, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

function ResetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [showCf, setShowCf]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [done, setDone]             = useState(false);
  const [error, setError]           = useState("");
  const [tokenError, setTokenError] = useState(false);

  // The /auth/callback route already exchanged the PKCE code server-side.
  // We just verify there's an active session. If the link was invalid/expired,
  // the ?error=invalid_link param will be set, or getUser() will return null.
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setTokenError(true);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) setTokenError(true);
    });
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message ?? "Failed to update password. The link may have expired.");
        return;
      }

      setDone(true);
      // Redirect to login after 3 seconds
      setTimeout(() => router.push("/auth/login"), 3000);
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
          <h1 className="text-[26px] font-black text-white">Set new password</h1>
          <p className="text-[13px] text-gray-400 mt-1">
            {done ? "All done — redirecting you to sign in" : "Choose a strong password for your account"}
          </p>
        </div>

        <div className="card p-7">

          {/* ── Invalid token ── */}
          {tokenError ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle size={28} className="text-red-400" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-white mb-1">Link expired or invalid</p>
                <p className="text-[13px] text-gray-400">
                  This reset link is no longer valid. Please request a new one.
                </p>
              </div>
              <Link
                href="/auth/forgot-password"
                className="h-10 px-5 bg-brand-orange hover:bg-[#e64d00] text-white text-[13px] font-bold rounded-xl transition-colors flex items-center"
              >
                Request new link
              </Link>
            </div>
          ) : done ? (
            /* ── Success ── */
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle size={28} className="text-green-400" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-white mb-1">Password updated!</p>
                <p className="text-[13px] text-gray-400">
                  You&apos;ll be redirected to sign in shortly.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="text-[13px] text-brand-orange hover:opacity-80 transition-opacity"
              >
                Go to sign in now →
              </Link>
            </div>
          ) : (
            /* ── Form ── */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[13px] text-red-400">
                  {error}
                </div>
              )}

              {/* New password */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">
                  New password
                </label>
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

              {/* Confirm password */}
              <div>
                <label className="block text-[12px] font-semibold text-gray-400 mb-1.5">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showCf ? "text" : "password"}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    required
                    className="input pl-10 pr-10 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCf(!showCf)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showCf ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Match indicator */}
                {confirm && (
                  <p className={cn(
                    "text-[11px] mt-1.5",
                    password === confirm ? "text-green-400" : "text-red-400"
                  )}>
                    {password === confirm ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full h-11 bg-brand-orange hover:bg-[#e64d00] text-white text-[14px] font-bold rounded-xl transition-colors mt-2",
                  loading && "opacity-60 cursor-not-allowed"
                )}
              >
                {loading ? "Updating…" : "Update password"}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
