"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  AlertCircle,
  Lock,
} from "lucide-react";
import {
  nameSchema,
  emailSchema,
  bangladeshiPhoneSchema,
  courseCheckoutFormSchema,
  productCheckoutFormSchema,
} from "@/lib/security/schemas";

export interface CustomerFormData {
  fullName: string;
  email: string;
  phone: string;
  whatsappNumber: string;
}

interface DynamicCheckoutFormProps {
  itemType: "course" | "product";
  formData: CustomerFormData;
  onChange: (data: Partial<CustomerFormData>) => void;
  onContinue: () => void;
  isProcessing?: boolean;
}

export default function DynamicCheckoutForm({
  itemType,
  formData,
  onChange,
  onContinue,
  isProcessing = false,
}: DynamicCheckoutFormProps) {
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    whatsappNumber?: string;
  }>({});

  const validateField = (field: keyof CustomerFormData, value: string) => {
    let schema: any;
    if (field === "fullName") schema = nameSchema;
    else if (field === "email") schema = emailSchema;
    else if (field === "phone" || field === "whatsappNumber") schema = bangladeshiPhoneSchema;

    if (!schema) return;

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

  const handleCopyPhoneToWhatsapp = () => {
    if (formData.phone) {
      onChange({ whatsappNumber: formData.phone });
      validateField("whatsappNumber", formData.phone);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    const schema = isCourse ? courseCheckoutFormSchema : productCheckoutFormSchema;
    const result = schema.safeParse(formData);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        if (path && !newErrors[path]) {
          newErrors[path] = issue.message;
        }
      });
      setFieldErrors(newErrors);
      setGeneralError("Please correct the errors marked below before continuing.");
      return;
    }

    setFieldErrors({});
    // Validation passed -> Advance to Payment Gateway
    onContinue();
  };

  const isCourse = itemType === "course";

  return (
    <div className="w-full rounded-3xl overflow-hidden border border-white/10 bg-[#0e1320]/95 backdrop-blur-2xl p-6 sm:p-7 space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.75)] animate-in fade-in duration-300">
      {/* Header & Step Badge */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-[11px] font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Step 1 of 2: {isCourse ? "Student Information" : "Delivery Details"}</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          {isCourse ? "Enter Student Information" : "Instant Delivery Information"}
        </h2>

        <p className="text-xs text-zinc-400 leading-relaxed">
          {isCourse
            ? "Provide your credentials below to register your student profile and enable lifetime dashboard access."
            : "Minimal details required. We deliver your digital files, license keys, and credentials directly via WhatsApp."}
        </p>
      </div>

      {/* General Error Alert */}
      {generalError && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{generalError}</span>
        </div>
      )}

      {/* The Dynamic Form */}
      <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
        {/* Full Name */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-zinc-300">
            Full Name <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => {
                setGeneralError("");
                onChange({ fullName: e.target.value });
                validateField("fullName", e.target.value);
              }}
              placeholder="e.g. Tanvir Ahmed"
              disabled={isProcessing}
              className={`w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border text-white placeholder-zinc-500 text-xs sm:text-sm transition-colors outline-none ${
                fieldErrors.fullName
                  ? "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/40"
                  : "border-white/10 hover:border-white/20 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
              }`}
            />
          </div>
          {fieldErrors.fullName && (
            <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1 font-medium animate-in fade-in">
              <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
              <span>{fieldErrors.fullName}</span>
            </p>
          )}
        </div>

        {/* WhatsApp Number */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-zinc-300">
              WhatsApp Number <span className="text-red-400">*</span>
            </label>
            {isCourse && formData.phone && formData.phone !== formData.whatsappNumber && (
              <button
                type="button"
                onClick={handleCopyPhoneToWhatsapp}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-semibold transition-colors cursor-pointer"
              >
                Same as Phone Number
              </button>
            )}
          </div>
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="tel"
              required
              value={formData.whatsappNumber}
              onChange={(e) => {
                setGeneralError("");
                onChange({ whatsappNumber: e.target.value });
                validateField("whatsappNumber", e.target.value);
              }}
              placeholder="01XXXXXXXXX"
              maxLength={11}
              disabled={isProcessing}
              className={`w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border text-white placeholder-zinc-500 text-xs sm:text-sm transition-colors outline-none font-mono ${
                fieldErrors.whatsappNumber
                  ? "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/40"
                  : "border-white/10 hover:border-white/20 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
              }`}
            />
          </div>
          {fieldErrors.whatsappNumber ? (
            <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1 font-medium animate-in fade-in">
              <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
              <span>{fieldErrors.whatsappNumber}</span>
            </p>
          ) : (
            <p className="text-[11px] text-zinc-500">
              {isCourse
                ? "Used for instant batch invitations and private Telegram/WhatsApp community access."
                : "Digital access links and software credentials will be dispatched to this WhatsApp."}
            </p>
          )}
        </div>

        {/* Course Specific Required Fields: Email Address & Phone Number */}
        {isCourse && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email Address */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-300">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setGeneralError("");
                    onChange({ email: e.target.value });
                    validateField("email", e.target.value);
                  }}
                  placeholder="name@email.com"
                  disabled={isProcessing}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border text-white placeholder-zinc-500 text-xs sm:text-sm transition-colors outline-none ${
                    fieldErrors.email
                      ? "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/40"
                      : "border-white/10 hover:border-white/20 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1 font-medium animate-in fade-in">
                  <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
                  <span>{fieldErrors.email}</span>
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-300">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => {
                    setGeneralError("");
                    onChange({ phone: e.target.value });
                    validateField("phone", e.target.value);
                  }}
                  placeholder="01XXXXXXXXX"
                  maxLength={11}
                  disabled={isProcessing}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 border text-white placeholder-zinc-500 text-xs sm:text-sm transition-colors outline-none font-mono ${
                    fieldErrors.phone
                      ? "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500/40"
                      : "border-white/10 hover:border-white/20 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
                  }`}
                />
              </div>
              {fieldErrors.phone && (
                <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1 font-medium animate-in fade-in">
                  <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
                  <span>{fieldErrors.phone}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Button: "Continue to Payment" */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 rounded-xl border border-cyan-300 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.65)] active:scale-[0.99] transition-all duration-200 cursor-pointer"
          >
            <span>Continue to Payment</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </div>

        {/* Security badges */}
        <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-zinc-500">
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-cyan-400" />
            <span>256-Bit SSL Encrypted</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Official Verified Checkout</span>
          </div>
        </div>
      </form>
    </div>
  );
}
