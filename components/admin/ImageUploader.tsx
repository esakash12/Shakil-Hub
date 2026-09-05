"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Link as LinkIcon,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import { getPresignedUploadUrl } from "@/lib/actions/cloudflare-r2";
import { resolveMediaUrl } from "@/lib/data/courses";

interface ImageUploaderProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  label?: string;
  className?: string;
}

export default function ImageUploader({
  value = "",
  onChange,
  onUploadingChange,
  label = "Course Thumbnail Image",
  className = "",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState(value);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [localPreview, setLocalPreview] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasLoadError(false);
  }, [value]);

  const previewUrl = localPreview || resolveMediaUrl(value) || value;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 10MB limit.");
      return;
    }

    setErrorMsg("");
    setIsUploading(true);
    onUploadingChange?.(true);
    setProgress(0);
    setHasLoadError(false);

    // 1. Immediate Instant Preview in browser
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (base64Data) {
        setLocalPreview(base64Data);
      }
    };
    reader.readAsDataURL(file);

    try {
      // 2. Upload to server upload endpoint
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
        }
      };

      xhr.onload = () => {
        setIsUploading(false);
        onUploadingChange?.(false);
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.success && res.url) {
            onChange(res.url);
          } else {
            setErrorMsg(res.error || "Image upload failed.");
          }
        } catch {
          setErrorMsg("Failed to process upload response.");
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        onUploadingChange?.(false);
        setErrorMsg("Network error during image upload.");
      };

      xhr.open("POST", "/api/upload/image", true);
      xhr.send(formData);
    } catch (err: any) {
      setIsUploading(false);
      onUploadingChange?.(false);
      setErrorMsg(err.message || "Failed to upload image.");
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setIsUrlMode(false);
    }
  };

  const handleClear = () => {
    onChange("");
    setUrlInput("");
    setHasLoadError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`w-full space-y-2.5 select-none ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
          <span>{label}</span>
        </label>

        <button
          type="button"
          onClick={() => setIsUrlMode(!isUrlMode)}
          className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{isUrlMode ? "Upload File instead" : "Use Image URL"}</span>
        </button>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg("")}
            className="text-red-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* URL Input Mode */}
      {isUrlMode ? (
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all font-mono"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer"
          >
            Apply URL
          </button>
        </div>
      ) : null}

      {/* Uploading Progress */}
      {isUploading && (
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-blue-400 font-medium truncate">
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              <span>Direct streaming thumbnail to Cloudflare R2...</span>
            </div>
            <span className="font-mono font-bold text-white shrink-0">
              {progress}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Visual Live Preview Card or Drop Area */}
      {value ? (
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Custom Thumbnail Active</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                Change Image
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="relative aspect-video max-w-sm rounded-xl overflow-hidden border border-white/10 bg-neutral-900 shadow-lg group flex items-center justify-center">
            {hasLoadError ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-neutral-950">
                <ImageIcon className="w-8 h-8 text-gray-600 mb-1" />
                <span className="text-xs text-gray-400 font-medium">Image Preview</span>
                <span className="text-[10px] text-gray-600 font-mono mt-0.5 truncate max-w-[200px]">
                  {value}
                </span>
              </div>
            ) : (
              <img
                src={previewUrl}
                alt="Course thumbnail preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={() => setHasLoadError(true)}
              />
            )}
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-gray-300 pointer-events-none">
              16:9 HD
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-6 rounded-2xl border-2 border-dashed border-white/10 hover:border-blue-500/50 bg-white/[0.01] hover:bg-blue-500/[0.02] flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-2 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
            Click to upload custom course thumbnail
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 font-mono">
            PNG, JPG, WEBP up to 10MB (1920x1080 recommended)
          </span>
        </div>
      )}
    </div>
  );
}
