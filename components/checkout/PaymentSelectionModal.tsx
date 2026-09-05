"use client";

import React, { useState } from "react";
import {
  X,
  Headphones,
  HelpCircle,
  Info,
  Check,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import {
  PaymentGatewayType,
  BkashLogo,
  NagadLogo,
  RocketLogo,
} from "./ThemedPaymentGateway";

interface PaymentSelectionModalProps {
  onSelect: (gateway: PaymentGatewayType) => void;
  onBackToDetails?: () => void;
  onClose?: () => void;
  numericAmount: number;
  payableAmountFormatted: string;
}

export default function PaymentSelectionModal({
  onSelect,
  onBackToDetails,
  onClose,
  numericAmount,
  payableAmountFormatted,
}: PaymentSelectionModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentGatewayType>("bkash");
  const [activeTab, setActiveTab] = useState<"none" | "help" | "faq" | "details">("none");

  const methods: {
    id: PaymentGatewayType;
    name: string;
    subtext: string;
    logo: React.ComponentType<{ className?: string }>;
    accentColor: string;
    badge: string;
  }[] = [
    {
      id: "bkash",
      name: "bKash",
      subtext: "bKash Personal",
      logo: BkashLogo,
      accentColor: "#E2136E",
      badge: "জনপ্রিয়",
    },
    {
      id: "nagad",
      name: "Nagad",
      subtext: "Nagad Personal",
      logo: NagadLogo,
      accentColor: "#F37021",
      badge: "দ্রুততম",
    },
    {
      id: "rocket",
      name: "Rocket",
      subtext: "Rocket Personal",
      logo: RocketLogo,
      accentColor: "#8C1595",
      badge: "ডিবিবিএল",
    },
  ];

  const handleProceed = () => {
    onSelect(selectedMethod);
  };

  return (
    <div className="w-full max-w-[430px] sm:max-w-[440px] mx-auto bg-white text-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200/80 overflow-hidden select-none animate-in fade-in zoom-in-95 duration-200">
      {/* Top Close Button (Matches Screenshot 1) */}
      <div className="px-4 pt-2.5 pb-0.5 flex items-center justify-end">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-3">
        {/* Merchant Header Bar (Matches Screenshot 1) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-0.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-gray-900 tracking-tight leading-none uppercase">
                SAKIL HUB
              </h2>
              <span className="text-[10px] text-gray-500 font-medium">
                Verified Education & Creator Store
              </span>
            </div>
          </div>

          {/* 3 Action Links: সহায়তা, প্রণালী, বিস্তারিত (Matches Screenshot 1) */}
          <div className="flex items-center gap-2.5 text-[11px] text-gray-600">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "help" ? "none" : "help")}
              className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <Headphones className="w-3 h-3 text-blue-600" />
              <span>সহায়তা</span>
            </button>
            <span className="text-gray-300">•</span>
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "faq" ? "none" : "faq")}
              className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3 h-3 text-blue-600" />
              <span>প্রণালী</span>
            </button>
            <span className="text-gray-300">•</span>
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "details" ? "none" : "details")}
              className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <Info className="w-3 h-3 text-blue-600" />
              <span>বিস্তারিত</span>
            </button>
          </div>
        </div>

        {/* Collapsible Info Cards */}
        {activeTab === "help" && (
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-[11px] text-blue-950 space-y-0.5 animate-in fade-in">
            <p className="font-bold">সরাসরি সহায়তা / সাপোর্ট:</p>
            <p>যেকোনো পেমেন্ট সংক্রান্ত প্রয়োজনে আমাদের হেল্পলাইনে হোয়াটসঅ্যাপ করুন: +880 1712-345678</p>
          </div>
        )}
        {activeTab === "faq" && (
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-[11px] text-blue-950 space-y-0.5 animate-in fade-in">
            <p className="font-bold">পেমেন্ট প্রণালী:</p>
            <p>আপনার মোবাইল ব্যাংকিং অ্যাপ থেকে Send Money করে Transaction ID জমা দিন।</p>
          </div>
        )}
        {activeTab === "details" && (
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-[11px] text-blue-950 space-y-0.5 animate-in fade-in">
            <p className="font-bold">অর্ডার বিস্তারিত:</p>
            <p>মোট প্রদেয় অর্থ: {payableAmountFormatted} (সম্পূর্ণ লাইফটাইম অ্যাক্সেস)</p>
          </div>
        )}

        {/* Solid Blue Banner: "পেমেন্ট পদ্ধতি নির্বাচন করুন" (Matches Screenshot 1) */}
        <div className="w-full py-1.5 px-3 rounded-lg bg-[#0066FF] text-white text-center text-xs font-bold tracking-wide shadow-xs">
          পেমেন্ট পদ্ধতি নির্বাচন করুন
        </div>

        {/* Grid of Payment Methods (3 Columns Horizontal on BOTH Mobile & Desktop to Match Screenshot 5) */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
          {methods.map((method) => {
            const isSelected = selectedMethod === method.id;
            const LogoComponent = method.logo;

            return (
              <button
                key={method.id}
                type="button"
                onClick={() => {
                  setSelectedMethod(method.id);
                  onSelect(method.id);
                }}
                className={`group relative p-2 sm:p-3 rounded-xl border text-center flex flex-col items-center justify-between gap-1 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-[#0066FF] ring-2 ring-[#0066FF]/20 bg-blue-50/50 shadow-xs"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/80"
                }`}
              >
                {/* Method Logo with Authentic Color */}
                <div className="flex items-center justify-center gap-1 pt-0.5">
                  <span style={{ color: method.accentColor }}>
                    <LogoComponent className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" />
                  </span>
                  <span
                    className="text-xs sm:text-sm font-black tracking-tight"
                    style={{ color: method.accentColor }}
                  >
                    {method.name}
                  </span>
                </div>

                {/* Subtitle */}
                <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium truncate max-w-full">
                  {method.subtext}
                </span>

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-1 right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#0066FF] text-white flex items-center justify-center">
                    <Check className="w-2 h-2 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Action Button: "Pay 100.00 BDT" (Matches Screenshot 1) */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleProceed}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Pay {numericAmount.toFixed(2)} BDT</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Back to details link */}
        {onBackToDetails && (
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onBackToDetails}
              className="text-xs text-gray-500 hover:text-gray-800 underline font-medium cursor-pointer"
            >
              তথ্য পরিবর্তন করুন (Edit Customer Info)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
