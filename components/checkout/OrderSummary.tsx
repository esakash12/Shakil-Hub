"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Tag,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";

export default function OrderSummary({
  courseTitle = "Premiere Pro Masterclass",
  courseSubtitle = "Complete video editing masterclass",
  instructor = "Rashedul Hasan",
  image = "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80",
  subtotal = 2560,
  initialDiscount = 1261,
  onSubmit,
  isProcessing = false,
}: {
  courseTitle?: string;
  courseSubtitle?: string;
  instructor?: string;
  image?: string;
  subtotal?: number;
  initialDiscount?: number;
  onSubmit: () => void;
  isProcessing?: boolean;
}) {
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    if (couponCode.toUpperCase() === "SAVE100" || couponCode.toUpperCase() === "SAKIL50") {
      setCouponDiscount(100);
      setCouponApplied(true);
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code. Try 'SAVE100'");
      setCouponApplied(false);
      setCouponDiscount(0);
    }
  };

  const finalTotal = subtotal - initialDiscount - couponDiscount;

  return (
    <div className="rounded-2xl bg-[#0A0A0A] border border-white/10 p-5 sm:p-6 space-y-6 sticky top-20 shadow-2xl">
      <h2 className="text-base sm:text-lg font-bold text-white tracking-tight border-b border-white/5 pb-3">
        Order Summary
      </h2>

      {/* Course Item Card */}
      <div className="flex items-center gap-3.5">
        <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-neutral-950 border border-white/10 shrink-0 flex items-center justify-center">
          {image ? (
            <Image
              src={image}
              alt={courseTitle}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-neutral-900 via-neutral-950 to-black">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xs sm:text-sm font-bold text-white truncate">
            {courseTitle}
          </h3>
          <p className="text-[11px] text-gray-400">By {instructor}</p>
        </div>
      </div>

      {/* Coupon Form */}
      <form onSubmit={handleApplyCoupon} className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Coupon code (e.g. SAVE100)"
              className="w-full rounded-xl bg-white/[0.03] border border-white/10 pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 uppercase font-mono focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-colors shrink-0"
          >
            Apply
          </button>
        </div>

        {couponApplied && (
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Coupon applied! You saved ৳100.
          </p>
        )}

        {couponError && (
          <p className="text-[11px] text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {couponError}
          </p>
        )}
      </form>

      {/* Price Calculations */}
      <div className="space-y-2.5 pt-2 border-t border-white/5 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>Original Price</span>
          <span className="font-mono text-gray-300">৳{subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-emerald-400">
          <span>Course Discount (49%)</span>
          <span className="font-mono">-৳{initialDiscount.toLocaleString()}</span>
        </div>

        {couponApplied && (
          <div className="flex justify-between text-emerald-400">
            <span>Special Coupon</span>
            <span className="font-mono">-৳{couponDiscount}</span>
          </div>
        )}

        <div className="flex justify-between items-baseline pt-3 border-t border-white/10 text-white">
          <span className="text-sm font-bold">Total Payable</span>
          <span className="text-2xl font-extrabold font-mono text-white">
            ৳{finalTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Checkout Submit Button */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isProcessing}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 border border-blue-400/50 shadow-[0_0_25px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_rgba(37,99,235,0.7)] hover:scale-[1.02] active:scale-[0.98] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing Order...
            </span>
          ) : (
            <>
              <Lock className="w-4 h-4 fill-current" />
              <span>Complete Purchase ৳{finalTotal.toLocaleString()}</span>
            </>
          )}
        </button>

        {/* Trust Badges */}
        <div className="space-y-2 pt-2 text-[11px] text-gray-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>256-Bit SSL Encrypted & Secure Checkout</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Instant Lifetime Access upon verification</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>30-Day Money-Back Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
}
