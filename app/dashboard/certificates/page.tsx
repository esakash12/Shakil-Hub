import React from "react";
import Link from "next/link";
import { Award, ArrowRight, Sparkles, ShieldCheck, Download, ExternalLink, CheckCircle } from "lucide-react";
import { getUserCertificatesAction, CertificateItem } from "@/lib/actions/certificates";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const certificates: CertificateItem[] = await getUserCertificatesAction();

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>Accreditation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          My Certificates
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-normal">
          View, verify, and download your official masterclass certificates of completion.
        </p>
      </div>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 space-y-5 transition-all shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                      {cert.title}
                    </h3>
                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                      Code: {cert.code}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Verified</span>
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-gray-300 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Student:</span>
                  <span className="font-semibold text-white">{cert.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Issued On:</span>
                  <span className="font-mono text-gray-300">{cert.issuedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Honors:</span>
                  <span className="text-emerald-400 font-semibold">{cert.grade}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={`/courses/${cert.courseSlug}`}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Course Page</span>
                </Link>

                <button
                  type="button"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Premium Empty State */
        <div className="relative rounded-2xl bg-white/[0.02] border border-white/5 p-10 sm:p-16 text-center overflow-hidden backdrop-blur-xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-600/10 blur-[90px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                You haven&apos;t earned any certificates yet
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed font-normal">
                Complete 100% of any enrolled masterclass to automatically generate your official verified certificate with a unique credential ID.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard/courses"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 border border-blue-400/50 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] hover:scale-105 active:scale-95 text-white font-semibold text-xs sm:text-sm transition-all"
              >
                <span>View Enrolled Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
