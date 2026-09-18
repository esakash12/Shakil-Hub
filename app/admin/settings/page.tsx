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
import { getAgencyCmsAction, updateAgencyCmsAction } from "@/lib/actions/agency-cms";
import { AgencyCmsData, DEFAULT_AGENCY_CMS } from "@/lib/data/agency-cms-types";
import ImageUploadField from "@/components/admin/ImageUploadField";

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState<PlatformBrandingSettings>(DEFAULT_BRANDING);
  const [agencyData, setAgencyData] = useState<AgencyCmsData>(DEFAULT_AGENCY_CMS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<
    "branding" | "landing" | "payments" | "contact" | "social"
  >("branding");

  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      try {
        const [brandData, agencyCms] = await Promise.all([
          getPlatformBrandingAction(),
          getAgencyCmsAction(),
        ]);
        if (isMounted) {
          if (brandData) setFormData(brandData);
          if (agencyCms) setAgencyData(agencyCms);
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

  const handleAgencyChange = <K extends keyof AgencyCmsData>(field: K, value: AgencyCmsData[K]) => {
    setAgencyData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const [brandRes, agencyRes] = await Promise.all([
        updatePlatformBrandingAction(formData),
        updateAgencyCmsAction(agencyData),
      ]);

      if (brandRes.success && agencyRes.success) {
        if (brandRes.settings) setFormData(brandRes.settings);
        if (agencyRes.data) setAgencyData(agencyRes.data);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 4000);
      } else {
        setErrorMsg(
          brandRes.error ||
            agencyRes.error ||
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
          { id: "landing", label: "Landing Page CMS", icon: Layout },
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
              <div className="pt-2 border-t border-white/5">
                <ImageUploadField
                  label="Custom Platform Logo"
                  value={formData.logoUrl}
                  onChange={(url) => handleChange("logoUrl", url)}
                  variant="logo"
                  placeholder="https://... or upload transparent logo..."
                  description="Recommended: Transparent PNG or SVG logo (height: 40px–60px). If left blank, default typography badge is rendered."
                  buttonLabel="Upload Logo"
                  badgeText="Header & Footer"
                />
              </div>

              {/* Favicon Upload & URL */}
              <div className="pt-2 border-t border-white/5">
                <ImageUploadField
                  label="Platform Favicon"
                  value={formData.faviconUrl}
                  onChange={(url) => handleChange("faviconUrl", url)}
                  variant="favicon"
                  accept="image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml,image/webp,image/*"
                  placeholder="https://.../favicon.ico or upload .ico/.png"
                  description="Displays in the browser tab bar, bookmarks, and mobile shortcuts (.ico, .png, .svg)."
                  buttonLabel="Upload Favicon"
                  badgeText="Browser Tab Icon"
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

        {/* Tab 2: Landing Page CMS */}
        {activeTab === "landing" && (
          <div className="space-y-6 animate-in fade-in">
            {/* Section 1: Hero Section */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0e1320]/80 border border-white/10 space-y-6">
              <div className="border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-[#00d2ff]" />
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    Hero Section Copy & Calls-to-Action
                  </h2>
                </div>
                <p className="text-xs text-gray-400">
                  Configure the primary above-the-fold headline, tagline, and call-to-action buttons shown on the agency landing page.
                </p>
              </div>

              {/* Pill Badge */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  Hero Top Pill Badge
                </label>
                <input
                  type="text"
                  value={agencyData.heroPillBadge}
                  onChange={(e) => handleAgencyChange("heroPillBadge", e.target.value)}
                  placeholder="Creative Video • AI • Marketing"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              {/* Main Headline (Prefix, Highlight, Suffix) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Headline Prefix
                  </label>
                  <input
                    type="text"
                    value={agencyData.heroHeadlinePrefix}
                    onChange={(e) => handleAgencyChange("heroHeadlinePrefix", e.target.value)}
                    placeholder="We Build Powerful"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Highlighted Accent Text (Cyan)
                  </label>
                  <input
                    type="text"
                    value={agencyData.heroHeadlineHighlight}
                    onChange={(e) => handleAgencyChange("heroHeadlineHighlight", e.target.value)}
                    placeholder="Digital Experiences"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-cyan-500/40 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Headline Suffix
                  </label>
                  <input
                    type="text"
                    value={agencyData.heroHeadlineSuffix}
                    onChange={(e) => handleAgencyChange("heroHeadlineSuffix", e.target.value)}
                    placeholder=", Videos & Brands"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>
              </div>

              {/* Subtext */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  Hero Subtitle / Value Proposition
                </label>
                <textarea
                  rows={3}
                  value={agencyData.heroSubtext}
                  onChange={(e) => handleAgencyChange("heroSubtext", e.target.value)}
                  placeholder="Turn your ideas into powerful visual stories..."
                  className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-gray-200 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Primary CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={agencyData.heroCtaText}
                    onChange={(e) => handleAgencyChange("heroCtaText", e.target.value)}
                    placeholder="Explore Our Portfolio"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Showreel Button Text
                  </label>
                  <input
                    type="text"
                    value={agencyData.heroShowreelText}
                    onChange={(e) => handleAgencyChange("heroShowreelText", e.target.value)}
                    placeholder="Watch Showreel"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Director & Founder Spotlight */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0e1320]/80 border border-white/10 space-y-6">
              <div className="border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    Director & Founder Spotlight Section
                  </h2>
                </div>
                <p className="text-xs text-gray-400">
                  Update the founder profile, headline, biography, photo, and key metrics.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-300">
                    Founder Main Headline
                  </label>
                  <input
                    type="text"
                    value={agencyData.founderHeadline}
                    onChange={(e) => handleAgencyChange("founderHeadline", e.target.value)}
                    placeholder="Directed by Mehedi Hasan Sakil"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Subheading / Role
                  </label>
                  <input
                    type="text"
                    value={agencyData.founderSubheading}
                    onChange={(e) => handleAgencyChange("founderSubheading", e.target.value)}
                    placeholder="Director & Founder"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Neon Signature Watermark Text
                  </label>
                  <input
                    type="text"
                    value={agencyData.founderSignatureText}
                    onChange={(e) => handleAgencyChange("founderSignatureText", e.target.value)}
                    placeholder="Sakil"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-[#00d2ff] font-serif italic focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Founder Portrait Photo
                  </label>
                  <ImageUploadField
                    label="Founder Portrait"
                    value={agencyData.founderPhotoUrl}
                    onChange={(url) => handleAgencyChange("founderPhotoUrl", url)}
                    variant="avatar"
                    placeholder="https://... or upload photo"
                    description="Portrait photo displayed on the founder spotlight card."
                    buttonLabel="Upload Photo"
                    badgeText="Founder Portrait"
                  />
                </div>
              </div>

              {/* Bio Narrative */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  Founder Narrative / Bio Story
                </label>
                <textarea
                  rows={4}
                  value={agencyData.founderBio1}
                  onChange={(e) => handleAgencyChange("founderBio1", e.target.value)}
                  placeholder="I'm a video content creator and creative director..."
                  className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-gray-200 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
                />
              </div>

              {/* 4 Metrics / Stats */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <label className="block text-xs font-medium text-gray-300">
                  4 Key Metrics Bar (Value & Label)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Metric 1 */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                      Metric #1
                    </span>
                    <input
                      type="text"
                      value={agencyData.founderStat1Value}
                      onChange={(e) => handleAgencyChange("founderStat1Value", e.target.value)}
                      placeholder="5+"
                      className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
                    />
                    <input
                      type="text"
                      value={agencyData.founderStat1Label}
                      onChange={(e) => handleAgencyChange("founderStat1Label", e.target.value)}
                      placeholder="Years Experience"
                      className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-gray-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Metric 2 */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                      Metric #2
                    </span>
                    <input
                      type="text"
                      value={agencyData.founderStat2Value}
                      onChange={(e) => handleAgencyChange("founderStat2Value", e.target.value)}
                      placeholder="100+"
                      className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
                    />
                    <input
                      type="text"
                      value={agencyData.founderStat2Label}
                      onChange={(e) => handleAgencyChange("founderStat2Label", e.target.value)}
                      placeholder="Projects Completed"
                      className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-gray-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Metric 3 */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                      Metric #3
                    </span>
                    <input
                      type="text"
                      value={agencyData.founderStat3Value}
                      onChange={(e) => handleAgencyChange("founderStat3Value", e.target.value)}
                      placeholder="50+"
                      className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
                    />
                    <input
                      type="text"
                      value={agencyData.founderStat3Label}
                      onChange={(e) => handleAgencyChange("founderStat3Label", e.target.value)}
                      placeholder="Happy Clients"
                      className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-gray-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Metric 4 */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                      Metric #4
                    </span>
                    <input
                      type="text"
                      value={agencyData.founderStat4Value}
                      onChange={(e) => handleAgencyChange("founderStat4Value", e.target.value)}
                      placeholder="98%"
                      className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
                    />
                    <input
                      type="text"
                      value={agencyData.founderStat4Label}
                      onChange={(e) => handleAgencyChange("founderStat4Label", e.target.value)}
                      placeholder="Client Satisfaction"
                      className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-gray-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Strategy Meeting & Consultation */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0e1320]/80 border border-white/10 space-y-6">
              <div className="border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    Strategy Meeting & Consultation Booking
                  </h2>
                </div>
                <p className="text-xs text-gray-400">
                  Configure the strategy meeting booking headlines, guarantees, and direct WhatsApp contact number.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Booking Card Title
                  </label>
                  <input
                    type="text"
                    value={agencyData.consultationTitle}
                    onChange={(e) => handleAgencyChange("consultationTitle", e.target.value)}
                    placeholder="Book a Free Strategy Meeting"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-300">
                    Direct WhatsApp Number for Meetings *
                  </label>
                  <input
                    type="text"
                    value={agencyData.consultationWhatsapp}
                    onChange={(e) => handleAgencyChange("consultationWhatsapp", e.target.value)}
                    placeholder="01326896947"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  Subtitle / Meeting Description
                </label>
                <textarea
                  rows={2}
                  value={agencyData.consultationSubtitle}
                  onChange={(e) => handleAgencyChange("consultationSubtitle", e.target.value)}
                  placeholder="Discuss your project, get expert advice, and find the best solution..."
                  className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs text-gray-200 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              {/* 3 Guarantees */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-300">
                  Booking Guarantee Badges (3 items)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={agencyData.consultationCheck1}
                    onChange={(e) => handleAgencyChange("consultationCheck1", e.target.value)}
                    placeholder="Free Consultation"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="text"
                    value={agencyData.consultationCheck2}
                    onChange={(e) => handleAgencyChange("consultationCheck2", e.target.value)}
                    placeholder="Project Planning"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="text"
                    value={agencyData.consultationCheck3}
                    onChange={(e) => handleAgencyChange("consultationCheck3", e.target.value)}
                    placeholder="Custom Quote"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
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
