"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Smartphone,
  Copy,
  Check,
  CheckCircle2,
  ShieldCheck,
  Lock,
} from "lucide-react";

export default function PaymentMethods({
  paymentData,
  setPaymentData,
  payableAmount = "৳1,299",
}: {
  paymentData: {
    method: "bkash" | "nagad" | "rocket" | "card";
    senderNumber: string;
    trxId: string;
  };
  setPaymentData: React.Dispatch<
    React.SetStateAction<{
      method: "bkash" | "nagad" | "rocket" | "card";
      senderNumber: string;
      trxId: string;
    }>
  >;
  payableAmount?: string;
}) {
  const [copied, setCopied] = useState(false);
  const merchantNumber = "01876-543210";

  const handleCopy = () => {
    navigator.clipboard.writeText(merchantNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const methods = [
    {
      id: "bkash",
      name: "bKash",
      subtitle: "Instant Mobile Banking",
      color: "border-[#E2136E]/40 text-[#E2136E]",
      activeBg: "bg-[#E2136E]/10 border-[#E2136E]",
      badge: "Popular",
    },
    {
      id: "nagad",
      name: "Nagad",
      subtitle: "Mobile Wallet",
      color: "border-[#F7941D]/40 text-[#F7941D]",
      activeBg: "bg-[#F7941D]/10 border-[#F7941D]",
      badge: "0% Fee",
    },
    {
      id: "rocket",
      name: "Rocket",
      subtitle: "DBBL Mobile Banking",
      color: "border-[#8C1595]/40 text-[#8C1595]",
      activeBg: "bg-[#8C1595]/10 border-[#8C1595]",
      badge: "DBBL",
    },
    {
      id: "card",
      name: "Credit / Debit Card",
      subtitle: "Visa, Mastercard, Amex",
      color: "border-blue-500/40 text-blue-400",
      activeBg: "bg-blue-600/10 border-blue-500",
      badge: "SSLCommerz",
    },
  ];

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-blue-400" />
          2. Payment Method
        </h2>
        <span className="text-xs text-gray-500 font-normal">Step 2 of 2</span>
      </div>

      {/* Payment Method Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {methods.map((method) => {
          const isSelected = paymentData.method === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() =>
                setPaymentData({
                  ...paymentData,
                  method: method.id as "bkash" | "nagad" | "card",
                })
              }
              className={`relative rounded-xl p-3.5 text-left border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? `${method.activeBg} shadow-md`
                  : "bg-white/[0.02] border-white/5 hover:border-white/15"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-white">
                  {method.name}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-gray-400"
                  }`}
                >
                  {method.badge}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[11px] text-gray-400 font-normal">
                  {method.subtitle}
                </p>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected
                      ? "border-white bg-white text-black"
                      : "border-white/20 bg-transparent"
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Manual Mobile Banking Instructions & Verification Input */}
      {(paymentData.method === "bkash" || paymentData.method === "nagad" || paymentData.method === "rocket") && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl bg-black/50 border border-white/10 p-4 sm:p-5 space-y-4"
        >
          {/* Instructions Block */}
          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-400" />
              How to pay with {paymentData.method === "bkash" ? "bKash" : paymentData.method === "nagad" ? "Nagad" : "Rocket"}:
            </h3>
            <ol className="list-decimal list-inside text-gray-400 space-y-1 pl-1">
              <li>
                Go to your {paymentData.method === "bkash" ? "bKash" : paymentData.method === "nagad" ? "Nagad" : "Rocket"} app or dial USSD code and choose <strong className="text-white">Send Money</strong>.
              </li>
              <li>
                Send exactly <strong className="text-white">{payableAmount}</strong> to the number below:
              </li>
            </ol>
          </div>

          {/* Copy Number Box */}
          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                Account (Personal)
              </p>
              <p className="text-sm sm:text-base font-mono font-bold text-white">
                {merchantNumber}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:text-white hover:bg-blue-600 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Number</span>
                </>
              )}
            </button>
          </div>

          {/* TrxID & Sender Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Your {paymentData.method === "bkash" ? "bKash" : "Nagad"} Number (11 Digits) *
              </label>
              <input
                type="tel"
                required
                value={paymentData.senderNumber}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    senderNumber: e.target.value,
                  })
                }
                placeholder="01XXXXXXXXX"
                pattern="^01[3-9][0-9]{8}$"
                maxLength={11}
                title="Must be an 11-digit Bangladeshi mobile number starting with 01"
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Transaction ID (TrxID) *
              </label>
              <input
                type="text"
                required
                value={paymentData.trxId}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    trxId: e.target.value.toUpperCase(),
                  })
                }
                placeholder="e.g. 9J4K2L8M1"
                pattern="^[A-Za-z0-9]{6,20}$"
                minLength={6}
                maxLength={20}
                title="Must be at least 6 to 12 alphanumeric characters"
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2 text-xs sm:text-sm text-white font-mono uppercase placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Card Payment Message */}
      {paymentData.method === "card" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl bg-black/50 border border-white/10 p-4 text-xs text-gray-400 space-y-2"
        >
          <div className="flex items-center gap-2 text-blue-400 font-semibold">
            <Lock className="w-4 h-4" />
            <span>SSLCommerz 256-Bit Encrypted Gateway</span>
          </div>
          <p>
            You will be redirected to the secure SSLCommerz payment page to complete your payment using Visa, Mastercard, or Internet Banking.
          </p>
        </motion.div>
      )}
    </div>
  );
}
