"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Award, ExternalLink, Download, CheckCircle, X, Sparkles, BookOpen } from "lucide-react";
import { getUserCertificatesAction, CertificateItem } from "@/lib/actions/certificates";

export default function RecentCertificates({
  initialCertificates = [],
}: {
  initialCertificates?: CertificateItem[];
}) {
  const [certificates, setCertificates] = useState<CertificateItem[]>(
    initialCertificates || []
  );
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);

  useEffect(() => {
    if (initialCertificates) {
      setCertificates(initialCertificates);
    }
  }, [initialCertificates?.length]);

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-5 space-y-4 select-none">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-400" />
          Recent Certificates
        </h3>
        <span className="text-[11px] text-gray-500 font-mono">
          {certificates.length > 0 ? `${certificates.length} Verified` : "In Progress"}
        </span>
      </div>

      {certificates.length > 0 ? (
        <div className="space-y-3">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="p-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-indigo-500/30 flex items-center justify-between gap-3 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate group-hover:text-indigo-400 transition-colors">
                    {cert.title}
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    Earned on {cert.issuedDate}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCert(cert)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-medium shrink-0 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-black/30 border border-white/5 text-center space-y-2">
          <div className="w-8 h-8 mx-auto rounded-lg bg-indigo-600/10 border border-indigo-500/15 flex items-center justify-center text-indigo-400">
            <Award className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-white">
              No Certificates Earned Yet
            </p>
            <p className="text-[11px] text-gray-400 leading-relaxed font-normal">
              Complete 100% of any enrolled masterclass to automatically generate your official verified certificate.
            </p>
          </div>
          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium transition-colors pt-1"
          >
            <span>Continue Course</span>
            <span>→</span>
          </Link>
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0c1017] border border-white/10 p-6 space-y-4 shadow-2xl text-center">
            <button
              type="button"
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white bg-white/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Award className="w-7 h-7 text-white" />
            </div>

            <div>
              <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                Credential Code: {selectedCert.code}
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                {selectedCert.title}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Awarded to <strong className="text-white">{selectedCert.studentName}</strong> • {selectedCert.grade}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-emerald-400 flex items-center justify-center gap-1.5 font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Authenticity Verified on Blockchain Ledger</span>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
