"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Play, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { loginAction, logoutAction } from "@/lib/actions/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const queryError = searchParams.get("error");
  const shouldLogout = searchParams.get("logout") === "true";
  const queryReset = searchParams.get("reset");
  const [resetSuccess, setResetSuccess] = useState<boolean>(queryReset === "success");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    if (queryError === "account_suspended") {
      return "⛔ Account Suspended: Your student account has been suspended by administration. You have been automatically logged out.";
    }
    if (queryError === "session_expired") {
      return "Your session has expired. Please sign in again.";
    }
    return null;
  });

  useEffect(() => {
    if (queryError === "account_suspended" || shouldLogout) {
      logoutAction().catch(() => {});
    }
  }, [queryError, shouldLogout]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result.success) {
      const destination =
        redirectUrl && redirectUrl.startsWith("/") ? redirectUrl : "/dashboard";
      window.location.href = destination;
    } else {
      setError(result.error || "Invalid email or password.");
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md rounded-2xl bg-[#0c1017] border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6"
      >
        {/* Header Logo & Title */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Sakil<span className="text-blue-500">Hub</span>
            </span>
          </Link>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs text-gray-400 font-normal">
            Sign in to continue your video editing masterclasses.
          </p>
        </div>

        {/* Reset Success Notification */}
        {resetSuccess && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2"
          >
            <span>✓ Password updated successfully! Please sign in with your new password.</span>
          </motion.div>
        )}

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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                name="email"
                required
                placeholder="student@example.com"
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 pl-10 pr-4 py-2.5 text-base sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-gray-300">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 pl-10 pr-4 py-2.5 text-base sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="remember"
              defaultChecked
              className="w-3.5 h-3.5 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-0"
            />
            <label htmlFor="remember" className="text-xs text-gray-400 select-none">
              Remember my session
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
                <span>Signing In...</span>
              </span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Signup Link */}
        <div className="pt-2 text-center text-xs text-gray-400 border-t border-white/5">
          Don&apos;t have an account yet?{" "}
          <Link
            href={redirectUrl !== "/dashboard" ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : "/register"}
            className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
          >
            Create an Account
          </Link>
        </div>
      </motion.div>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-12 relative overflow-hidden select-none">
      {/* Ambient Blue Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />

      <Suspense fallback={<div className="text-gray-400 text-xs">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
