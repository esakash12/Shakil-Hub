"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Search, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

export default function VerifyIndexPage() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    router.push(`/verify/${code.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 select-none">
      <div className="w-full max-w-lg rounded-3xl bg-[#0c1017] border border-white/10 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
          <Award className="w-8 h-8 shrink-0" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>Official Credential Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Verify Certificate Authenticity
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto font-normal">
            Enter the unique Sakil Hub certificate code printed on the credential to verify its authenticity in real time.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. SKL-PR-12345"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 uppercase font-mono tracking-wider transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!code.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            <span>Verify Credential</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </form>

        <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Cryptographically validated via Sakil Hub PostgreSQL ledger</span>
        </div>
      </div>
    </div>
  );
}
