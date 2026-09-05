"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
  ArrowRight,
  Sparkles,
  Key,
  Download,
  UserCheck,
  HelpCircle,
  ShoppingBag,
  Star,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { DigitalProduct, DeliveryMethodType } from "@/lib/data/shop-types";

interface ShopCatalogClientProps {
  initialProducts: DigitalProduct[];
  categories: string[];
}

export default function ShopCatalogClient({
  initialProducts,
  categories,
}: ShopCatalogClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "popular">(
    "featured"
  );

  const allCategories = useMemo(() => {
    return ["All", ...categories];
  }, [categories]);

  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        const matchesCategory =
          selectedCategory === "All" ||
          product.category.toLowerCase() === selectedCategory.toLowerCase();

        const matchesSearch =
          !searchQuery.trim() ||
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "popular") return (b.salesCount || 0) - (a.salesCount || 0);
        return 0; // default order
      });
  }, [initialProducts, selectedCategory, searchQuery, sortBy]);

  const getDeliveryIcon = (type: DeliveryMethodType) => {
    switch (type) {
      case "account_access":
        return <UserCheck className="w-3.5 h-3.5 text-cyan-400" />;
      case "license_key":
        return <Key className="w-3.5 h-3.5 text-amber-400" />;
      case "download_link":
        return <Download className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 select-none">
      {/* Scaled-Down Sleek Search, Filter & Sort Bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="rounded-2xl bg-[#0e1320]/80 border border-white/10 p-3 sm:p-3.5 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.5)] space-y-2.5"
      >
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search software, prompts, templates, LUTs..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all font-normal"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 hidden sm:inline flex items-center gap-1 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 cursor-pointer font-medium"
            >
              <option value="featured">Featured Picks</option>
              <option value="popular">Most Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-white/5">
          {allCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1 ${
                  isSelected
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                    : "bg-white/[0.03] text-zinc-300 hover:bg-white/[0.08] hover:text-white border border-white/10"
                }`}
              >
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Products Counter & Info */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
        <span>
          Showing <strong className="text-white font-mono">{filteredProducts.length}</strong>{" "}
          digital {filteredProducts.length === 1 ? "product" : "products"}
        </span>
        {selectedCategory !== "All" && (
          <button
            onClick={() => setSelectedCategory("All")}
            className="text-cyan-400 hover:text-cyan-300 underline font-medium"
          >
            Reset category filter
          </button>
        )}
      </div>

      {/* Products Grid */}
      {initialProducts.length === 0 ? (
        <div className="py-20 text-center space-y-3 rounded-2xl bg-[#0e1320]/60 border border-white/10 p-6 sm:p-10 backdrop-blur-xl shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            No Products Available Yet
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed font-normal">
            We are actively stocking the digital shop with verified software subscriptions, viral AI prompts, motion templates, and LUTs. Check back soon!
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center space-y-3 rounded-2xl bg-[#0e1320]/60 border border-white/10 p-6 backdrop-blur-xl">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            No Digital Products Match Your Filter
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            We couldn&apos;t find any digital products matching your search criteria. Try adjusting your
            category filter or keyword.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold hover:bg-cyan-500/30 transition-all"
          >
            Show All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
              className="h-full flex flex-col"
            >
              <Link
                href={`/shop/${product.slug}`}
                className="group h-full rounded-2xl bg-[#0e1320]/90 border border-white/10 hover:border-cyan-500/50 p-3.5 sm:p-4 flex flex-col justify-between space-y-3 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)] backdrop-blur-xl cursor-pointer"
              >
              <div className="space-y-2.5">
                {/* Compact Thumbnail Image */}
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-black/60 border border-white/10 shadow-md">
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-cyan-500/30 text-cyan-300 text-[9px] font-bold tracking-wide">
                      {product.category}
                    </span>

                    {product.badge && (
                      <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-cyan-400 to-blue-500 text-black text-[9px] font-black uppercase tracking-wider shadow-md">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Bottom Badges */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md border border-white/10 text-white shadow-xs">
                      {getDeliveryIcon(product.deliveryMethod?.type || "download_link")}
                      <span className="text-[9px] font-semibold text-zinc-200 truncate max-w-[140px]">
                        {product.deliveryMethod?.label || "Instant Delivery"}
                      </span>
                    </div>

                    {product.discountBadge && (
                      <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-[9px] font-mono font-black shadow-xs">
                        {product.discountBadge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Short Description */}
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors line-clamp-1 leading-snug">
                    {product.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-zinc-400 font-normal leading-normal line-clamp-1">
                    {product.shortDescription}
                  </p>
                </div>

                {/* Feature Bullet Points */}
                {product.features && product.features.length > 0 && (
                  <div className="space-y-1 pt-1.5 border-t border-white/5">
                    {product.features.slice(0, 2).map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 text-[10px] text-zinc-300"
                      >
                        <Check className="w-3 h-3 text-cyan-400 shrink-0 stroke-[2.5]" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price & CTA Row */}
              <div className="pt-2.5 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg sm:text-xl font-black text-white font-mono">
                      ৳{product.price}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-[11px] text-zinc-500 line-through font-mono">
                        ৳{product.originalPrice}
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-emerald-400 font-medium flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Instant Automated Access</span>
                  </p>
                </div>

                <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-[11px] shadow-[0_0_12px_rgba(6,182,212,0.2)] group-hover:scale-105 group-hover:shadow-[0_0_18px_rgba(6,182,212,0.35)] transition-all">
                  <span>Get Access</span>
                  <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
        </div>
      )}
    </div>
  );
}
