"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Settings,
  Save,
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertCircle,
  UploadCloud,
  Globe,
  Share2,
  CreditCard,
  Building,
  Play,
  Mail,
  Phone,
  HelpCircle,
  Layout,
  Layers,
} from "lucide-react";
import {
  getPlatformBrandingAction,
  updatePlatformBrandingAction,
} from "@/lib/actions/branding";
import { PlatformBrandingSettings, DEFAULT_BRANDING } from "@/lib/data/branding-types";
import { getAboutCmsAction, updateAboutCmsAction } from "@/lib/actions/about";
import { AboutCmsData, DEFAULT_ABOUT_CMS } from "@/lib/data/about-cms-types";
import { getHomeCmsAction, updateHomeCmsAction } from "@/lib/actions/home";
import { HomeCmsData, DEFAULT_HOME_CMS } from "@/lib/data/home-cms-types";

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState<PlatformBrandingSettings>(DEFAULT_BRANDING);
  const [aboutData, setAboutData] = useState<AboutCmsData>(DEFAULT_ABOUT_CMS);
  const [homeData, setHomeData] = useState<HomeCmsData>(DEFAULT_HOME_CMS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<
    "branding" | "payments" | "contact" | "social" | "about" | "home"
  >("branding");

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      try {
        const [brandData, aboutCms, homeCms] = await Promise.all([
          getPlatformBrandingAction(),
          getAboutCmsAction(),
          getHomeCmsAction(),
        ]);
        if (isMounted) {
          if (brandData) setFormData(brandData);
          if (aboutCms) setAboutData(aboutCms);
          if (homeCms) setHomeData(homeCms);
        }
      } catch (err) {
        console.error("Failed to load platform settings:", err);
      }
    }
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field: keyof PlatformBrandingSettings, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAboutChange = <K extends keyof AboutCmsData>(field: K, value: AboutCmsData[K]) => {
    setAboutData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleHomeChange = <K extends keyof HomeCmsData>(field: K, value: HomeCmsData[K]) => {
    setHomeData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setErrorMsg("");

    try {
      const uploadForm = new FormData();
      uploadForm.append("file", file);

      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: uploadForm,
      });

      if (!res.ok) {
        throw new Error("Failed to upload logo image.");
      }

      const data = await res.json();
      if (data?.url) {
        handleChange("logoUrl", data.url);
      } else {
        throw new Error("Invalid upload response from server.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload image.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const [brandRes, aboutRes, homeRes] = await Promise.all([
        updatePlatformBrandingAction(formData),
        updateAboutCmsAction(aboutData),
        updateHomeCmsAction(homeData),
      ]);

      if (brandRes.success && aboutRes.success && homeRes.success) {
        if (brandRes.settings) setFormData(brandRes.settings);
        if (aboutRes.data) setAboutData(aboutRes.data);
        if (homeRes.data) setHomeData(homeRes.data);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 4000);
      } else {
        setErrorMsg(
          brandRes.error ||
            aboutRes.error ||
            homeRes.error ||
            "Failed to update platform settings."
        );
      }
    } catch {
      setErrorMsg("A network error occurred while saving platform settings.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 select-none max-w-5xl">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>Global CMS & Platform Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Platform Branding & Settings
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-normal">
          Manage your website branding, custom logos, payment accounts, footer biography, and contact details across the entire platform.
        </p>
      </div>

      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Platform branding and settings updated successfully! Changes reflect live across the storefront.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        {[
          { id: "branding", label: "Brand & Logo", icon: Globe },
          { id: "home", label: "Home Page CMS", icon: Layout },
          { id: "about", label: "About Page CMS", icon: Sparkles },
          { id: "payments", label: "Payment Gateways", icon: CreditCard },
          { id: "contact", label: "Contact & Support", icon: Building },
          { id: "social", label: "Footer & Social Links", icon: Share2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-white/[0.02] text-gray-400 hover:text-white hover:bg-white/[0.05] border border-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Tab 1: Brand & Logo */}
        {activeTab === "branding" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Logo & Identity */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Brand Identity & Visuals</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Site Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.siteName}
                    onChange={(e) => handleChange("siteName", e.target.value)}
                    placeholder="e.g. Sakil Hub"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Site Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.siteTagline}
                    onChange={(e) => handleChange("siteTagline", e.target.value)}
                    placeholder="e.g. Professional Video Editing & Filmmaking Masterclasses"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Logo Preview & Upload */}
              <div className="pt-2 border-t border-white/5 space-y-3">
                <label className="block text-xs font-medium text-gray-300">
                  Custom Platform Logo
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Live Preview Container */}
                  <div className="w-40 h-16 rounded-xl bg-neutral-950 border border-white/10 flex items-center justify-center p-2 shrink-0 relative overflow-hidden">
                    {formData.logoUrl ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={formData.logoUrl}
                          alt="Platform Logo Preview"
                          fill
                          sizes="160px"
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/30">
                          <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                        </div>
                        <span className="text-sm font-bold text-white tracking-tight">
                          {formData.siteName || "Sakil Hub"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.logoUrl}
                        onChange={(e) => handleChange("logoUrl", e.target.value)}
                        placeholder="https://... or upload image"
                        className="flex-1 px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={isUploadingLogo}
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                      >
                        {isUploadingLogo ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <UploadCloud className="w-3.5 h-3.5" />
                        )}
                        <span>Upload Logo</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Recommended: Transparent PNG or SVG logo (height: 40px–60px). If left blank, default typography badge is rendered.
                    </p>
                  </div>
                </div>
              </div>

              {/* Favicon URL */}
              <div className="pt-2 border-t border-white/5 space-y-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  Favicon URL
                </label>
                <input
                  type="text"
                  value={formData.faviconUrl}
                  onChange={(e) => handleChange("faviconUrl", e.target.value)}
                  placeholder="https://.../favicon.ico"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Global Announcement */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Global Announcement Banner</span>
              </h2>
              <textarea
                rows={3}
                value={formData.announcement}
                onChange={(e) => handleChange("announcement", e.target.value)}
                placeholder="Broadcast a global banner message across student dashboards and storefront..."
                className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Home Page CMS */}
        {activeTab === "home" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Section 1: Hero Section */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0e1320]/80 border border-white/10 space-y-6">
              <div className="border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    Hero Section Settings
                  </h2>
                </div>
                <p className="text-xs text-gray-400">
                  Configure the primary above-the-fold hero section shown on the root Home Page.
                </p>
              </div>

              {/* Pill Badge */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  Hero Pill Badge Text
                </label>
                <input
                  type="text"
                  value={homeData.heroPill}
                  onChange={(e) => handleHomeChange("heroPill", e.target.value)}
                  placeholder="Best Online Video Learning Platform"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              {/* Headline Fields: 3 segments */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Headline Prefix
                  </label>
                  <input
                    type="text"
                    value={homeData.heroHeadlineLine1}
                    onChange={(e) => handleHomeChange("heroHeadlineLine1", e.target.value)}
                    placeholder="Learn Video Editing"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Highlighted Accent Text (Cyan)
                  </label>
                  <input
                    type="text"
                    value={homeData.heroHeadlineHighlight}
                    onChange={(e) => handleHomeChange("heroHeadlineHighlight", e.target.value)}
                    placeholder="From Zero to Pro"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-cyan-500/40 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Headline Suffix
                  </label>
                  <input
                    type="text"
                    value={homeData.heroHeadlineLine2}
                    onChange={(e) => handleHomeChange("heroHeadlineLine2", e.target.value)}
                    placeholder="Build Your Creative Career"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>
              </div>

              {/* Subtext / Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  Hero Subtitle / Description
                </label>
                <textarea
                  rows={3}
                  value={homeData.heroSubtext}
                  onChange={(e) => handleHomeChange("heroSubtext", e.target.value)}
                  placeholder="Complete video editing masterclasses for beginners to advanced..."
                  className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-gray-200 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
                />
              </div>

              {/* CTA Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                  <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase">
                    Primary CTA Button
                  </span>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-gray-400">Button Label</label>
                    <input
                      type="text"
                      value={homeData.heroCtaText}
                      onChange={(e) => handleHomeChange("heroCtaText", e.target.value)}
                      placeholder="Explore Masterclasses"
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-gray-400">Target Link</label>
                    <input
                      type="text"
                      value={homeData.heroCtaHref}
                      onChange={(e) => handleHomeChange("heroCtaHref", e.target.value)}
                      placeholder="#courses or /courses"
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                  <span className="text-[11px] font-mono text-blue-400 font-bold uppercase">
                    Secondary CTA Button (Optional)
                  </span>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-gray-400">Button Label</label>
                    <input
                      type="text"
                      value={homeData.heroSecondaryCtaText || ""}
                      onChange={(e) => handleHomeChange("heroSecondaryCtaText", e.target.value)}
                      placeholder="Browse Digital Shop"
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-gray-400">Target Link</label>
                    <input
                      type="text"
                      value={homeData.heroSecondaryCtaHref || ""}
                      onChange={(e) => handleHomeChange("heroSecondaryCtaHref", e.target.value)}
                      placeholder="/shop"
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Background Image URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  Hero Studio Background Image URL
                </label>
                <input
                  type="url"
                  value={homeData.heroBackgroundImage || ""}
                  onChange={(e) => handleHomeChange("heroBackgroundImage", e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Section 2: What You'll Learn Pillars */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0e1320]/80 border border-white/10 space-y-6">
              <div className="border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    "What You&apos;ll Learn" Pillar Cards
                  </h2>
                </div>
                <p className="text-xs text-gray-400">
                  Configure the 4 core learning pillars displayed on the Home Page.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  Section Headline
                </label>
                <input
                  type="text"
                  value={homeData.whatYouWillLearnTitle}
                  onChange={(e) => handleHomeChange("whatYouWillLearnTitle", e.target.value)}
                  placeholder="What You'll Learn"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-semibold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {homeData.whatYouWillLearnItems.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2.5">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                      Pillar #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const copy = [...homeData.whatYouWillLearnItems];
                        copy[idx] = { ...copy[idx], title: e.target.value };
                        handleHomeChange("whatYouWillLearnItems", copy);
                      }}
                      placeholder="Title"
                      className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
                    />
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => {
                        const copy = [...homeData.whatYouWillLearnItems];
                        copy[idx] = { ...copy[idx], description: e.target.value };
                        handleHomeChange("whatYouWillLearnItems", copy);
                      }}
                      placeholder="Description"
                      className="w-full p-2 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-gray-300 focus:outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Payment Gateways */}
        {activeTab === "payments" && (
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 animate-in fade-in">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Manual Mobile Banking Numbers</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Live on Checkout
              </span>
            </h2>
            <p className="text-xs text-gray-400">
              These mobile banking account numbers are dynamically displayed to students on the Next.js manual payment checkout page.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  bKash Merchant / Personal Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.bkashNumber}
                  onChange={(e) => handleChange("bkashNumber", e.target.value)}
                  placeholder="e.g. 01712345678"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  Nagad Merchant / Personal Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nagadNumber}
                  onChange={(e) => handleChange("nagadNumber", e.target.value)}
                  placeholder="e.g. 01812345678"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Contact & Support */}
        {activeTab === "contact" && (
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 animate-in fade-in">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-cyan-400" />
              <span>Contact & Support Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>Support Email</span>
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleChange("contactEmail", e.target.value)}
                  placeholder="support@sakilhub.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>Support Phone</span>
                </label>
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={(e) => handleChange("contactPhone", e.target.value)}
                  placeholder="+880 1712-345678"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  Official WhatsApp Number
                </label>
                <input
                  type="text"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                  placeholder="+8801712345678"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  Physical Office Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Dhaka, Bangladesh"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Footer & Social Links */}
        {activeTab === "social" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Footer Copy */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-purple-400" />
                <span>Footer Biography & Copyright</span>
              </h2>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Footer Description / Bio
                  </label>
                  <textarea
                    rows={3}
                    value={formData.footerBio}
                    onChange={(e) => handleChange("footerBio", e.target.value)}
                    placeholder="Short description displayed on the global footer..."
                    className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Footer Copyright Notice
                  </label>
                  <input
                    type="text"
                    value={formData.footerCopyright}
                    onChange={(e) => handleChange("footerCopyright", e.target.value)}
                    placeholder="© 2026 Sakil Hub. All rights reserved."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
              <h2 className="text-sm font-bold text-white">
                Official Social Media Channels
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    YouTube Channel URL
                  </label>
                  <input
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => handleChange("youtubeUrl", e.target.value)}
                    placeholder="https://youtube.com/@sakilhub"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Facebook Page / Group URL
                  </label>
                  <input
                    type="url"
                    value={formData.facebookUrl}
                    onChange={(e) => handleChange("facebookUrl", e.target.value)}
                    placeholder="https://facebook.com/sakilhub"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Instagram Profile URL
                  </label>
                  <input
                    type="url"
                    value={formData.instagramUrl}
                    onChange={(e) => handleChange("instagramUrl", e.target.value)}
                    placeholder="https://instagram.com/sakilhub"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => handleChange("linkedinUrl", e.target.value)}
                    placeholder="https://linkedin.com/company/sakilhub"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: About Page CMS */}
        {activeTab === "about" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Section 1: Hero & Mission */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0e1320]/80 border border-white/10 space-y-6">
              <div className="border-b border-white/5 pb-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>About Page Header</span>
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Hero & Mission Statement
                </h3>
                <p className="text-xs text-gray-400">
                  Configure the primary headline, paragraphs, and hero banner image on /about.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Badge Pill Text
                  </label>
                  <input
                    type="text"
                    value={aboutData.missionBadge}
                    onChange={(e) => handleAboutChange("missionBadge", e.target.value)}
                    placeholder="Our Vision & Mission"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Main Hero Headline
                  </label>
                  <input
                    type="text"
                    value={aboutData.heroHeadline}
                    onChange={(e) => handleAboutChange("heroHeadline", e.target.value)}
                    placeholder="Empowering the Next Generation of Creative Editors"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  Primary Paragraph
                </label>
                <textarea
                  rows={3}
                  value={aboutData.heroParagraph1}
                  onChange={(e) => handleAboutChange("heroParagraph1", e.target.value)}
                  placeholder="Sakil Hub was founded with a single mission..."
                  className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-gray-200 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  Secondary Paragraph
                </label>
                <textarea
                  rows={3}
                  value={aboutData.heroParagraph2}
                  onChange={(e) => handleAboutChange("heroParagraph2", e.target.value)}
                  placeholder="Whether you are an aspiring YouTuber..."
                  className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-gray-200 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Hero CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={aboutData.heroCtaText}
                    onChange={(e) => handleAboutChange("heroCtaText", e.target.value)}
                    placeholder="Explore Masterclasses"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Hero CTA Button Link
                  </label>
                  <input
                    type="text"
                    value={aboutData.heroCtaHref}
                    onChange={(e) => handleAboutChange("heroCtaHref", e.target.value)}
                    placeholder="/courses"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Hero Image URL
                  </label>
                  <input
                    type="url"
                    value={aboutData.heroImageUrl}
                    onChange={(e) => handleAboutChange("heroImageUrl", e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Floating Image Badge Text
                  </label>
                  <input
                    type="text"
                    value={aboutData.heroImageBadge}
                    onChange={(e) => handleAboutChange("heroImageBadge", e.target.value)}
                    placeholder="Industry Standard Curriculum Tested on 500+ Projects"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Milestones */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0e1320]/80 border border-white/10 space-y-6">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Key Milestones & Numbers
                </h3>
                <p className="text-xs text-gray-400">
                  Update the 4 milestone counters shown on the About page.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {aboutData.milestones.map((m, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                      Milestone #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={m.value}
                      onChange={(e) => {
                        const copy = [...aboutData.milestones];
                        copy[idx] = { ...copy[idx], value: e.target.value };
                        handleAboutChange("milestones", copy);
                      }}
                      placeholder="20,000+"
                      className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
                    />
                    <input
                      type="text"
                      value={m.label}
                      onChange={(e) => {
                        const copy = [...aboutData.milestones];
                        copy[idx] = { ...copy[idx], label: e.target.value };
                        handleAboutChange("milestones", copy);
                      }}
                      placeholder="Active Students"
                      className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-gray-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Why Students Choose Sakil Hub (01, 02, 03) */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0e1320]/80 border border-white/10 space-y-6">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Value Pillars (01, 02, 03 Section)
                </h3>
                <p className="text-xs text-gray-400">
                  Customise the "Why Students Choose Sakil Hub" section title and pillar cards.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  Section Title
                </label>
                <input
                  type="text"
                  value={aboutData.whyTitle}
                  onChange={(e) => handleAboutChange("whyTitle", e.target.value)}
                  placeholder="Why Students Choose Sakil Hub"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-semibold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aboutData.values.map((v, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-extrabold text-cyan-400">
                        {v.step || `0${idx + 1}`}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-gray-400">
                        Title
                      </label>
                      <input
                        type="text"
                        value={v.title}
                        onChange={(e) => {
                          const copy = [...aboutData.values];
                          copy[idx] = { ...copy[idx], title: e.target.value };
                          handleAboutChange("values", copy);
                        }}
                        placeholder="100% Practical & Project-Based"
                        className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white font-semibold focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-gray-400">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={v.description}
                        onChange={(e) => {
                          const copy = [...aboutData.values];
                          copy[idx] = { ...copy[idx], description: e.target.value };
                          handleAboutChange("values", copy);
                        }}
                        placeholder="No boring theory. We teach using real commercial footage..."
                        className="w-full p-2.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-gray-300 focus:outline-none focus:border-cyan-500 resize-none font-normal"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Lead Instructor / Founder Quote */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0e1320]/80 border border-white/10 space-y-6">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Founder & Lead Instructor Quote
                </h3>
                <p className="text-xs text-gray-400">
                  Configure the personal quote and portrait shown at the bottom of the About page.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Badge Title
                  </label>
                  <input
                    type="text"
                    value={aboutData.leadInstructorBadge}
                    onChange={(e) => handleAboutChange("leadInstructorBadge", e.target.value)}
                    placeholder="Founder & Master Instructor"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Instructor Name
                  </label>
                  <input
                    type="text"
                    value={aboutData.leadInstructorName}
                    onChange={(e) => handleAboutChange("leadInstructorName", e.target.value)}
                    placeholder="Sakil Ahmed"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  Quote Text
                </label>
                <textarea
                  rows={3}
                  value={aboutData.leadInstructorQuote}
                  onChange={(e) => handleAboutChange("leadInstructorQuote", e.target.value)}
                  placeholder="My goal with Sakil Hub is to ensure no creative editor..."
                  className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-gray-200 focus:outline-none focus:border-cyan-500 resize-none font-normal"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  Avatar Photo URL
                </label>
                <input
                  type="url"
                  value={aboutData.leadInstructorAvatar}
                  onChange={(e) => handleAboutChange("leadInstructorAvatar", e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <p className="text-xs text-gray-500">
            Changes will automatically update throughout the Navbar, Footer, and Checkout page.
          </p>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Platform Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
