"use client";

import { useEffect, useState } from "react";
import { Gift, Copy, CheckCircle, Users, Star } from "lucide-react";
import { toast } from "sonner";

interface ReferralData {
  code:      string;
  uses:      number;
  referrals: number;
  createdAt: string;
}

export default function ReferralPage() {
  const [data,    setData]    = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    fetch("/api/referral")
      .then(r => r.json())
      .then(j => { setData(j.data); setLoading(false); });
  }, []);

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const referralLink = data ? `${typeof window !== "undefined" ? window.location.origin : "https://warsha.plus"}/signup?ref=${data.code}` : "";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-dark-border border-t-brand-orange rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-orange/20 flex items-center justify-center">
          <Gift size={20} className="text-brand-orange" />
        </div>
        <div>
          <h1 className="text-[22px] font-black text-white">Referral Program</h1>
          <p className="text-[13px] text-gray-400">Invite sellers — earn 1 free featured listing per friend</p>
        </div>
      </div>

      {/* How it works */}
      <div className="card p-5 mb-5">
        <h3 className="text-[14px] font-bold text-white mb-4">How it works</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Gift,         step: "1", label: "Share your link",     desc: "Send your unique referral link to friends" },
            { icon: Users,        step: "2", label: "They sign up",        desc: "Friend creates a seller account on Warsha+" },
            { icon: Star,         step: "3", label: "You earn a reward",   desc: "Get 1 free featured listing slot added" },
          ].map(({ icon: Icon, step, label, desc }) => (
            <div key={step} className="text-center">
              <div className="w-10 h-10 rounded-full bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center mx-auto mb-2">
                <Icon size={16} className="text-brand-orange" />
              </div>
              <p className="text-[12px] font-bold text-white mb-1">{label}</p>
              <p className="text-[11px] text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Your code */}
      <div className="card p-5 mb-5">
        <h3 className="text-[13px] font-semibold text-gray-400 mb-3 uppercase tracking-wide">Your Referral Code</h3>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-dark-primary border border-dark-border rounded-xl px-4 py-3 font-mono text-[20px] font-black text-brand-orange tracking-widest text-center">
            {data?.code}
          </div>
          <button
            onClick={() => copy(data?.code ?? "")}
            className="h-12 w-12 bg-dark-primary border border-dark-border rounded-xl flex items-center justify-center hover:border-brand-orange transition-colors flex-shrink-0"
          >
            {copied ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} className="text-gray-400" />}
          </button>
        </div>

        <h3 className="text-[13px] font-semibold text-gray-400 mb-2 uppercase tracking-wide">Referral Link</h3>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={referralLink}
            className="flex-1 h-10 bg-dark-primary border border-dark-border rounded-xl px-3 text-[12px] text-gray-400 focus:outline-none select-all"
          />
          <button
            onClick={() => copy(referralLink)}
            className="h-10 px-3 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition-colors"
          >
            {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
            Copy
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4 text-center">
          <p className="text-[32px] font-black text-brand-orange mb-1">{data?.uses ?? 0}</p>
          <p className="text-[12px] text-gray-400">Times link was used</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-[32px] font-black text-green-400 mb-1">{data?.referrals ?? 0}</p>
          <p className="text-[12px] text-gray-400">Friends joined</p>
        </div>
      </div>

      {data && data.referrals > 0 && (
        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
          <p className="text-[13px] text-green-400 font-semibold">
            🎉 You've earned {data.referrals} featured listing slot{data.referrals > 1 ? "s" : ""}!
          </p>
          <p className="text-[11px] text-gray-500 mt-1">Contact support to apply your rewards.</p>
        </div>
      )}
    </div>
  );
}
