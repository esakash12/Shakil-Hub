import React from "react";
import Link from "next/link";
import { FileText, ChevronRight, Sparkles, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Sakil Hub",
  description: "Terms and conditions of course enrollment and digital access on Sakil Hub.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-black text-white py-8 sm:py-12 select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-600" />
          <span className="text-blue-400 font-medium">Terms of Service</span>
        </nav>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <FileText className="w-3 h-3" />
            <span>Platform Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Last updated: September 1, 2026 • Sakil Hub Academy
          </p>
        </div>

        {/* Content Box */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-gray-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">1. Course Enrollment & Lifetime Access</h2>
            <p>
              By enrolling in a Sakil Hub masterclass, you are granted a non-transferable, single-user license to access video curriculum lessons, downloadable raw project assets, and community Q&A forums.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">2. Content Copyright & Intellectual Property</h2>
            <p>
              All video tutorials, practice footage clips, LUT presets, and project templates provided within the masterclasses are protected by copyright. Unauthorized redistribution, ripping, or public hosting of course videos is strictly prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">3. Payment Verification & Refunds</h2>
            <p>
              Manual bKash and Nagad payments are verified against transaction records. Once verified, course entitlements are unlocked in your Student Dashboard. Due to the digital nature of immediate downloadable assets, refunds are evaluated on a case-by-case basis via support.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">4. Certificates of Completion</h2>
            <p>
              Verified certificates are awarded automatically upon reaching 100% completion of all curriculum modules in any enrolled masterclass.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
