import React from "react";
import Link from "next/link";
import { ShieldCheck, ChevronRight, Sparkles, Lock, FileText } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Sakil Hub",
  description: "Privacy Policy and Data Protection standards of Sakil Hub Academy.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black text-white py-8 sm:py-12 select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-600" />
          <span className="text-blue-400 font-medium">Privacy Policy</span>
        </nav>

        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Lock className="w-3 h-3" />
            <span>Data Protection Standards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Last updated: September 1, 2026 • Effective immediately
          </p>
        </div>

        {/* Content Box */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-gray-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">1. Information We Collect</h2>
            <p>
              When you register an account or enroll in a masterclass on Sakil Hub, we collect information such as your full name, email address, phone number, and manual payment transaction identifiers (e.g. bKash / Nagad TrxID).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">2. How We Use Your Data</h2>
            <p>
              Your data is utilized strictly for course fulfillment, issuing verifiable certificates of mastery, personalizing your classroom experience, and granting secure video streaming access via Cloudflare R2. We do not sell your personal data to third parties.
            </p>
          </section>

          <section className="space-y-2" id="cookies">
            <h2 className="text-base font-bold text-white">3. Cookies & Session Storage</h2>
            <p>
              Sakil Hub uses encrypted session cookies to manage student authentication tokens, track lesson progression checkmarks, and persist your personalized study notes across devices.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">4. Contact & Support Desk</h2>
            <p>
              If you have any questions or data removal requests regarding our privacy policy, please contact our desk at <strong className="text-blue-400 font-mono">support@sakilhub.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
