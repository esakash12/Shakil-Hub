import React from "react";
import type { Metadata } from "next";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Award,
  Headphones,
} from "lucide-react";
import { getStorefrontShopProductsAction } from "@/lib/actions/shop";
import ShopCatalogClient from "@/components/shop/ShopCatalogClient";

export const metadata: Metadata = {
  title: "Digital Shop & Creator Assets | Sakil Hub",
  description:
    "Get instant access to CapCut Pro subscriptions, viral Midjourney AI prompt bundles, cinematic Premiere Pro transitions, and Hollywood LUTs.",
};

export default async function ShopPage() {
  const res = await getStorefrontShopProductsAction();

  return (
    <div className="min-h-screen bg-black text-white pt-3 sm:pt-5 pb-12 sm:pb-16 select-none animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* ========================================================================= */}
        {/* === STRICT ZERO-DISTRACTION SHOP: FILTERS & PRODUCTS START DIRECTLY   === */}
        {/* ========================================================================= */}
        <ShopCatalogClient
          initialProducts={res.products}
          categories={res.categories}
        />

        {/* ========================================================================= */}
        {/* === BOTTOM: SLEEK PRE-FOOTER TRUST & FEATURE BANNER                   === */}
        {/* ========================================================================= */}
        <div className="pt-8 border-t border-white/10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Scaled-Down Text Context */}
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Creator Workflow Guarantee</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Supercharge Your Workflow With{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Elite Digital Tools
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
              Every digital asset on Sakil Hub is tested and verified by our professional editing mentors. Receive instant automated access immediately upon completed checkout.
            </p>
          </div>

          {/* 4 Compact Trust Feature Boxes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
            {[
              {
                icon: Zap,
                title: "Instant Delivery",
                subtitle: "Automated credentials & links",
                color: "text-cyan-400",
              },
              {
                icon: ShieldCheck,
                title: "100% Guaranteed",
                subtitle: "Tested & verified working",
                color: "text-emerald-400",
              },
              {
                icon: Award,
                title: "Commercial License",
                subtitle: "Royalty-free client use",
                color: "text-amber-400",
              },
              {
                icon: Headphones,
                title: "24/7 Direct Support",
                subtitle: "WhatsApp & email assist",
                color: "text-blue-400",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3 sm:p-3.5 rounded-xl bg-[#0e1320]/75 border border-white/10 flex items-center gap-3 backdrop-blur-xl shadow-sm hover:border-cyan-500/25 transition-colors"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-[13px] font-bold text-white tracking-tight truncate">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-zinc-400 truncate">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
