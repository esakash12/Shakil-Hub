"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Link as LinkIcon,
  HardDrive,
  FileVideo,
} from "lucide-react";
import { getPresignedUploadUrl } from "@/lib/actions/cloudflare-r2";

interface VideoUploaderProps {
  value?: string;
  r2ObjectKey?: string;
  onChange: (r2Key: string, videoUrl?: string, duration?: string) => void;
  onDurationExtracted?: (durationFormatted: string) => void;
  lessonTitle?: string;
}

function formatVideoDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return "00:00";
  const totalSeconds = Math.round(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }
  return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

const extractVideoDuration = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    try {
      const tempVideo = document.createElement("video");
      tempVideo.preload = "metadata";
      const objectUrl = URL.createObjectURL(file);
      tempVideo.src = objectUrl;

      tempVideo.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        const durationFormatted = formatVideoDuration(tempVideo.duration);
        resolve(durationFormatted);
      };

      tempVideo.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve("");
      };
    } catch {
      resolve("");
    }
  });
};

export default function VideoUploader({
  value = "",
  r2ObjectKey = "",
  onChange,
  onDurationExtracted,
  lessonTitle = "Lesson Video",
}: VideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [fileName, setFileName] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualInput, setManualInput] = useState(value || r2ObjectKey || "");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const currentIdentifier = r2ObjectKey || value;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("video/") && !file.name.match(/\.(mp4|mov|mkv|webm|m4v)$/i)) {
      setErrorMsg("Please select a valid video file (.mp4, .mov, .webm, .mkv)");
      return;
    }

    setErrorMsg("");
    setFileName(file.name);
    setIsUploading(true);
    setProgress(0);

    // Extract genuine video duration via native HTML5 API
    const extractedDuration = await extractVideoDuration(file);
    if (extractedDuration && onDurationExtracted) {
      onDurationExtracted(extractedDuration);
    }

    try {
      // 1. Request secure S3 pre-signed PUT URL from Next.js server action
      const presignedRes = await getPresignedUploadUrl(
        file.name,
        file.type || "video/mp4"
      );

      if (!presignedRes.success || !presignedRes.uploadUrl || !presignedRes.fileKey) {
        setErrorMsg(presignedRes.error || "Failed to generate pre-signed R2 upload URL.");
        setIsUploading(false);
        return;
      }

      const { uploadUrl, objectKey, fileKey, publicUrl } = presignedRes;
      const targetKey = objectKey || fileKey || "";

      // 2. Local fallback simulation if endpoint is mock
      if (uploadUrl === "SIMULATED_R2_UPLOAD") {
        let currentProg = 0;
        const interval = setInterval(() => {
          currentProg += Math.floor(Math.random() * 15) + 12;
          if (currentProg >= 100) {
            clearInterval(interval);
            setProgress(100);
            setTimeout(() => {
              setIsUploading(false);
              onChange(targetKey, publicUrl || `https://r2.sakilhub.com/${targetKey}`);
            }, 400);
          } else {
            setProgress(currentProg);
          }
        }, 180);
        return;
      }

      // 3. Direct Browser-to-Cloudflare R2 HTTP PUT Upload
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
        }
      };

      xhr.onload = () => {
        setIsUploading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          onChange(targetKey, publicUrl || uploadUrl.split("?")[0]);
        } else {
          setErrorMsg(`Cloudflare R2 upload failed (HTTP status: ${xhr.status})`);
        }
      };

      const uploadViaServer = () => {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const serverXhr = new XMLHttpRequest();
          xhrRef.current = serverXhr;

          serverXhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
              const p = Math.round((ev.loaded / ev.total) * 100);
              setProgress(p);
            }
          };

          serverXhr.onload = () => {
            setIsUploading(false);
            try {
              const res = JSON.parse(serverXhr.responseText);
              if (res.success && res.objectKey) {
                onChange(res.objectKey, res.publicUrl || `/api/r2/${res.objectKey}`);
              } else {
                setErrorMsg(res.error || "Server video upload failed. Check R2 credentials or use a YouTube link.");
              }
            } catch {
              setErrorMsg("Cloudflare R2 CORS rejected the upload. Please allow origin http://3.6.15.167:3000 in Cloudflare R2 CORS settings.");
            }
          };

          serverXhr.onerror = () => {
            setIsUploading(false);
            setErrorMsg("Cloudflare R2 upload blocked by CORS policy. Please allow origin http://3.6.15.167:3000 in your Cloudflare R2 bucket settings.");
          };

          serverXhr.open("POST", "/api/upload/video", true);
          serverXhr.send(formData);
        } catch {
          setIsUploading(false);
          setErrorMsg("Direct R2 upload failed. Please verify Cloudflare R2 CORS settings.");
        }
      };

      xhr.onerror = () => {
        // Direct browser-to-R2 failed (CORS block) -> Automatic resilient server proxy fallback
        uploadViaServer();
      };

      xhr.open("PUT", uploadUrl, true);
      xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
      xhr.send(file);
    } catch (err: any) {
      setIsUploading(false);
      setErrorMsg(err.message || "An error occurred during video upload.");
    }
  };

  const handleManualSave = () => {
    if (manualInput.trim()) {
      onChange(manualInput.trim(), manualInput.trim());
      setIsManualMode(false);
    }
  };

  const handleClear = () => {
    onChange("", "");
    setFileName("");
    setManualInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full space-y-2 select-none">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,.mp4,.mov,.mkv,.webm"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg("")}
            className="text-red-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* State: Currently Uploading to R2 */}
      {isUploading && (
        <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-orange-400 font-medium truncate">
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              <span className="truncate">
                Direct uploading &ldquo;{fileName || "video"}&rdquo; to Cloudflare R2...
              </span>
            </div>
            <span className="font-mono font-bold text-white shrink-0">
              {progress}%
            </span>
          </div>

          <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* State: Video Uploaded / Assigned to R2 */}
      {!isUploading && currentIdentifier && (
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-mono text-white text-[11px] truncate">
                {currentIdentifier}
              </div>
              <div className="text-[10px] text-gray-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span>Cloudflare R2 Object Storage Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 text-[11px] font-medium transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
              title="Remove Video"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* State: Ready for Upload */}
      {!isUploading && !currentIdentifier && !isManualMode && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2 px-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 hover:border-orange-500/40 text-orange-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all group"
          >
            <UploadCloud className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            <span>Upload Video to Cloudflare R2</span>
          </button>

          <button
            type="button"
            onClick={() => setIsManualMode(true)}
            className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-gray-400 hover:text-white transition-colors"
            title="Enter R2 Key or URL Manually"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* State: Manual Key / URL Input Fallback */}
      {!isUploading && !currentIdentifier && isManualMode && (
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Paste R2 object key (e.g. lessons/video.mp4) or URL..."
            className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 font-mono"
          />
          <button
            type="button"
            onClick={handleManualSave}
            className="px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-semibold"
          >
            Attach
          </button>
          <button
            type="button"
            onClick={() => setIsManualMode(false)}
            className="p-1.5 rounded-xl hover:bg-white/5 text-gray-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
