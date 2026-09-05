"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { adminLoginAction } from "@/lib/actions/admin-auth";
import { adminLoginSchema, emailSchema } from "@/lib/security/schemas";
import { z } from "zod";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (field: "email" | "password", value: string) => {
    if (field === "email") {
      const res = emailSchema.safeParse(value);
      if (!res.success) {
        setFieldErrors((prev) => ({ ...prev, email: res.error.issues[0]?.message }));
      } else {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next.email;
          return next;
        });
      }
    } else if (field === "password") {
      if (value.length < 6) {
        setFieldErrors((prev) => ({ ...prev, password: "Password must be at least 6 characters" }));
      } else {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next.password;
          return next;
        });
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const validation = adminLoginSchema.safeParse({ email, password });
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        if (path && !newErrors[path]) {
          newErrors[path] = issue.message;
        }
      });
      setFieldErrors(newErrors);
      setErrorMessage("Please enter a valid administrator email and password (min 6 characters).");
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);

      const res = await adminLoginAction(formData);

      if (res?.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setErrorMessage(res?.error || "Authentication failed. Please verify your credentials.");
      }
    } catch {
      setErrorMessage("An unexpected network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Top Console Brand Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold backdrop-blur-xl shadow-inner">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Enterprise Admin Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Sakil<span className="text-blue-500">Hub</span> Console
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-normal">
            Secure administrative gateway for masterclass & platform management.
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            {/* Email Field */}
            <div className="space-y-1">
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold text-gray-300"
              >
                Administrator Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    validateField("email", e.target.value);
                  }}
                  placeholder="admin@sakilhub.com"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border text-xs sm:text-sm text-white placeholder-gray-600 transition-all font-mono outline-none ${
                    fieldErrors.email
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                      : "border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-red-400 flex items-center gap-1 mt-0.5 font-medium animate-in fade-in">
                  <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
                  <span>{fieldErrors.email}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label
                htmlFor="admin-pass"
                className="block text-xs font-semibold text-gray-300"
              >
                Security Key / Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="admin-pass"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validateField("password", e.target.value);
                  }}
                  placeholder="••••••••••••"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/60 border text-xs sm:text-sm text-white placeholder-gray-600 transition-all font-mono outline-none ${
                    fieldErrors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                      : "border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-red-400 flex items-center gap-1 mt-0.5 font-medium animate-in fade-in">
                  <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
                  <span>{fieldErrors.password}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate & Access Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Reminder */}
          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Demo: <strong className="text-gray-300 font-mono">admin@sakilhub.com</strong></span>
            <span>Key: <strong className="text-gray-300 font-mono">admin123456</strong></span>
          </div>
        </div>

        {/* Security Assurance Footer */}
        <div className="text-center text-[11px] text-gray-600 mt-6 flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3 text-blue-500/50" />
          <span>256-Bit SSL Encrypted • Headless LMS Engine</span>
        </div>
      </div>
    </div>
  );
}
