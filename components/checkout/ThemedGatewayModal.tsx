"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  X,
  Copy,
  Check,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { PaymentGatewayType, BkashLogo, NagadLogo, RocketLogo } from "./ThemedPaymentGateway";
import {
  bangladeshiPhoneSchema,
  trxIdSchema,
  gatewaySubmissionSchema,
} from "@/lib/security/schemas";

interface ThemedGatewayModalProps {
  method: PaymentGatewayType;
  merchantNumber: string;
  payableAmount: string;
  numericAmount: number;
  orderReference: string;
  senderNumber: string;
  trxId: string;
  onSenderNumberChange: (val: string) => void;
  onTrxIdChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  onClose?: () => void;
  isProcessing: boolean;
}

export default function ThemedGatewayModal({
  method,
  merchantNumber,
  payableAmount,
  numericAmount,
  orderReference,
  senderNumber,
  trxId,
  onSenderNumberChange,
  onTrxIdChange,
  onSubmit,
  onBack,
  onClose,
  isProcessing,
}: ThemedGatewayModalProps) {
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    senderNumber?: string;
    trxId?: string;
  }>({});

  const validateField = (field: "senderNumber" | "trxId", value: string) => {
    const schema = field === "senderNumber" ? bangladeshiPhoneSchema : trxIdSchema;
    const result = schema.safeParse(value);
    if (!result.success) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: result.error.issues[0]?.message || "Invalid value",
      }));
    } else {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = gatewaySubmissionSchema.safeParse({ senderNumber, trxId });
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        if (path && !newErrors[path]) {
          newErrors[path] = issue.message;
        }
      });
      setFieldErrors(newErrors);
      return;
    }

    setFieldErrors({});
    onSubmit(e);
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(merchantNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(String(numericAmount || 1299));
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const config = {
    bkash: {
      brandName: "bKash",
      banglaName: "বিকাশ",
      themeColor: "#E2136E",
      buttonBg: "bg-[#E2136E] hover:bg-[#c90f61]",
      logo: BkashLogo,
      textColor: "text-[#E2136E]",
    },
    nagad: {
      brandName: "Nagad",
      banglaName: "নগদ",
      themeColor: "#F37021",
      buttonBg: "bg-[#F37021] hover:bg-[#d95e16]",
      logo: NagadLogo,
      textColor: "text-[#F37021]",
    },
    rocket: {
      brandName: "Rocket",
      banglaName: "রকেট",
      themeColor: "#8C1595",
      buttonBg: "bg-[#8C1595] hover:bg-[#770f80]",
      logo: RocketLogo,
      textColor: "text-[#8C1595]",
    },
  }[method];

  const LogoIcon = config.logo;

  return (
    <div className="w-full max-w-[430px] sm:max-w-[440px] mx-auto bg-white text-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200/80 overflow-hidden select-none animate-in fade-in zoom-in-95 duration-200">
      {/* Top Header Bar: Back Navigation and Close (Matches Screenshot 3) */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          aria-label="Back"
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Close"
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-3">
        {/* Central Brand Logo (Matches Screenshot 3) */}
        <div className="flex flex-col items-center justify-center pt-0 pb-1">
          <div className="flex items-center gap-2">
            <span className={config.textColor}>
              <LogoIcon className="w-7 h-7 fill-current" />
            </span>
            <span
              className="text-xl font-black tracking-tight"
              style={{ color: config.themeColor }}
            >
              {config.brandName}
            </span>
          </div>
        </div>

        {/* Merchant & Amount Rounded Twin Boxes (Matches Screenshot 3) */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="py-1.5 px-2.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-3 h-3" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-gray-800 tracking-wide uppercase">
              SAKIL HUB
            </span>
          </div>

          <div className="py-1.5 px-2.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
            <span className="text-xs sm:text-sm font-extrabold text-gray-900 font-mono">
              {numericAmount} BDT
            </span>
          </div>
        </div>

        {/* Bengali Instruction Box with Horizontal Separators (Matches Screenshot 3) */}
        <div className="rounded-xl border border-gray-200 bg-white p-3 text-[11px] sm:text-[11.5px] text-gray-700 space-y-1.5 leading-snug">
          <div className="flex items-center gap-1.5 text-gray-800">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0" />
            <span>
              আপনার <strong className="text-gray-900">{config.brandName}</strong> মোবাইল অ্যাপে যান।
            </span>
          </div>

          <div className="pt-1.5 border-t border-gray-100 flex items-center gap-1.5 text-gray-800">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0" />
            <span>
              <strong className="text-gray-900">Send Money</strong> -এ ক্লিক করুন।
            </span>
          </div>

          <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0" />
              <span>প্রাপক নম্বর:</span>
              <strong className="font-mono text-gray-900 font-bold select-all text-xs">
                {merchantNumber}
              </strong>
            </div>

            <button
              type="button"
              onClick={handleCopyNumber}
              className="shrink-0 px-2 py-0.5 rounded bg-[#0066FF] hover:bg-[#0052CC] text-white text-[10px] font-semibold flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
            >
              {copiedNumber ? (
                <>
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                  <span>কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Copy className="w-2.5 h-2.5" />
                  <span>কপি করুন</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0" />
              <span>টাকার পরিমাণ:</span>
              <strong className="font-mono text-gray-900 font-bold text-xs">
                {numericAmount}
              </strong>
            </div>

            <button
              type="button"
              onClick={handleCopyAmount}
              className="shrink-0 px-2 py-0.5 rounded bg-[#0066FF] hover:bg-[#0052CC] text-white text-[10px] font-semibold flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
            >
              {copiedAmount ? (
                <>
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                  <span>কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Copy className="w-2.5 h-2.5" />
                  <span>কপি করুন</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-1.5 border-t border-gray-100 flex items-center gap-1.5 text-gray-800">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0" />
            <span>
              নিশ্চিত করতে এখন আপনার <strong className="text-gray-900">{config.brandName}</strong> পিন লিখুন।
            </span>
          </div>

          <div className="pt-1.5 border-t border-gray-100 flex items-center gap-1.5 text-gray-800">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0" />
            <span>
              এখন নিচের বক্সে আপনার একাউন্ট নম্বর ও Transaction ID দিন এবং নিচের Verify বাটনে ক্লিক করুন।
            </span>
          </div>
        </div>

        {/* Two Input Fields At The Bottom */}
        <form onSubmit={handleFormSubmit} className="space-y-2.5 pt-1" noValidate>
          {/* Field 1: Your Account Number */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-gray-700">
              Your Account Number (আপনার একাউন্ট নম্বর) *
            </label>
            <input
              type="tel"
              required
              value={senderNumber}
              onChange={(e) => {
                onSenderNumberChange(e.target.value);
                validateField("senderNumber", e.target.value);
              }}
              placeholder="01XXXXXXXXX"
              maxLength={11}
              disabled={isProcessing}
              className={`w-full px-3 py-2 rounded-xl border bg-white text-gray-900 placeholder-gray-400 text-xs font-mono transition-colors outline-none ${
                fieldErrors.senderNumber
                  ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500/30"
                  : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              }`}
            />
            {fieldErrors.senderNumber && (
              <p className="text-[10.5px] text-red-600 flex items-center gap-1 font-semibold animate-in fade-in">
                <AlertCircle className="w-3 h-3 text-red-600 shrink-0" />
                <span>{fieldErrors.senderNumber}</span>
              </p>
            )}
          </div>

          {/* Field 2: Transaction ID */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-gray-700">
              Transaction ID (ট্রানজেকশন আইডি) *
            </label>
            <input
              type="text"
              required
              value={trxId}
              onChange={(e) => {
                onTrxIdChange(e.target.value.toUpperCase());
                validateField("trxId", e.target.value.toUpperCase());
              }}
              placeholder="ট্রানজেকশন আইডি লিখুন"
              maxLength={25}
              disabled={isProcessing}
              className={`w-full px-3 py-2 rounded-xl border bg-white text-gray-900 placeholder-gray-400 text-xs font-mono uppercase font-bold transition-colors outline-none ${
                fieldErrors.trxId
                  ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500/30"
                  : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              }`}
            />
            {fieldErrors.trxId && (
              <p className="text-[10.5px] text-red-600 flex items-center gap-1 font-semibold animate-in fade-in">
                <AlertCircle className="w-3 h-3 text-red-600 shrink-0" />
                <span>{fieldErrors.trxId}</span>
              </p>
            )}
          </div>

          {/* Themed Primary "VERIFY" Button (Matches Screenshot 3) */}
          <div className="pt-1.5">
            <button
              type="submit"
              disabled={isProcessing}
              style={{ backgroundColor: config.themeColor }}
              className="w-full py-2.5 px-4 rounded-xl text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md hover:brightness-110 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>VERIFYING...</span>
                </>
              ) : (
                <span>VERIFY</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
