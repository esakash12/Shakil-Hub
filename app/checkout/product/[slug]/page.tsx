"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  ShoppingBag,
  ArrowRight,
  Lock,
  User,
  MessageSquare,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { getStorefrontShopProductBySlugAction } from "@/lib/actions/shop";
import { getLMSSettingsAction, LMSSettingsPayload } from "@/lib/actions/admin-settings";
import { getCustomerProfile } from "@/lib/actions/auth";
import { DigitalProduct } from "@/lib/data/shop-types";
import {
  nameSchema,
  bangladeshiPhoneSchema,
  productCheckoutFormSchema,
} from "@/lib/security/schemas";

export default function ProductCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "";

  const [product, setProduct] = useState<DigitalProduct | null>(null);
  const [settings, setSettings] = useState<LMSSettingsPayload>({
    bkashNumber: "01754511619",
    nagadNumber: "01812345678",
    rocketNumber: "01912345678",
    supportEmail: "support@sakilhub.com",
    supportPhone: "+880 1712-345678",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    whatsappNumber?: string;
  }>({});

  const [formData, setFormData] = useState({
    fullName: "",
    whatsappNumber: "",
  });

  const validateField = (field: "fullName" | "whatsappNumber", value: string) => {
    const schema = field === "fullName" ? nameSchema : bangladeshiPhoneSchema;
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

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [shopRes, settingsRes, profile] = await Promise.all([
          getStorefrontShopProductBySlugAction(slug),
          getLMSSettingsAction(),
          getCustomerProfile(),
        ]);

        if (isMounted) {
          if (shopRes.success && shopRes.product) {
            setProduct(shopRes.product);
          }

          if (settingsRes) {
            setSettings(settingsRes);
          }

          if (profile) {
            const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
            setFormData((prev) => ({
              fullName: prev.fullName || fullName || "",
              whatsappNumber: prev.whatsappNumber || profile.phone || "",
            }));
          }

          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load product for checkout:", err);
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const result = productCheckoutFormSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        if (path && !newErrors[path]) {
          newErrors[path] = issue.message;
        }
      });
      setFieldErrors(newErrors);
      setErrorMsg("Please correct the errors marked below before continuing.");
      return;
    }

    setFieldErrors({});
    const cleanFullName = result.data.fullName;
    const cleanWhatsapp = result.data.whatsappNumber;

    // 1. Caches customer details in sessionStorage
    try {
      sessionStorage.setItem(
        "sakil_checkout_data",
        JSON.stringify({
          fullName: cleanFullName,
          email: `${cleanWhatsapp.slice(-8)}@customer.sakilhub.com`,
          phone: cleanWhatsapp,
          whatsappNumber: cleanWhatsapp,
          itemType: "product",
        })
      );
    } catch {}

    // 2. Encodes fallback query parameters
    const query = new URLSearchParams({
      name: cleanFullName,
      whatsapp: cleanWhatsapp,
      type: "product",
    });

    // 3. Routes to isolated payment gateway
    router.push(`/pay/${slug}?${query.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4 select-none">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shadow-inner">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-sm font-semibold text-white">
            Preparing Secure Product Checkout...
          </h3>
          <p className="text-xs text-zinc-500">
            Verifying inventory and pricing information.
          </p>
        </div>
      </div>
    );
  }

  const priceVal = product?.price || 499;
  const originalPriceVal = product?.originalPrice || Math.round(priceVal * 1.5);
  const savingsVal = originalPriceVal > priceVal ? originalPriceVal - priceVal : 0;

  return (
    <div className="min-h-screen text-white py-3 sm:py-8 lg:py-10 select-none animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-3 sm:space-y-6 lg:space-y-8">
        {/* Breadcrumb Navigation (Hidden on Mobile, Visible on Desktop) */}
        <nav className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-zinc-600" />
          <Link href="/shop" className="hover:text-white transition-colors">
            Digital Shop
          </Link>
          <ChevronRight className="w-3 h-3 text-zinc-600" />
          <Link
            href={`/shop/${slug}`}
            className="hover:text-white transition-colors truncate max-w-[160px] sm:max-w-xs"
          >
            {product?.title || "Product"}
          </Link>
          <ChevronRight className="w-3 h-3 text-zinc-600" />
          <span className="text-cyan-400 font-medium">Checkout</span>
        </nav>

        {/* E-Commerce Page Header (Hidden on Mobile to match Screenshot 4, Visible on Desktop) */}
        <div className="hidden sm:flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-[11px] font-semibold">
              <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
              <span>Secure Digital Checkout</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Complete Your Purchase
            </h1>
            <p className="text-xs text-zinc-400">
              Provide your details below for instant digital license delivery and WhatsApp dispatch.
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 text-xs shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <span className="w-5 h-5 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-[10px] font-bold">
                1
              </span>
              <span>Details</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-black/40 border-white/10 text-zinc-500">
              <span className="w-5 h-5 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-[10px] font-bold">
                2
              </span>
              <span>Payment</span>
            </div>
          </div>
        </div>

        {/* 2-Column Checkout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-6 lg:gap-8 items-start">
          {/* Left Column: Digital Product Order Summary */}
          <div className="lg:col-span-5 space-y-2.5 sm:space-y-4">
            <div className="rounded-2xl sm:rounded-3xl bg-[#0e1320]/90 border border-white/10 p-3.5 sm:p-6 space-y-2.5 sm:space-y-4 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-white/5">
                <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Digital Asset Summary
                </h2>
                <span className="text-xs text-emerald-400 font-mono font-bold">
                  {product?.discountBadge || "EXCLUSIVE DEAL"}
                </span>
              </div>

              {/* Product Info Block */}
              <div className="flex gap-3 items-center">
                <div className="relative w-16 h-14 sm:w-20 sm:h-16 rounded-xl overflow-hidden bg-black/70 border border-white/10 shrink-0 flex items-center justify-center shadow-md">
                  {product?.thumbnail ? (
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <Zap className="w-5 h-5 text-cyan-400" />
                  )}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-tight line-clamp-2">
                    {product?.title || "Digital Product"}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-cyan-300 font-medium">
                    Category: {product?.category || "Digital Tool"}
                  </p>
                </div>
              </div>

              {/* Guarantees & Features */}
              <div className="space-y-1 sm:space-y-2 pt-1.5 sm:pt-2 border-t border-white/5 text-[11px] sm:text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Instant Automated Delivery via WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>100% Tested & Verified Working Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Full Commercial & Personal Use License</span>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs">
                <div className="flex justify-between text-zinc-400 text-[11px] sm:text-xs">
                  <span>List Price</span>
                  <span className="line-through">৳{originalPriceVal}</span>
                </div>
                {savingsVal > 0 && (
                  <div className="flex justify-between text-emerald-400 text-[11px] sm:text-xs">
                    <span>Instant Discount</span>
                    <span>- ৳{savingsVal}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-1.5 border-t border-white/10 text-xs sm:text-base font-bold text-white">
                  <span>Total Payable:</span>
                  <span className="text-lg sm:text-2xl font-black font-mono text-cyan-400">
                    ৳{priceVal}
                  </span>
                </div>
              </div>
            </div>

            {/* Helpline Notice */}
            <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0e1320]/60 border border-white/10 flex items-center gap-2 text-[10.5px] sm:text-xs text-zinc-400 backdrop-blur-xl">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>
                Need instant assistance? Contact WhatsApp support at{" "}
                <strong className="text-white">
                  {settings.supportPhone || "+880 1712-345678"}
                </strong>.
              </span>
            </div>
          </div>

          {/* Right Column: Pure E-Commerce Form (Only Full Name & WhatsApp) */}
          <div className="lg:col-span-7">
            <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-[#0e1320]/95 backdrop-blur-2xl p-4 sm:p-7 space-y-3.5 sm:space-y-5 shadow-[0_20px_60px_rgba(0,0,0,0.75)] animate-in fade-in duration-300">
              {/* Form Title */}
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Customer Information
                </h2>
                <p className="text-xs text-zinc-400">
                  Minimal details required. We deliver your download links, license keys, and credentials directly via WhatsApp.
                </p>
              </div>

              {/* Error Notice */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Minimal 2-Field Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
                {/* Field 1: Full Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Full Name (পূর্ণ নাম) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => {
                        setErrorMsg("");
                        setFormData((prev) => ({ ...prev, fullName: e.target.value }));
                        validateField("fullName", e.target.value);
                      }}
                      placeholder="e.g. Tanvir Ahmed"
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-black/50 border text-white placeholder-zinc-500 text-xs sm:text-sm transition-colors outline-none ${
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

                {/* Field 2: WhatsApp Number */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-300">
                    WhatsApp Number (হোয়াটসঅ্যাপ নম্বর) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <MessageSquare className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={formData.whatsappNumber}
                      onChange={(e) => {
                        setErrorMsg("");
                        setFormData((prev) => ({ ...prev, whatsappNumber: e.target.value }));
                        validateField("whatsappNumber", e.target.value);
                      }}
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-black/50 border text-white placeholder-zinc-500 text-xs sm:text-sm transition-colors outline-none font-mono ${
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
                    <p className="text-[10.5px] sm:text-[11px] text-zinc-500">
                      Your digital files, access credentials, and license key will be dispatched directly to this WhatsApp.
                    </p>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-1.5">
                  <button
                    type="submit"
                    className="w-full py-3 sm:py-3.5 rounded-xl border border-cyan-300 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.65)] active:scale-[0.99] transition-all duration-200 cursor-pointer"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </button>
                </div>

                {/* Security Trust Badges */}
                <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-zinc-500">
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-cyan-400" />
                    <span>256-Bit Encrypted Portal</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Verified E-Commerce Checkout</span>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
