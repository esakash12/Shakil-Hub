"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Key,
  Download,
  UserCheck,
  Sparkles,
  DollarSign,
  Layers,
  Tag,
  X,
  HelpCircle,
  Loader2,
  Check,
  FileCode,
} from "lucide-react";
import {
  getAdminShopProductsAction,
  saveAdminShopProductAction,
  deleteAdminShopProductAction,
} from "@/lib/actions/shop";
import {
  DigitalProduct,
  ShopProductPayload,
  DeliveryMethodType,
} from "@/lib/data/shop-types";
import ImageUploader from "@/components/admin/ImageUploader";

const CATEGORY_PRESETS = [
  "Software",
  "Prompt Bundle",
  "Template",
  "Preset",
  "Plugin",
  "Sound FX",
  "Stock Footage",
];

const BADGE_PRESETS = ["Bestseller", "Hot & New", "Top Rated", "Trending", "Special Deal"];

const DELIVERY_TYPES: {
  type: DeliveryMethodType;
  label: string;
  icon: any;
  defaultInstructions: string;
}[] = [
  {
    type: "account_access",
    label: "Private Account Credentials",
    icon: UserCheck,
    defaultInstructions:
      "Your private account username and password will be displayed immediately after checkout and sent to your email address.",
  },
  {
    type: "download_link",
    label: "Direct File Download Link",
    icon: Download,
    defaultInstructions:
      "A high-speed direct download link from our CDN will be provided immediately upon completed payment.",
  },
  {
    type: "license_key",
    label: "Software License Key / Code",
    icon: Key,
    defaultInstructions:
      "Your official activation license key will be provisioned immediately and accessible in your order receipt.",
  },
  {
    type: "custom_instructions",
    label: "Custom Access Instructions",
    icon: HelpCircle,
    defaultInstructions:
      "Detailed step-by-step instructions on accessing this digital resource will be displayed on your order confirmation screen.",
  },
];

