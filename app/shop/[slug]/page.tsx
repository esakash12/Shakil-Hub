import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Sparkles,
  Zap,
  Check,
  ShieldCheck,
  ArrowRight,
  Key,
  Download,
  UserCheck,
  HelpCircle,
  Clock,
  Award,
  CreditCard,
  MessageCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { getStorefrontShopProductBySlugAction } from "@/lib/actions/shop";
import { DeliveryMethodType } from "@/lib/data/shop-types";

interface ShopProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ShopProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getStorefrontShopProductBySlugAction(slug);
  if (!res.success || !res.product) {
    return {
      title: "Product Not Found | Sakil Hub",
    };
  }

  return {
    title: `${res.product.title} | Sakil Hub Shop`,
    description: res.product.shortDescription,
  };
}

export default async function ShopProductPage({ params }: ShopProductPageProps) {
  const { slug } = await params;
  const res = await getStorefrontShopProductBySlugAction(slug);

  if (!res.success || !res.product) {
    notFound();
  }

  const product = res.product;

  const getDeliveryIcon = (type: DeliveryMethodType) => {
    switch (type) {
      case "account_access":
        return <UserCheck className="w-5 h-5 text-cyan-400" />;
      case "license_key":
        return <Key className="w-5 h-5 text-amber-400" />;
      case "download_link":
        return <Download className="w-5 h-5 text-emerald-400" />;
      default:
        return <Zap className="w-5 h-5 text-blue-400" />;
    }
  };

  const savingsAmount =
    product.originalPrice && product.originalPrice > product.price
      ? product.originalPrice - product.price
      : 0;

  return (
    <div className="min-h-screen bg-black text-white py-6 sm:py-10 select-none animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-400"
        >
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <Link href="/shop" className="hover:text-white transition-colors">
            Digital Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-400">{product.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-cyan-400 font-medium truncate max-w-xs sm:max-w-md">
            {product.title}
          </span>
        </nav>

        {/* Product Details & Purchase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column (8 cols): Product Deep Dive */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8 text-left">
            {/* Cover Image Showcase */}
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black/80 border border-white/15 shadow-[0_10px_40px_rgba(0,0,0,0.8)] group">
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 65vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <span className="px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-cyan-500/30 text-cyan-300 text-xs font-bold tracking-wide shadow-md">
                  {product.category}
                </span>

                {product.badge && (
                  <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-black text-xs font-black uppercase tracking-wider shadow-lg">
                    {product.badge}
                  </span>
                )}
              </div>

              {product.discountBadge && (
                <div className="absolute bottom-4 right-4 pointer-events-none">
                  <span className="px-3 py-1 rounded-lg bg-cyan-500/25 backdrop-blur-md border border-cyan-400/60 text-cyan-300 text-xs font-mono font-black shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    {product.discountBadge}
                  </span>
                </div>
              )}
            </div>

            {/* Product Header */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-semibold shadow-[0_0_12px_rgba(6,182,212,0.12)]">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Verified Digital Asset</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug">
                {product.title}
              </h1>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                {product.shortDescription}
              </p>
            </div>

            {/* Mobile Purchase Card - Placed right below Title & Cover Image so CTA is immediately visible on mobile */}
            <div className="block lg:hidden rounded-2xl bg-[#0e1320]/95 border border-cyan-500/25 p-4 sm:p-5 backdrop-blur-2xl space-y-4 shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
              {/* Pricing Header */}
              <div className="space-y-1 pb-3 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400 font-medium">Digital Product Price</span>
                  {product.discountBadge && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-mono font-bold">
                      {product.discountBadge}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2.5 pt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                    ৳{product.price}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs sm:text-sm text-zinc-500 line-through font-mono">
                      ৳{product.originalPrice}
                    </span>
                  )}
                </div>

                {savingsAmount > 0 && (
                  <p className="text-[10px] text-cyan-300 font-medium">
                    You save ৳{savingsAmount} ({product.discountBadge})
                  </p>
                )}
              </div>

              {/* Stock & Delivery Indicator */}
              <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>In Stock • Delivered Instantly After Payment</span>
              </div>

              {/* Primary CTA Button */}
              <Link
                href={`/checkout/product/${product.slug}`}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.35)] active:scale-[0.98] transition-all"
              >
                <span>Buy Now • Instant Delivery</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>

              {/* Value Checklist */}
              <div className="space-y-1.5 pt-1 border-t border-white/5 text-[11px] text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>Instant Automated Access on Order Screen</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>Official Commercial & Personal License</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>100% Replacement Warranty & Assistance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>Fast bKash, Nagad, Rocket & Card Checkout</span>
                </div>
              </div>
            </div>

            {/* Delivery Method Highlight Box */}
            <div className="p-5 sm:p-6 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 backdrop-blur-xl space-y-3 shadow-[0_0_25px_rgba(6,182,212,0.12)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  {getDeliveryIcon(product.deliveryMethod.type)}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    Fulfillment: {product.deliveryMethod.label}
                  </h3>
                  <p className="text-xs text-cyan-300/80 font-medium">
                    Instant automated dispatch upon verified checkout
                  </p>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed font-normal pl-0 sm:pl-13">
                {product.deliveryMethod.instructions}
              </p>
            </div>

            {/* Comprehensive Full Description */}
            {product.fullDescription && (
              <div className="space-y-4 p-6 sm:p-7 rounded-2xl bg-[#0e1320]/80 border border-white/10 backdrop-blur-xl">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Product Overview & Technical Specifications
                </h2>
                <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal whitespace-pre-line space-y-3">
                  {product.fullDescription}
                </div>
              </div>
            )}

            {/* Key Features / Included Specifications */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-4 p-6 sm:p-7 rounded-2xl bg-[#0e1320]/80 border border-white/10 backdrop-blur-xl">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>What You Receive With This Asset</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {product.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5 text-xs text-zinc-200"
                    >
                      <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs Section */}
            {product.faqs && product.faqs.length > 0 && (
              <div className="space-y-4 p-6 sm:p-7 rounded-2xl bg-[#0e1320]/80 border border-white/10 backdrop-blur-xl">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  <span>Frequently Asked Questions</span>
                </h2>

                <div className="space-y-3 pt-1">
                  {product.faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5"
                    >
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        {faq.question}
                      </h4>
                      <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guarantee / Buyer Protection */}
            <div className="p-6 rounded-2xl bg-[#0e1320]/60 border border-white/10 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Sakil Hub 100% Working Guarantee
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-xl font-normal">
                  All software accounts, license keys, and downloadable template archives are verified by our technical staff. If you encounter any functional issues, our WhatsApp support team provides instant replacement or resolution.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (4-5 cols): Floating Sticky Purchase Card (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-20 space-y-4">
            <div className="rounded-2xl bg-[#0e1320]/95 border border-white/15 p-6 sm:p-7 backdrop-blur-2xl space-y-6 shadow-[0_15px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(6,182,212,0.15)]">
              {/* Pricing Header */}
              <div className="space-y-1.5 pb-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Digital Product Price</span>
                  {product.discountBadge && (
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[11px] font-mono font-bold">
                      {product.discountBadge}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                    ৳{product.price}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm sm:text-base text-zinc-500 line-through font-mono">
                      ৳{product.originalPrice}
                    </span>
                  )}
                </div>

                {savingsAmount > 0 && (
                  <p className="text-[11px] text-cyan-300 font-medium pt-0.5">
                    You save ৳{savingsAmount} ({product.discountBadge})
                  </p>
                )}
              </div>

              {/* Stock & Delivery Indicator */}
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
                <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>In Stock • Delivered Instantly After Payment</span>
              </div>

              {/* Primary CTA Button */}
              <Link
                href={`/checkout/product/${product.slug}`}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black text-sm tracking-wide shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Buy Now • Instant Delivery</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>

              {/* Value Checklist */}
              <div className="space-y-2.5 pt-2 border-t border-white/5 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Instant Automated Access on Order Screen</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Official Commercial & Personal License</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>100% Replacement Warranty & Assistance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Fast bKash, Nagad, Rocket & Card Checkout</span>
                </div>
              </div>

              {/* Payment Methods Pill */}
              <div className="pt-2 border-t border-white/10 space-y-2 text-center">
                <p className="text-[11px] text-zinc-400 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3 text-cyan-400" />
                  <span>Encrypted 256-Bit SSL Checkout</span>
                </p>
                <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400">
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono">
                    bKash
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono">
                    Nagad
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono">
                    Rocket
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono">
                    Debit/Credit
                  </span>
                </div>
              </div>
            </div>

            {/* Need Help Card */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-cyan-400" />
                <span>Need help with this product?</span>
              </div>
              <a
                href="https://wa.me/8801712345678"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 font-bold"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
