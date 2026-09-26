"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Play,
  AlertCircle,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  RefreshCw,
  Edit3,
} from "lucide-react";
import {
  initiateRegistrationAction,
  completeRegistrationAction,
  resendRegistrationOtpAction,
} from "@/lib/actions/auth";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  // Step 1: Form state
  const [step, setStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Step 2: OTP state
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Countdown timer for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (step === 2 && resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendCooldown]);

  // Handle Step 1: Send Verification OTP
  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!firstName.trim()) {
      setError("First name is required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Valid email address is required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!agreedTerms) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("first_name", firstName);
      formData.set("last_name", lastName);
      formData.set("email", email);
      formData.set("password", password);

      const res = await initiateRegistrationAction(formData);

      if (res.success) {
        setStep(2);
        setResendCooldown(60);
        setCanResend(false);
        setInfoMessage(
          `আমরা ${email} ঠিকানায় ৬-সংখ্যার ভেরিফিকেশন কোড পাঠিয়েছি।`
        );
      } else {
        setError(res.error || "Failed to start registration.");
      }
    } catch {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Verify OTP & Complete Account Creation
  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const result = await completeRegistrationAction(email, cleanOtp);

      if (result.success) {
        setInfoMessage("ইমেইল সফলভাবে ভেরিফাইড! আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...");
        const destination =
          redirectUrl && redirectUrl.startsWith("/") ? redirectUrl : "/dashboard";
        setTimeout(() => {
          window.location.href = destination;
        }, 1200);
      } else {
        setError(result.error || "Invalid or expired verification code.");
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || resending) return;
    setError(null);
    setResending(true);

    try {
      const res = await resendRegistrationOtpAction(email);
      if (res.success) {
        setInfoMessage(res.message || "A fresh 6-digit code has been sent!");
        setResendCooldown(60);
        setCanResend(false);
      } else {
        setError(res.error || "Failed to resend code.");
      }
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 w-full max-w-md rounded-2xl bg-[#0c1017] border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Sakil<span className="text-blue-500">Hub</span>
          </span>
        </Link>

        {step === 1 ? (
          <>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Create Your Account
            </h1>
            <p className="text-xs text-gray-400 font-normal">
              Join 20,000+ students mastering creative video editing today.
            </p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-1">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Verify Your Email
            </h1>
            <p className="text-xs text-gray-400 font-normal max-w-xs mx-auto">
              We sent a 6-digit verification code to{" "}
              <span className="text-cyan-400 font-medium font-mono">{email}</span>
            </p>
          </>
        )}
      </div>

      {/* Error Notification */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Info / Success Notification */}
      {infoMessage && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{infoMessage}</span>
        </motion.div>
      )}

      {/* STEP 1: Registration Form */}
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleInitiate}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  First Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Tanvir"
                    className="w-full rounded-xl bg-white/[0.03] border border-white/10 pl-10 pr-3 py-2.5 text-base sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ahmed"
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 pl-10 pr-4 py-2.5 text-base sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 pl-10 pr-10 py-2.5 text-base sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                required
                className="w-3.5 h-3.5 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-0 mt-0.5 cursor-pointer"
              />
              <label htmlFor="terms" className="text-[11px] text-gray-400 select-none leading-tight cursor-pointer">
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="text-cyan-400 hover:text-cyan-300 underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" className="text-cyan-400 hover:text-cyan-300 underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 border border-blue-400/50 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] hover:scale-[1.02] active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Sending Verification Code...</span>
                </span>
              ) : (
                <>
                  <span>Continue with Email Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.form>
        ) : (
          /* STEP 2: OTP Verification Form */
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleComplete}
            className="space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  Enter 6-Digit OTP Code
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError(null);
                    setInfoMessage(null);
                  }}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Email</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="••••••"
                  className="w-full rounded-xl bg-white/[0.03] border border-cyan-500/40 px-4 py-3 text-2xl font-mono tracking-[0.5em] text-center text-cyan-400 placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5 text-center">
                Please check your inbox or spam folder for the code.
              </p>
            </div>

            {/* Verify & Complete Button */}
            <button
              type="submit"
              disabled={loading || otp.trim().length !== 6}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 border border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:scale-[1.02] active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying Code...</span>
                </span>
              ) : (
                <>
                  <span>Verify &amp; Activate Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend Code Section */}
            <div className="pt-2 flex items-center justify-between text-xs text-gray-400 border-t border-white/5">
              <span>Didn&apos;t receive code?</span>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {resending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span>Resend Code</span>
                </button>
              ) : (
                <span className="text-gray-500 font-mono text-[11px]">
                  Resend in {resendCooldown}s
                </span>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Footer Login Link */}
      <div className="pt-2 text-center text-xs text-gray-400 border-t border-white/5">
        Already have an account?{" "}
        <Link
          href={redirectUrl !== "/dashboard" ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : "/login"}
          className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
        >
          Sign In
        </Link>
      </div>
    </motion.div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-12 relative overflow-hidden select-none">
      {/* Ambient Blue Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />

      <Suspense fallback={<div className="text-gray-400 text-xs">Loading registration...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
