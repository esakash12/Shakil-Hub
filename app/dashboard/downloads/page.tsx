import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Download,
  Key,
  ShoppingBag,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  FileCode,
  Zap,
} from "lucide-react";
import {
  getStudentDigitalProductsAction,
  StudentProductItem,
} from "@/lib/actions/student";
import { resolveMediaUrl } from "@/lib/data/courses";
import DigitalProductDownloadCard from "@/components/dashboard/DigitalProductDownloadCard";

export const dynamic = "force-dynamic";

export default async function StudentDownloadsPage() {
  const products: StudentProductItem[] = await getStudentDigitalProductsAction();

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <Sparkles className="w-3 h-3 shrink-0" />
          <span>Digital Library</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          My Digital Assets & Downloads
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-normal">
          Instant access to your verified software licenses, motion templates, LUT packs, and creative assets.
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((item) => (
            <DigitalProductDownloadCard key={item.id} product={item} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-10 sm:p-16 text-center space-y-4 backdrop-blur-xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-inner">
            <ShoppingBag className="w-8 h-8 shrink-0" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-white">
              No Digital Products Yet
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed font-normal">
              You haven&apos;t purchased any digital creative tools or software keys yet. Explore our digital shop for curated assets.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-600/30 transition-all"
          >
            <Zap className="w-4 h-4 shrink-0 fill-black" />
            <span>Browse Digital Shop</span>
          </Link>
        </div>
      )}
    </div>
  );
}
