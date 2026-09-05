"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, ShieldCheck, Check, Save, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { getCustomerProfile, updateCustomerProfileAction } from "@/lib/actions/auth";

export default function SettingsPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getCustomerProfile();
      if (data) {
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await updateCustomerProfileAction(formData);
      if (res.success) {
        setSaved(true);
        if (res.customer) {
          setFirstName(res.customer.first_name || "");
          setLastName(res.customer.last_name || "");
        }
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(res.error || "Failed to update profile settings.");
      }
    } catch {
      setError("An unexpected error occurred while saving your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-3xl select-none">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>Profile & Security</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-normal">
          Manage your student credentials and personal profile information.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Details Card */}
      <form
        onSubmit={handleSave}
        className="rounded-2xl bg-white/[0.02] border border-white/5 p-5 sm:p-6 space-y-4"
      >
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" />
          Personal Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              First Name
            </label>
            <input
              type="text"
              name="first_name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              disabled={loading || isSaving}
              className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Last Name
            </label>
            <input
              type="text"
              name="last_name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              disabled={loading || isSaving}
              className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                disabled
                value={email || "Loading..."}
                className="w-full rounded-xl bg-white/[0.01] border border-white/5 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-400 cursor-not-allowed"
              />
            </div>
            <span className="text-[10px] text-gray-500 mt-1 block">
              Email is managed by admin. Contact support for modifications.
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              disabled={loading || isSaving}
              className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-colors"
            />
          </div>
        </div>

        <div className="pt-3 flex items-center justify-between">
          <button
            type="submit"
            disabled={loading || isSaving}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : saved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Changes Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