export default function AdminShopPage() {
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DigitalProduct | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Software");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [price, setPrice] = useState("899");
  const [originalPrice, setOriginalPrice] = useState("2400");
  const [discountBadge, setDiscountBadge] = useState("");
  const [thumbnail, setThumbnail] = useState(
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"
  );
  const [badge, setBadge] = useState("Bestseller");
  const [status, setStatus] = useState<"active" | "draft">("active");
  const [features, setFeatures] = useState<string[]>([
    "Instant Automated Delivery",
    "Commercial License Included",
  ]);
  const [newFeatureText, setNewFeatureText] = useState("");

  // Delivery Method Form State
  const [deliveryType, setDeliveryType] = useState<DeliveryMethodType>("account_access");
  const [deliveryLabel, setDeliveryLabel] = useState("Instant Account Access");
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    "Login credentials will be sent immediately upon payment."
  );
  const [downloadUrl, setDownloadUrl] = useState("");
  const [licenseKeySample, setLicenseKeySample] = useState("");

  // Delete Modal State
  const [deletingProduct, setDeletingProduct] = useState<DigitalProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setIsLoading(true);
    try {
      const res = await getAdminShopProductsAction();
      if (res.success && res.products) {
        setProducts(res.products);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setIsLoading(false);
    }
  }

  // Auto-calculate discount badge when originalPrice or price change
  useEffect(() => {
    const numPrice = Number(price);
    const numOrig = Number(originalPrice);
    if (numOrig > numPrice && numPrice > 0) {
      const pct = Math.round(((numOrig - numPrice) / numOrig) * 100);
      setDiscountBadge(`${pct}% OFF`);
    } else {
      setDiscountBadge("");
    }
  }, [price, originalPrice]);

  function openCreateModal() {
    setEditingProduct(null);
    setTitle("");
    setSlug("");
    setCategory("Software");
    setShortDescription("");
    setFullDescription("");
    setPrice("899");
    setOriginalPrice("2400");
    setDiscountBadge("");
    setThumbnail(
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"
    );
    setBadge("Bestseller");
    setStatus("active");
    setFeatures([
      "100% Guaranteed & Verified Working",
      "Instant Automated Delivery",
      "Commercial & Personal Use License",
    ]);
    setDeliveryType("account_access");
    setDeliveryLabel("Instant Account Access");
    setDeliveryInstructions(
      "Your private account login details will be displayed immediately upon completed payment."
    );
    setDownloadUrl("");
    setLicenseKeySample("");
    setErrorMessage("");
    setSaveSuccess(false);
    setIsModalOpen(true);
  }

  function openEditModal(prod: DigitalProduct) {
    setEditingProduct(prod);
    setTitle(prod.title);
    setSlug(prod.slug);
    setCategory(prod.category || "Software");
    setShortDescription(prod.shortDescription || "");
    setFullDescription(prod.fullDescription || "");
    setPrice(String(prod.price || 0));
    setOriginalPrice(prod.originalPrice ? String(prod.originalPrice) : "");
    setDiscountBadge(prod.discountBadge || "");
    setThumbnail(prod.thumbnail || "");
    setBadge(prod.badge || "");
    setStatus(prod.status || "active");
    setFeatures(prod.features || []);
    setDeliveryType(prod.deliveryMethod?.type || "download_link");
    setDeliveryLabel(prod.deliveryMethod?.label || "Instant Delivery");
    setDeliveryInstructions(prod.deliveryMethod?.instructions || "");
    setDownloadUrl(prod.deliveryMethod?.downloadUrl || "");
    setLicenseKeySample(prod.deliveryMethod?.licenseKeySample || "");
    setErrorMessage("");
    setSaveSuccess(false);
    setIsModalOpen(true);
  }

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures([...features, newFeatureText.trim()]);
    setNewFeatureText("");
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleDeliveryTypeChange = (type: DeliveryMethodType) => {
    setDeliveryType(type);
    const preset = DELIVERY_TYPES.find((d) => d.type === type);
    if (preset) {
      setDeliveryLabel(preset.label);
      if (!deliveryInstructions || deliveryInstructions.length < 10) {
        setDeliveryInstructions(preset.defaultInstructions);
      }
    }
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("Product title is required.");
      return;
    }
    if (!price || Number(price) <= 0) {
      setErrorMessage("Please enter a valid selling price.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    const payload: ShopProductPayload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      category: category.trim() || "Software",
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      discountBadge: discountBadge.trim() || undefined,
      thumbnail: thumbnail.trim(),
      images: [thumbnail.trim()],
      badge: badge.trim() || undefined,
      features: features.filter(Boolean),
      deliveryMethod: {
        type: deliveryType,
        label: deliveryLabel.trim() || "Instant Access",
        instructions: deliveryInstructions.trim(),
        downloadUrl: downloadUrl.trim() || undefined,
        licenseKeySample: licenseKeySample.trim() || undefined,
      },
      status,
    };

    try {
      const res = await saveAdminShopProductAction(payload, editingProduct?.id);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => {
          setIsModalOpen(false);
          loadProducts();
        }, 600);
      } else {
        setErrorMessage(res.error || "Failed to save digital product.");
      }
    } catch {
      setErrorMessage("An unexpected network error occurred.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      const res = await deleteAdminShopProductAction(deletingProduct.id);
      if (res.success) {
        setDeletingProduct(null);
        loadProducts();
      } else {
        alert(res.error || "Failed to delete product.");
      }
    } catch {
      alert("Failed to delete product.");
    } finally {
      setIsDeleting(false);
    }
  }

  // Filter products
  const categoriesList = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "All" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDeliveryIcon = (type: DeliveryMethodType) => {
    switch (type) {
      case "account_access":
        return <UserCheck className="w-3.5 h-3.5 text-cyan-400" />;
      case "license_key":
        return <Key className="w-3.5 h-3.5 text-amber-400" />;
      case "download_link":
        return <Download className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Digital Marketplace CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Digital Shop & Software Products
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-normal">
            Manage software subscriptions (CapCut Pro), prompt bundles, MOGRT templates, and creator assets.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 text-black stroke-[3]" />
          <span>Add Digital Product</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-3 rounded-2xl bg-[#0e1320]/75 border border-white/10 backdrop-blur-xl">
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title, category..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all font-normal"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  : "bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white border border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-zinc-400">Loading digital products catalog...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center space-y-4 rounded-2xl bg-[#0e1320]/50 border border-white/10 p-8">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Digital Products Found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {searchQuery
              ? "No products matched your search filter. Try clearing your query."
              : "No digital products exist in this category yet. Click 'Add Digital Product' to create one."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group rounded-2xl bg-[#0e1320]/90 border border-white/10 hover:border-cyan-500/40 p-5 flex flex-col justify-between space-y-5 transition-all duration-300 hover:-translate-y-1 shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_15px_45px_rgba(0,0,0,0.85),0_0_25px_rgba(6,182,212,0.15)] backdrop-blur-xl"
            >
              <div className="space-y-4">
                {/* Thumbnail & Badges */}
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-black/60 border border-white/10">
                  <Image
                    src={product.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">
                      {product.category}
                    </span>

                    {product.badge && (
                      <span className="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[10px] font-black uppercase tracking-wider shadow-md">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Bottom Badges */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[11px] text-white">
                      {getDeliveryIcon(product.deliveryMethod?.type || "download_link")}
                      <span className="text-[10px] font-medium text-zinc-300 truncate max-w-[150px]">
                        {product.deliveryMethod?.label || "Instant Access"}
                      </span>
                    </div>

                    {product.discountBadge && (
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-mono font-bold">
                        {product.discountBadge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {product.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        product.status === "active"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-gray-500/15 text-gray-400 border border-gray-500/30"
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-normal leading-relaxed line-clamp-2">
                    {product.shortDescription}
                  </p>
                </div>

                {/* Features Preview */}
                {product.features && product.features.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-white/5">
                    {product.features.slice(0, 3).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                        <Check className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price & Action Row */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-white font-mono">
                      ৳{product.price}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-zinc-500 line-through font-mono">
                        ৳{product.originalPrice}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    {product.salesCount || 0} purchases
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/shop/${product.slug}`}
                    target="_blank"
                    className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-500/40 text-zinc-300 hover:text-cyan-300 flex items-center justify-center transition-colors"
                    title="View Product in Storefront"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => openEditModal(product)}
                    className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-500/40 text-zinc-300 hover:text-cyan-300 flex items-center justify-center transition-colors"
                    title="Edit Product"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingProduct(product)}
                    className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/50 text-rose-400 hover:text-rose-300 flex items-center justify-center transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Digital Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 rounded-2xl bg-[#0e1320] border border-white/15 p-6 sm:p-8 space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.95)] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{editingProduct ? "Edit Digital Product" : "New Digital Asset"}</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {editingProduct ? editingProduct.title : "Add Digital Product to Shop"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {saveSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Product saved successfully! Updating shop...</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-5 text-left">
              {/* Product Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. CapCut Pro 1-Year Private Account Subscription"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-all font-medium"
                />
              </div>

              {/* Slug & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-300">
                    URL Slug (Optional - auto-generated if blank)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="capcut-pro-1year-subscription"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-300">
                    Category *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      {CATEGORY_PRESETS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Or type custom..."
                      className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Short Description (Card preview)
                </label>
                <textarea
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Summary shown on product cards and search results..."
                  className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Full Description & Details
                </label>
                <textarea
                  rows={4}
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  placeholder="Comprehensive breakdown of features, software requirements, and license terms..."
                  className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 resize-none font-normal"
                />
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-black/40 border border-white/5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-300 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Selling Price (৳ BDT) *</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="899"
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-300">
                    Original Price (৳ BDT)
                  </label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="2400"
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-300">
                    Discount Badge Tag
                  </label>
                  <input
                    type="text"
                    value={discountBadge}
                    onChange={(e) => setDiscountBadge(e.target.value)}
                    placeholder="e.g. 63% OFF"
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Badges & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-300 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Promo Badge</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="">None</option>
                      {BADGE_PRESETS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      placeholder="Or custom badge"
                      className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-300">
                    Publish Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus("active")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        status === "active"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-black/60 text-zinc-400 border-white/10"
                      }`}
                    >
                      Active (Visible)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("draft")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        status === "draft"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-black/60 text-zinc-400 border-white/10"
                      }`}
                    >
                      Draft (Hidden)
                    </button>
                  </div>
                </div>
              </div>

              {/* Thumbnail Image Uploader */}
              <div className="pt-2">
                <ImageUploader
                  value={thumbnail}
                  onChange={setThumbnail}
                  label="Product Cover Image (Upload via R2 or enter URL)"
                />
              </div>

              {/* Features Array Builder */}
              <div className="space-y-2 p-4 rounded-xl bg-black/40 border border-white/5">
                <label className="block text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Key Features & Specifications Checklist</span>
                </label>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#0e1320] border border-white/10 text-xs text-zinc-200"
                    >
                      <span className="truncate">{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-gray-500 hover:text-rose-400 p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="e.g. Full 4K 60fps export without watermark..."
                    className="flex-1 px-3 py-2 rounded-xl bg-black border border-white/10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-cyan-500/20 hover:text-cyan-300 text-xs font-semibold text-white transition-colors"
                  >
                    Add Feature
                  </button>
                </div>
              </div>

              {/* Flexible Delivery Method */}
              <div className="space-y-3 p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Key className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Delivery Method & Automation</h4>
                    <p className="text-[11px] text-zinc-400">
                      Configure how the digital asset is delivered to the buyer upon payment.
                    </p>
                  </div>
                </div>

                {/* Delivery Type Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DELIVERY_TYPES.map((dt) => {
                    const Icon = dt.icon;
                    const isSelected = deliveryType === dt.type;
                    return (
                      <button
                        key={dt.type}
                        type="button"
                        onClick={() => handleDeliveryTypeChange(dt.type)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                          isSelected
                            ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                            : "bg-black/50 border-white/10 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px] font-bold leading-tight">{dt.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Delivery Label & Content */}
                <div className="space-y-2 pt-1">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-300">
                      Delivery Label (Badge text on storefront)
                    </label>
                    <input
                      type="text"
                      value={deliveryLabel}
                      onChange={(e) => setDeliveryLabel(e.target.value)}
                      placeholder="e.g. Instant Account Access"
                      className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {deliveryType === "download_link" && (
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-gray-300 flex items-center gap-1">
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Direct Download File URL / CDN Link</span>
                      </label>
                      <input
                        type="text"
                        value={downloadUrl}
                        onChange={(e) => setDownloadUrl(e.target.value)}
                        placeholder="https://assets.sakilhub.com/downloads/package.zip"
                        className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  )}

                  {deliveryType === "license_key" && (
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-gray-300 flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                        <span>License Key Code / Format Note</span>
                      </label>
                      <input
                        type="text"
                        value={licenseKeySample}
                        onChange={(e) => setLicenseKeySample(e.target.value)}
                        placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                        className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-300">
                      Fulfillment Instructions (Shown to customer after payment)
                    </label>
                    <textarea
                      rows={2}
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      placeholder="Detailed instructions for logging in, activating the key, or extracting files..."
                      className="w-full p-2.5 rounded-xl bg-black border border-white/10 text-xs text-white resize-none focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-300 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Saving Product...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-black stroke-[3]" />
                      <span>{editingProduct ? "Update Product" : "Publish Product"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0e1320] border border-rose-500/30 p-6 space-y-5 shadow-[0_20px_60px_rgba(0,0,0,0.95)]">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Delete Digital Product?</h3>
              <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                Are you sure you want to delete{" "}
                <span className="text-white font-bold">&quot;{deletingProduct.title}&quot;</span>? This product will be immediately removed from the storefront shop catalog.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingProduct(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-300 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete Product</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
