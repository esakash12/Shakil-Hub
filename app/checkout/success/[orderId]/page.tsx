import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Play,
  BookOpen,
  LayoutDashboard,
  Check,
} from "lucide-react";
import { getOrderDetailsAction } from "@/lib/actions/checkout";

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderDetailsAction(orderId);

  const displayOrderId = order?.orderId || orderId || "";
  const courseTitle = order?.courseTitle || "Masterclass / Digital Product";
  const courseSlug = order?.courseSlug || "";
  const amount = order?.amount || 0;
  const paymentMethod = order?.paymentMethod || "Mobile Banking";
  const senderNumber = order?.senderNumber || "";
  const trxId = order?.trxId || "";

  return (
    <div className="min-h-screen bg-black text-white py-10 sm:py-16 select-none">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Main Success Glass Card */}
          <div className="rounded-3xl bg-[#0c1017] border border-white/10 p-6 sm:p-10 space-y-6 text-center shadow-2xl relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-64 bg-emerald-500/10 blur-[90px] pointer-events-none -z-10" />

            {/* Status Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            {/* Title & Message */}
            <div className="space-y-2 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Order Submitted Successfully</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Thank You for Enrolling!
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
                Your order is pending verification. Once we verify your TrxID, your course will be unlocked.
              </p>
            </div>

            {/* Order Token Box */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 max-w-lg mx-auto text-left space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/5 text-xs">
                <span className="text-gray-400">Order Reference:</span>
                <span className="font-mono text-emerald-400 font-bold">#{displayOrderId}</span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-white/5 text-xs">
                <span className="text-gray-400">Enrolled Course:</span>
                <span className="text-white font-semibold truncate max-w-[220px] sm:max-w-xs">{courseTitle}</span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-white/5 text-xs">
                <span className="text-gray-400">Amount Paid:</span>
                <span className="text-white font-mono font-bold">৳{amount.toLocaleString()} BDT</span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-white/5 text-xs">
                <span className="text-gray-400">Payment Gateway:</span>
                <span className="text-gray-300 font-semibold uppercase">{paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-white/5 text-xs">
                <span className="text-gray-400">Sender Number:</span>
                <span className="text-gray-300 font-mono">{senderNumber}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Transaction ID (TrxID):</span>
                <span className="text-cyan-400 font-mono font-bold uppercase">{trxId}</span>
              </div>
            </div>

            {/* 3-Step Verification Timeline Tracker */}
            <div className="pt-4 border-t border-white/5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Enrollment Progress
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>1. Order Placed</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    TrxID submitted into Medusa backend.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1 animate-pulse">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>2. Admin Verification</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Reviewing mobile money transfer (15-30m).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 opacity-70">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>3. Course Access</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Lifetime streaming and assets unlocked.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Link
                href="/dashboard/courses?enrollment=success"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Student Dashboard</span>
              </Link>

              <Link
                href={`/courses/${courseSlug}`}
                className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>View Course Curriculum</span>
              </Link>
            </div>
          </div>

          {/* Help & Support Notice */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Questions or delayed verification? Contact WhatsApp support 24/7.</span>
            </div>
            <a
              href="https://wa.me/8801876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-white font-semibold underline shrink-0"
            >
              Chat on WhatsApp (01876-543210)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
