"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Award,
  Download,
  ExternalLink,
  CheckCircle,
  Copy,
  Check,
  Printer,
  Sparkles,
  ShieldCheck,
  X,
} from "lucide-react";
import { CertificateItem } from "@/lib/actions/certificates";

interface CertificateCardProps {
  certificate: CertificateItem;
}

export default function CertificateCard({ certificate }: CertificateCardProps) {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const verificationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/${certificate.code}`
      : `https://sakilhub.com/verify/${certificate.code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 space-y-4 sm:space-y-5 transition-all shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Award className="w-6 h-6 shrink-0" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                {certificate.title}
              </h3>
              <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                Code: {certificate.code}
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold flex items-center gap-1 shrink-0">
            <CheckCircle className="w-3 h-3 shrink-0" />
            <span>Verified</span>
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-gray-300 space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">Student:</span>
            <span className="font-semibold text-white">{certificate.studentName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Issued On:</span>
            <span className="font-mono text-gray-300">{certificate.issuedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Honors:</span>
            <span className="text-emerald-400 font-semibold">{certificate.grade}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <Link
            href={`/verify/${certificate.code}`}
            target="_blank"
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            <span>Public Verification</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>View & Download</span>
          </button>
        </div>
      </div>

      {/* High-Resolution Certificate Printable Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-neutral-950 border border-white/15 rounded-3xl p-4 sm:p-8 space-y-6 shadow-2xl">
            {/* Modal Top Actions */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Official Masterclass Certificate
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy verification link"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{copied ? "Link Copied!" : "Copy Link"}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 shrink-0" />
                  <span>Print / Save PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>

            {/* Printable Certificate Template */}
            <div
              ref={certRef}
              className="relative w-full aspect-[1.414/1] bg-gradient-to-br from-[#0c0f17] via-[#090b10] to-[#040507] border-4 border-amber-500/40 rounded-2xl p-6 sm:p-12 flex flex-col justify-between text-center overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.08)] select-none print:m-0 print:border-none print:shadow-none"
            >
              {/* Luxury Corner Ornaments */}
              <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-amber-400/60 pointer-events-none" />
              <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-amber-400/60 pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-amber-400/60 pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-amber-400/60 pointer-events-none" />

              {/* Watermark Crest */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                <Award className="w-96 h-96 text-white" />
              </div>

              {/* Certificate Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-bold tracking-[0.3em] uppercase">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Sakil Hub • Institute of Creative Media</span>
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                </div>
                <h1 className="text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 tracking-wider uppercase font-serif">
                  Certificate of Completion
                </h1>
                <p className="text-[11px] sm:text-xs text-gray-400 font-medium tracking-wide">
                  This official credential certifies that
                </p>
              </div>

              {/* Student Name */}
              <div className="py-2 sm:py-4">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight underline decoration-amber-500/40 underline-offset-8">
                  {certificate.studentName}
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 mt-4 max-w-xl mx-auto leading-relaxed">
                  has successfully mastered all lectures, project timelines, and technical requirements for the professional curriculum:
                </p>
                <h3 className="text-base sm:text-2xl font-bold text-amber-300 mt-2 tracking-tight">
                  {certificate.title.replace(" Certificate", "")}
                </h3>
              </div>

              {/* Signatures & Seal Footer */}
              <div className="pt-4 border-t border-white/10 flex items-end justify-between text-xs text-left">
                {/* Left: Issue Date & Verification */}
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                    Issue Date: <span className="text-white font-mono">{certificate.issuedDate}</span>
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                    Credential ID: <span className="text-amber-400 font-mono font-bold">{certificate.code}</span>
                  </p>
                  <p className="text-[9px] text-gray-500 font-mono">
                    Verify at: {verificationUrl}
                  </p>
                </div>

                {/* Center: Gold Seal */}
                <div className="hidden sm:flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full border-2 border-amber-400/80 bg-amber-500/10 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                    <Award className="w-8 h-8 shrink-0 text-amber-300" />
                  </div>
                  <span className="text-[8px] uppercase tracking-widest text-amber-400 font-bold mt-1">
                    Verified Graduate
                  </span>
                </div>

                {/* Right: Signature */}
                <div className="text-right space-y-1">
                  <div className="font-serif italic text-base sm:text-lg text-amber-300/90 font-semibold tracking-wide">
                    Sakil Ahmed
                  </div>
                  <div className="w-28 sm:w-36 h-[1px] bg-white/20 ml-auto" />
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider font-medium">
                    Lead Instructor & Founder
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
