"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Download,
  Key,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Info,
  MessageCircle,
} from "lucide-react";
import { StudentProductItem } from "@/lib/actions/student";
import { resolveMediaUrl } from "@/lib/data/courses";

interface DigitalProductDownloadCardProps {
  product: StudentProductItem;
}

export default function DigitalProductDownloadCard({
  product,
}: DigitalProductDownloadCardProps) {
  const [copied, setCopied] = useState(false);

  const delivery = product.deliveryMethod;
  const isLicenseKey = delivery?.type === "license_key";
  const isDownload = delivery?.type === "download_link";
  const isAccountAccess = delivery?.type === "account_access";

  const handleCopyKey = () => {
    const keyToCopy =
      delivery?.licenseKeySample || delivery?.downloadUrl || "ACTIVE-ENTITLEMENT";
    navigator.clipboard.writeText(keyToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 space-y-4 sm:space-y-5 transition-all shadow-xl backdrop-blur-md">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
            {product.thumbnail ? (
              <Image
                src={resolveMediaUrl(product.thumbnail) || product.thumbnail}
                alt={product.title}
                fill
                unoptimized
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-cyan-600/20 text-cyan-400">
                <Zap className="w-6 h-6 shrink-0 fill-current" />
              </div>
            )}
          </div>
          <div>
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
              {product.category}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
              {product.title}
            </h3>
            <p className="text-[11px] text-gray-400 font-mono mt-0.5">
              Order #{product.orderNumber}
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold flex items-center gap-1 shrink-0">
          <ShieldCheck className="w-3 h-3 shrink-0" />
          <span>Unlocked</span>
        </span>
      </div>

      {/* Asset Delivery Details Pill Box */}
      <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-gray-300 space-y-2.5">
        {/* If License Key */}
        {isLicenseKey && (
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 uppercase font-semibold block">
              Software License Key
            </span>
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/[0.04] border border-white/10 font-mono text-cyan-300 text-xs select-all">
              <span className="truncate">
                {delivery?.licenseKeySample || "ACTIVE-PREMIUM-KEY"}
              </span>
              <button
                type="button"
                onClick={handleCopyKey}
                className="text-gray-400 hover:text-white p-1 transition-colors cursor-pointer shrink-0"
                title="Copy Key"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Copy className="w-3.5 h-3.5 shrink-0" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* If Instructions */}
        {delivery?.instructions && (
          <div className="space-y-0.5">
            <span className="text-[10px] text-gray-400 uppercase font-semibold block">
              Activation Instructions
            </span>
            <p className="text-[11px] text-gray-300 leading-relaxed font-normal">
              {delivery.instructions}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
        {delivery?.downloadUrl ? (
          <a
            href={delivery.downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/30 transition-all"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Download Files (ZIP)</span>
          </a>
        ) : (
          <a
            href={`https://wa.me/8801326896947?text=${encodeURIComponent(
              `Hi Sakil Hub, I need support for my purchased digital product: ${product.title} (Order #${product.orderNumber}).`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Request Instant File Link</span>
          </a>
        )}

        <Link
          href={`/shop/${product.slug}`}
          className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          <span>Product Details</span>
        </Link>
      </div>
    </div>
  );
}
