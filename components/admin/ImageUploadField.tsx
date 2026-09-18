"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  Loader2,
  X,
  Image as ImageIcon,
  User,
  Globe,
  AlertCircle,
  Check,
} from "lucide-react";
import { resolveMediaUrl } from "@/lib/data/courses";

export interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  description?: string;
  accept?: string;
  variant?: "banner" | "avatar" | "logo" | "favicon" | "compact";
  badgeText?: string;
  className?: string;
  buttonLabel?: string;
}

export default function ImageUploadField({
  label,
  value = "",
  onChange,
  placeholder,
  description,
  accept = "image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif,image/x-icon,image/vnd.microsoft.icon",
  variant = "banner",
  badgeText,
  className = "",
  buttonLabel,
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [localPreview, setLocalPreview] = useState("");
  const [hasLoadError, setHasLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasLoadError(false);
  }, [value]);

  const previewSrc = localPreview || resolveMediaUrl(value) || value;

  const defaultPlaceholder =
    placeholder ||
    (variant === "favicon"
      ? "https://.../favicon.ico or upload icon..."
      : variant === "logo"
      ? "https://.../logo.png or upload image..."
      : variant === "avatar"
      ? "https://.../avatar.jpg or upload photo..."
      : "https://images.unsplash.com/... or upload image...");

  const defaultBtnLabel =
    buttonLabel ||
    (variant === "favicon"
      ? "Upload Favicon"
      : variant === "logo"
      ? "Upload Logo"
      : variant === "avatar"
      ? "Upload Avatar"
      : "Upload Image");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 10MB limit.");
      return;
    }

    setErrorMsg("");
    setIsUploading(true);
    setHasLoadError(false);

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setLocalPreview(dataUrl);
      }
    };
    reader.readAsDataURL(file);

    try {
      const uploadForm = new FormData();
      uploadForm.append("file", file);

      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: uploadForm,
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status code ${res.status}`);
      }

      const data = await res.json();
      if (data?.url) {
        onChange(data.url);
        setLocalPreview("");
      } else {
        throw new Error(data?.error || "Server did not return a valid image URL.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload image. Please check your connection.");
      setLocalPreview("");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClear = () => {
    onChange("");
    setLocalPreview("");
    setHasLoadError(false);
    setErrorMsg("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-2 select-none ${className}`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Label and Badge */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-300 tracking-tight">
          {label}
        </label>
        {badgeText && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {badgeText}
          </span>
        )}
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg("")}
            className="p-1 text-red-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Layout Variant 1: Favicon / Small Icon */}
      {variant === "favicon" && (
        <div className="flex items-center gap-3">
          {/* Favicon Square Preview */}
          <div
            onClick={() => fileInputRef.current?.click()}
            title="Click to change favicon"
            className="w-11 h-11 rounded-xl bg-black/60 border border-white/10 hover:border-cyan-500/50 flex items-center justify-center p-1.5 shrink-0 relative overflow-hidden group cursor-pointer transition-colors"
          >
            {previewSrc && !hasLoadError ? (
              <img
                src={previewSrc}
                alt="Favicon Preview"
                className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                onError={() => setHasLoadError(true)}
              />
            ) : (
              <Globe className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              </div>
            )}
          </div>

          {/* URL Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={defaultPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 pr-8"
            />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                title="Clear Favicon URL"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Upload Button */}
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>{isUploading ? "Uploading..." : defaultBtnLabel}</span>
          </button>
        </div>
      )}

      {/* Layout Variant 2: Avatar Photo */}
      {variant === "avatar" && (
        <div className="flex items-center gap-3">
          {/* Portrait/Avatar Preview */}
          <div
            onClick={() => fileInputRef.current?.click()}
            title="Click to upload portrait"
            className="w-14 h-16 rounded-xl bg-black/60 border border-white/10 hover:border-cyan-500/50 flex items-center justify-center shrink-0 relative overflow-hidden group cursor-pointer transition-colors p-1"
          >
            {previewSrc && !hasLoadError ? (
              <img
                src={previewSrc}
                alt="Avatar Preview"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                onError={() => setHasLoadError(true)}
              />
            ) : (
              <User className="w-6 h-6 text-gray-500 group-hover:text-cyan-400 transition-colors" />
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              </div>
            )}
          </div>

          {/* URL Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={defaultPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 pr-8"
            />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                title="Clear Avatar URL"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Upload Button */}
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>{isUploading ? "Uploading..." : defaultBtnLabel}</span>
          </button>
        </div>
      )}

      {/* Layout Variant 3: Logo Container */}
      {variant === "logo" && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Logo Live Preview Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            title="Click to upload new logo"
            className="w-44 h-16 rounded-xl bg-black/60 border border-white/10 hover:border-blue-500/50 flex items-center justify-center p-2 shrink-0 relative overflow-hidden group cursor-pointer transition-colors"
          >
            {previewSrc && !hasLoadError ? (
              <img
                src={previewSrc}
                alt="Platform Logo Preview"
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                onError={() => setHasLoadError(true)}
              />
            ) : (
              <span className="text-xs font-bold tracking-tight text-white/40">
                NO LOGO SET
              </span>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-2 text-xs text-blue-400 font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={defaultPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-blue-500 pr-8"
                />
                {value && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                    title="Clear Logo URL"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
                )}
                <span>{isUploading ? "Uploading..." : defaultBtnLabel}</span>
              </button>
            </div>
            {description && (
              <p className="text-[11px] text-gray-500">{description}</p>
            )}
          </div>
        </div>
      )}

      {/* Layout Variant 4: Banner / Wide Image (Home Hero, About Hero) */}
      {(variant === "banner" || variant === "compact") && (
        <div className="space-y-2.5">
          {/* Input Row: URL + Upload Button */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={defaultPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 pr-8"
              />
              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                  title="Clear Image URL"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : (
                <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>{isUploading ? "Uploading..." : defaultBtnLabel}</span>
            </button>
          </div>

          {/* Visual Banner Preview if image exists */}
          {previewSrc && !hasLoadError && (
            <div className="relative w-full max-w-lg h-36 sm:h-44 rounded-xl overflow-hidden border border-white/10 bg-black/60 group shadow-md">
              <img
                src={previewSrc}
                alt="Banner Preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={() => setHasLoadError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-cyan-300 flex items-center gap-1 pointer-events-none">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Live Preview Active</span>
              </div>

              <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-black text-white text-[11px] font-medium border border-white/20 transition-colors cursor-pointer"
                >
                  Change File
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[11px] font-medium border border-red-500/30 transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {description && (
            <p className="text-[11px] text-gray-500">{description}</p>
          )}
        </div>
      )}

      {/* Description helper text for non-banner variants if provided */}
      {variant !== "banner" && variant !== "logo" && description && (
        <p className="text-[11px] text-gray-500">{description}</p>
      )}
    </div>
  );
}
