"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { X, ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

interface Props {
  onClose: () => void;
  next?: string;
}

type Step = "phone" | "otp";

export default function WhatsAppOtpModal({ onClose, next }: Props) {
  const router = useRouter();

  const [step, setStep]           = useState<Step>("phone");
  const [phone, setPhone]         = useState("");
  const [digits, setDigits]       = useState(["", "", "", "", "", ""]);
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]         = useState("");
  const [countdown, setCountdown] = useState(60);
  const [otpToken, setOtpToken]   = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (step !== "otp") return;
    setCountdown(60);
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(id); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  // Auto-focus first OTP box when step changes
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // ── Normalize phone (Qatar default) ────────────────────────────────────────
  function getFullPhone() {
    const raw = phone.trim().replace(/\s+/g, "");
    if (raw.startsWith("+")) return raw;
    if (raw.startsWith("00")) return `+${raw.slice(2)}`;
    if (raw.startsWith("0"))  return `+974${raw.slice(1)}`;
    return `+974${raw}`;
  }

  // ── Send OTP ────────────────────────────────────────────────────────────────
  async function handleSend() {
    const fullPhone = getFullPhone();
    if (fullPhone.length < 8) { setError("Please enter a valid phone number"); return; }
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Failed to send OTP");
        return;
      }
      setOtpToken(json.otp_token ?? "");
      setStep("otp");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  async function handleResend() {
    setResending(true);
    setError("");
    try {
      const res  = await fetch("/api/auth/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: getFullPhone() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Failed to resend OTP");
        return;
      }
      setOtpToken(json.otp_token ?? "");
      setDigits(["", "", "", "", "", ""]);
      setCountdown(60);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  }

  // ── Verify OTP ──────────────────────────────────────────────────────────────
  async function handleVerify() {
    const otp = digits.join("");
    if (otp.length < 6) { setError("Please enter the full 6-digit code"); return; }
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/whatsapp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: getFullPhone(), token: otp, otp_token: otpToken }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error ?? "Invalid code. Please try again.");
        setDigits(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
        return;
      }

      // Complete sign-in via magic-link token in the browser
      const supabase = getSupabase();
      const { error: authError } = await supabase.auth.verifyOtp({
        token_hash: json.token_hash,
        type:       "magiclink",
      });

      if (authError) {
        setError("Sign-in failed. Please try again.");
        return;
      }

      onClose();
      router.push(next ?? "/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── OTP digit handlers ──────────────────────────────────────────────────────
  function onDigitChange(value: string, idx: number) {
    if (!/^\d*$/.test(value)) return;
    const next_ = [...digits];
    next_[idx]  = value.slice(-1);
    setDigits(next_);
    if (value && idx < 5) inputRefs.current[idx + 1]?.focus();
    if (value && idx === 5) {
      // auto-submit when last digit filled
      const otp = [...next_].join("");
      if (otp.length === 6) setTimeout(handleVerify, 0);
    }
  }

  function onDigitKeyDown(e: React.KeyboardEvent, idx: number) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  }

  // ── UI ──────────────────────────────────────────────────────────────────────
  const maskedPhone = (() => {
    const fp = getFullPhone();
    return fp.length > 6 ? `${fp.slice(0, fp.length - 4)}****` : fp;
  })();

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal card */}
      <div className="w-full max-w-[400px] bg-dark-primary rounded-2xl p-6 relative shadow-2xl border border-dark-border">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* ── Phone step ──────────────────────────────────────── */}
        {step === "phone" && (
          <>
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-[#25D366]/15 flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-[#25D366]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>

            <h2 className="text-xl font-black text-white mb-1">WhatsApp Login</h2>
            <p className="text-[13px] text-gray-400 mb-5 leading-relaxed">
              Enter your number and we&apos;ll send a verification code via WhatsApp.
            </p>

            {/* Phone input row */}
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 h-11 px-3 rounded-xl bg-dark-secondary border border-dark-border text-[14px] font-semibold text-white shrink-0">
                <span className="text-lg">🇶🇦</span>
                <span>+974</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                placeholder="5X XXX XXXX"
                autoFocus
                className="input flex-1 h-11"
              />
            </div>

            {error && (
              <p className="mt-3 text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleSend}
              disabled={loading}
              className={cn(
                "mt-5 w-full h-11 flex items-center justify-center gap-2 rounded-xl text-[14px] font-bold text-white transition-colors",
                "bg-[#25D366] hover:bg-[#1fb957]",
                loading && "opacity-60 cursor-not-allowed"
              )}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (
                <>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                  Send OTP via WhatsApp
                </>
              )}
            </button>
          </>
        )}

        {/* ── OTP step ────────────────────────────────────────── */}
        {step === "otp" && (
          <>
            <button
              onClick={() => { setStep("phone"); setError(""); setDigits(["","","","","",""]); }}
              className="flex items-center gap-1 text-[13px] text-gray-400 hover:text-white mb-4 transition-colors"
            >
              <ChevronLeft size={16} /> Back
            </button>

            <div className="w-14 h-14 rounded-2xl bg-[#25D366]/15 flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-[#25D366]">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h2 className="text-xl font-black text-white mb-1">Enter the code</h2>
            <p className="text-[13px] text-gray-400 mb-5 leading-relaxed">
              We sent a 6-digit code to{" "}
              <span className="text-white font-semibold">{maskedPhone}</span>{" "}
              via WhatsApp.
            </p>

            {/* OTP boxes */}
            <div className="flex gap-2 justify-between">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => onDigitChange(e.target.value, i)}
                  onKeyDown={(e) => onDigitKeyDown(e, i)}
                  className={cn(
                    "w-11 h-14 text-center text-xl font-bold text-white rounded-xl border transition-colors outline-none",
                    "bg-dark-secondary",
                    d
                      ? "border-[#25D366]"
                      : "border-dark-border focus:border-[#25D366]"
                  )}
                />
              ))}
            </div>

            {error && (
              <p className="mt-3 text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleVerify}
              disabled={loading || digits.join("").length < 6}
              className={cn(
                "mt-5 w-full h-11 flex items-center justify-center gap-2 rounded-xl text-[14px] font-bold text-white transition-colors",
                "bg-[#25D366] hover:bg-[#1fb957]",
                (loading || digits.join("").length < 6) && "opacity-60 cursor-not-allowed"
              )}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Verify & Sign In"}
            </button>

            {/* Resend */}
            <div className="mt-4 text-center">
              {countdown > 0 ? (
                <p className="text-[13px] text-gray-500">Resend code in {countdown}s</p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-[13px] text-[#25D366] font-semibold hover:opacity-80 transition-opacity flex items-center gap-1 mx-auto"
                >
                  {resending ? <Loader2 size={14} className="animate-spin" /> : (
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                      <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                    </svg>
                  )}
                  {resending ? "Sending…" : "Resend code"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
