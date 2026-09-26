import React from "react";
import Link from "next/link";
import { Award, ArrowRight, Sparkles } from "lucide-react";
import { getUserCertificatesAction, CertificateItem } from "@/lib/actions/certificates";
import CertificateCard from "@/components/dashboard/CertificateCard";

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
            <CertificateCard key={cert.id} certificate={cert} />
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
