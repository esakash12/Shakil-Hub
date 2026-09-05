"use client";

import React from "react";
import { User, Mail, Phone, ShieldCheck } from "lucide-react";

export default function BillingDetailsForm({
  formData,
  setFormData,
}: {
  formData: {
    fullName: string;
    email: string;
    phone: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      fullName: string;
      email: string;
      phone: string;
    }>
  >;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" />
          1. Billing Details
        </h2>
        <span className="text-xs text-gray-500 font-normal">Step 1 of 2</span>
      </div>

      <div className="space-y-3.5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">
            Full Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              minLength={2}
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder="e.g. Tanvir Ahmed"
              className="w-full rounded-xl bg-white/[0.03] border border-white/10 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">
            Email Address (for course access) *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="tanvir@example.com"
              className="w-full rounded-xl bg-white/[0.03] border border-white/10 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">
            Phone Number (11 Digits) *
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="tel"
              required
              pattern="^01[3-9][0-9]{8}$"
              maxLength={11}
              title="11-digit Bangladeshi mobile number starting with 01"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="01XXXXXXXXX"
              className="w-full rounded-xl bg-white/[0.03] border border-white/10 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
