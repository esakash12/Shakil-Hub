"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Film,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Sparkles,
  Clock,
  Play,
  X,
  Layers,
  ExternalLink,
  Tag,
  Eye,
  UploadCloud,
  FileVideo,
  Check,
  Video,
} from "lucide-react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import {
  getPortfolioAction,
  savePortfolioItemAction,
  deletePortfolioItemAction,
  savePortfolioCategoryAction,
  deletePortfolioCategoryAction,
} from "@/lib/actions/portfolio";
import { PortfolioCategoryMeta, PortfolioItem } from "@/lib/data/portfolio-types";
import { getPresignedUploadUrl } from "@/lib/actions/cloudflare-r2";
import { resolveMediaUrl } from "@/lib/data/courses";

function formatVideoDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return "01:00";
  const totalSeconds = Math.round(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }
  return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function AdminPortfolioPage() {
  const [categories, setCategories] = useState<PortfolioCategoryMeta[]>([]);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"projects" | "categories">("projects");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Project Modal / Form State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [projectForm, setProjectForm] = useState<PortfolioItem>({
    id: "",
    title: "",
    category: "commercials",
    categoryLabel: "Commercial",
    description: "",
    client: "",
    duration: "1:00",
    thumbnail: "",
    videoUrl: "",
    embedType: "mp4",
    tags: [],
    featured: false,
  });
  const [tagsInput, setTagsInput] = useState("");

  // Video Upload State
  const [videoMode, setVideoMode] = useState<"upload" | "link">("upload");
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoFileName, setVideoFileName] = useState("");
  const [videoUploadError, setVideoUploadError] = useState("");
  const [videoUploadStats, setVideoUploadStats] = useState("");
  const videoInputRef = React.useRef<HTMLInputElement>(null);

  // Category Modal / Form State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState<PortfolioCategoryMeta>({
    id: "",
    label: "",
    badge: "",
    description: "",
  });

  // Notifications
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getPortfolioAction();
      setCategories(data.categories || []);
      setItems(data.items || []);
    } catch (err: any) {
      showToast(err.message || "Failed to load portfolio data.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Lock body scroll and listen for Escape key when modals are open
  useEffect(() => {
    const isAnyModalOpen = isProjectModalOpen || isCategoryModalOpen;
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsProjectModalOpen(false);
          setIsCategoryModalOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isProjectModalOpen, isCategoryModalOpen]);

  // Filtered items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.client && item.client.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Open Project Form for Create
  const handleOpenCreateProject = () => {
    const defaultCat = categories.find((c) => c.id !== "all")?.id || "commercials";
    const catMeta = categories.find((c) => c.id === defaultCat);
    setProjectForm({
      id: `project-${Date.now()}`,
      title: "",
      category: defaultCat,
      categoryLabel: catMeta?.label || "Commercial",
      description: "",
      client: "",
      duration: "1:00",
      thumbnail: "",
      videoUrl: "",
      embedType: "mp4",
      tags: [],
      featured: false,
    });
    setTagsInput("");
    setVideoFileName("");
    setVideoUploadError("");
    setVideoProgress(0);
    setVideoMode("upload");
    setIsProjectModalOpen(true);
  };

  // Open Project Form for Edit
  const handleOpenEditProject = (item: PortfolioItem) => {
    setProjectForm({ ...item });
    setTagsInput(item.tags?.join(", ") || "");
    setVideoFileName("");
    setVideoUploadError("");
    setVideoProgress(0);
    const isEmbed = item.videoUrl && (item.videoUrl.includes("youtube") || item.videoUrl.includes("youtu.be") || item.videoUrl.includes("vimeo"));
    setVideoMode(isEmbed ? "link" : "upload");
    setIsProjectModalOpen(true);
  };

  // Video File Upload Handler with Cloudflare R2 Direct Pre-Signed Support
  const handleVideoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File validation
    if (!file.type.startsWith("video/") && !file.name.match(/\.(mp4|mov|mkv|webm|m4v)$/i)) {
      setVideoUploadError("Please select a valid video file (.mp4, .mov, .webm, .mkv)");
      return;
    }

    const totalMb = (file.size / (1024 * 1024)).toFixed(1);
    setVideoUploadError("");
    setVideoFileName(file.name);
    setIsUploadingVideo(true);
    setVideoProgress(0);
    setVideoUploadStats(`0 MB / ${totalMb} MB (0%)`);

    // 1. Asynchronously Extract Duration & Thumbnail with Safety Timeout
    (async () => {
      try {
        const tempVideo = document.createElement("video");
        tempVideo.preload = "metadata";
        tempVideo.muted = true;
        tempVideo.playsInline = true;
        const blobUrl = URL.createObjectURL(file);
        tempVideo.src = blobUrl;

        const timer = setTimeout(() => {
          try { URL.revokeObjectURL(blobUrl); } catch {}
        }, 5000);

        tempVideo.onloadedmetadata = () => {
          const formatted = formatVideoDuration(tempVideo.duration);
          setProjectForm((prev) => ({
            ...prev,
            duration: formatted,
          }));
          tempVideo.currentTime = Math.min(1.0, tempVideo.duration / 2);
        };

        tempVideo.onseeked = () => {
          clearTimeout(timer);
            const canvas = document.createElement("canvas");
            canvas.width = 480;
            canvas.height = 270;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(tempVideo, 0, 0, 480, 270);
              const frameUrl = canvas.toDataURL("image/jpeg", 0.65);
              setProjectForm((prev) => {
                if (!prev.thumbnail) {
                  return { ...prev, thumbnail: frameUrl };
                }
                return prev;
              });
            }
          try { URL.revokeObjectURL(blobUrl); } catch {}
        };
      } catch (err) {
        console.warn("Video metadata notice:", err);
      }
    })();

    // 2. High-Performance Direct Browser-to-Cloudflare R2 Upload
    try {
      const presigned = await getPresignedUploadUrl(
        file.name,
        file.type || "video/mp4",
        "portfolio"
      );

      if (presigned.success && presigned.uploadUrl) {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            const pct = Math.round((ev.loaded / ev.total) * 100);
            setVideoProgress(pct);
            const loadedMb = (ev.loaded / (1024 * 1024)).toFixed(1);
            setVideoUploadStats(`${loadedMb} MB / ${totalMb} MB (${pct}%)`);
          }
        };

        xhr.onload = () => {
          setIsUploadingVideo(false);
          if (xhr.status >= 200 && xhr.status < 300) {
            const targetUrl = presigned.publicUrl || `/api/r2/${presigned.objectKey}`;
            setProjectForm((prev) => ({
              ...prev,
              videoUrl: targetUrl,
              embedType: "mp4",
            }));
            setVideoProgress(100);
            showToast("Video file uploaded successfully to Cloudflare R2!");
          } else {
            console.warn(`R2 direct PUT returned status ${xhr.status}, attempting fallback...`);
            uploadViaServerFallback(file, totalMb);
          }
        };

        xhr.onerror = () => {
          console.warn("R2 direct upload network error, attempting server upload fallback...");
          uploadViaServerFallback(file, totalMb);
        };

        xhr.open("PUT", presigned.uploadUrl, true);
        xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
        xhr.send(file);
        return;
      }
    } catch (presignErr) {
      console.warn("Presigned URL generation failed, using server fallback:", presignErr);
    }

    // Fallback if R2 pre-sign is unavailable
    uploadViaServerFallback(file, totalMb);
  };

  // Resilient Server Upload Fallback
  const uploadViaServerFallback = (file: File, totalMb: string) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          const pct = Math.round((ev.loaded / ev.total) * 100);
          setVideoProgress(pct);
          const loadedMb = (ev.loaded / (1024 * 1024)).toFixed(1);
          setVideoUploadStats(`${loadedMb} MB / ${totalMb} MB (${pct}%)`);
        }
      };

      xhr.onload = () => {
        setIsUploadingVideo(false);
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.success && res.url) {
            setProjectForm((prev) => ({
              ...prev,
              videoUrl: res.url,
              embedType: "mp4",
            }));
            setVideoProgress(100);
            showToast("Video file uploaded successfully!");
          } else {
            setVideoUploadError(res.error || "Video upload failed on server.");
          }
        } catch {
          setVideoUploadError("Failed to parse server upload response.");
        }
      };

      xhr.onerror = () => {
        setIsUploadingVideo(false);
        setVideoUploadError("Network connection error. Check your connection or upload a smaller file.");
      };

      xhr.open("POST", "/api/upload/video", true);
      xhr.send(formData);
    } catch (err: any) {
      setIsUploadingVideo(false);
      setVideoUploadError(err.message || "An error occurred during video upload.");
    }
  };

  // Save Project
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title.trim()) {
      showToast("Please enter a project title.", "error");
      return;
    }

    let finalThumbnail = projectForm.thumbnail.trim();
    const vUrl = projectForm.videoUrl || "";

    // Auto-derive thumbnail if user did not provide one
    if (!finalThumbnail) {
      if (vUrl) {
        const ytId = getYouTubeVideoId(vUrl);
        if (ytId) {
          finalThumbnail = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
        } else {
          finalThumbnail = "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80";
        }
      }
    }

    if (!finalThumbnail && !vUrl.trim()) {
      showToast("Please upload a video or project thumbnail.", "error");
      return;
    }

    setIsSavingProject(true);
    try {
      const selectedCat = categories.find((c) => c.id === projectForm.category);
      const cleanedTags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const ytId = getYouTubeVideoId(vUrl);
      const isVimeo = vUrl.includes("vimeo.com");
      const detectedEmbedType: "youtube" | "vimeo" | "mp4" = ytId
        ? "youtube"
        : isVimeo
        ? "vimeo"
        : "mp4";

      const payload: PortfolioItem = {
        ...projectForm,
        videoUrl: vUrl,
        thumbnail: finalThumbnail,
        embedType: detectedEmbedType,
        categoryLabel: selectedCat?.label || projectForm.category,
        tags: cleanedTags,
      };

      const res = await savePortfolioItemAction(payload);
      if (res.success) {
        showToast("Project saved successfully!");
        setIsProjectModalOpen(false);
        loadData();
      } else {
        showToast(res.error || "Failed to save project.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "An error occurred while saving.", "error");
    } finally {
      setIsSavingProject(false);
    }
  };

  // Delete Project
  const handleDeleteProject = async (item: PortfolioItem) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) {
      return;
    }

    try {
      const res = await deletePortfolioItemAction(item.id);
      if (res.success) {
        showToast("Project deleted successfully.");
        loadData();
      } else {
        showToast(res.error || "Failed to delete project.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to delete project.", "error");
    }
  };

  // Open Category Form for Create
  const handleOpenCreateCategory = () => {
    setCategoryForm({
      id: "",
      label: "",
      badge: "",
      description: "",
    });
    setIsCategoryModalOpen(true);
  };

  // Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.label.trim()) {
      showToast("Category name is required.", "error");
      return;
    }

    const slug =
      categoryForm.id.trim() ||
      categoryForm.label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    setIsSavingCategory(true);
    try {
      const res = await savePortfolioCategoryAction({
        ...categoryForm,
        id: slug,
      });

      if (res.success) {
        showToast("Category saved successfully!");
        setIsCategoryModalOpen(false);
        loadData();
      } else {
        showToast(res.error || "Failed to save category.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to save category.", "error");
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (cat: PortfolioCategoryMeta) => {
    if (cat.id === "all") {
      showToast("The 'All' category cannot be deleted.", "error");
      return;
    }

    const count = items.filter((i) => i.category === cat.id).length;
    const confirmText =
      count > 0
        ? `"${cat.label}" has ${count} project(s) assigned. Deleting it will reassign them to another category. Proceed?`
        : `Are you sure you want to delete category "${cat.label}"?`;

    if (!confirm(confirmText)) return;

    try {
      const res = await deletePortfolioCategoryAction(cat.id);
      if (res.success) {
        showToast("Category deleted successfully.");
        loadData();
      } else {
        showToast(res.error || "Failed to delete category.", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to delete category.", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-xs sm:text-sm font-medium transition-all ${
            toastMessage.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300"
              : "bg-red-950/90 border-red-500/30 text-red-300"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00d2ff] to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,210,255,0.3)]">
              <Film className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Portfolio <span className="text-[#00d2ff]">CMS</span>
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Manage showcase video projects, upload thumbnails, assign categories, and control the live landing page portfolio.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {activeTab === "projects" ? (
            <button
              type="button"
              onClick={handleOpenCreateProject}
              className="px-4 py-2 rounded-xl bg-[#00d2ff] hover:bg-[#00b8e6] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,210,255,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Project</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenCreateCategory}
              className="px-4 py-2 rounded-xl bg-[#00d2ff] hover:bg-[#00b8e6] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,210,255,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Category</span>
            </button>
          )}

          <a
            href="/#portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white font-medium text-xs flex items-center gap-1.5 transition-all"
          >
            <span>Live View</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("projects")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "projects"
              ? "bg-[#00d2ff] text-black shadow-[0_0_15px_rgba(0,210,255,0.3)]"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Projects & Videos</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === "projects"
                ? "bg-black text-cyan-300"
                : "bg-white/10 text-zinc-300"
            }`}
          >
            {items.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "categories"
              ? "bg-[#00d2ff] text-black shadow-[0_0_15px_rgba(0,210,255,0.3)]"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Categories</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === "categories"
                ? "bg-black text-cyan-300"
                : "bg-white/10 text-zinc-300"
            }`}
          >
            {categories.length}
          </span>
        </button>
      </div>

      {/* Loading Indicator */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500">
          <Loader2 className="w-7 h-7 text-[#00d2ff] animate-spin" />
          <span className="text-xs font-mono">Loading portfolio data...</span>
        </div>
      ) : activeTab === "projects" ? (
        /* ================= PROJECTS TAB ================= */
        <div className="space-y-4">
          {/* Search & Filter Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, client, tags..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#00d2ff]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-zinc-400 whitespace-nowrap">Filter:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00d2ff] cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} {c.id !== "all" ? `(${items.filter((i) => i.category === c.id).length})` : `(${items.length})`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Projects Grid */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <Film className="w-10 h-10 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300">No projects found</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                No portfolio items match your search or filter. Try a different query or add a new project.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateProject}
                className="px-4 py-2 rounded-xl bg-[#00d2ff] hover:bg-[#00b8e6] text-black font-extrabold text-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Project</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#070b16] border border-white/5 hover:border-[#00d2ff]/30 overflow-hidden flex flex-col justify-between transition-all duration-300 group"
                >
                  {/* Thumbnail & Badges */}
                  <div className="relative aspect-[16/10] bg-black overflow-hidden">
                    {item.thumbnail ? (
                      <Image
                        src={resolveMediaUrl(item.thumbnail) || item.thumbnail}
                        alt={item.title}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Film className="w-8 h-8" />
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070b16] via-transparent to-transparent opacity-80" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[#00d2ff] text-[10px] font-mono font-bold uppercase tracking-wider">
                        {item.categoryLabel || item.category}
                      </span>
                      {item.duration && (
                        <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-zinc-300 text-[10px] font-mono flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{item.duration}</span>
                        </span>
                      )}
                    </div>

                    {/* Featured Tag */}
                    {item.featured && (
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                          <span>Featured</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-black text-white line-clamp-1 group-hover:text-[#00d2ff] transition-colors">
                        {item.title}
                      </h3>
                      {item.client && (
                        <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                          Client: <span className="text-zinc-200">{item.client}</span>
                        </p>
                      )}
                      {item.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.tags.slice(0, 3).map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/5 text-[10px] text-zinc-400 font-mono"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      {item.videoUrl ? (
                        <a
                          href={item.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-mono text-zinc-400 hover:text-[#00d2ff] flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 text-[#00d2ff]" />
                          <span>Preview Video</span>
                        </a>
                      ) : (
                        <span className="text-[11px] font-mono text-zinc-600">No video link</span>
                      )}

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditProject(item)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-[#00d2ff] hover:bg-cyan-500/10 transition-colors"
                          title="Edit Project"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(item)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ================= CATEGORIES TAB ================= */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Portfolio Categories</h2>
              <p className="text-xs text-zinc-400">
                Categories are shown as filter pills on the landing page portfolio section.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenCreateCategory}
              className="px-4 py-2 rounded-xl bg-[#00d2ff] hover:bg-[#00b8e6] text-black font-extrabold text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const count = items.filter((i) => i.category === cat.id).length;
              const isDefaultAll = cat.id === "all";

              return (
                <div
                  key={cat.id}
                  className="p-4 rounded-2xl bg-[#070b16] border border-white/5 space-y-3 relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{cat.label}</h3>
                        {cat.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-[#00d2ff] text-[10px] font-mono">
                            {cat.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                        Slug: <span className="text-zinc-300">{cat.id}</span>
                      </p>
                    </div>

                    {!isDefaultAll && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {cat.description && (
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {cat.description}
                    </p>
                  )}

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span>Assigned Projects:</span>
                    <span className="font-bold text-white">{isDefaultAll ? items.length : count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= PROJECT MODAL (2-COLUMN STUDIO LAYOUT) ================= */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-hidden">
          <div className="relative w-full max-w-5xl bg-[#080d1a] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden animate-in fade-in duration-200">
            {/* Modal Sticky Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#080d1a]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-[#00d2ff] shadow-sm">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                    {projectForm.id && items.some((i) => i.id === projectForm.id)
                      ? "Edit Portfolio Project"
                      : "Studio Project Builder"}
                  </h2>
                  <p className="text-[11px] text-zinc-400">
                    Configure project details, video streaming source & 16:9 cinematic thumbnail
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form with Scrollable 2-Column Body & Sticky Footer */}
            <form onSubmit={handleSaveProject} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* LEFT COLUMN: Metadata & Project Information (6 cols) */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center gap-2 pb-1 border-b border-white/5 text-xs font-bold text-[#00d2ff] uppercase tracking-wider font-mono">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Project Information</span>
                    </div>

                    {/* Project Title */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-300">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={projectForm.title}
                        onChange={(e) =>
                          setProjectForm((prev) => ({ ...prev, title: e.target.value }))
                        }
                        placeholder="e.g. Cyberpunk Commercial Reel"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#00d2ff]"
                      />
                    </div>

                    {/* Category & Client Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Category Dropdown */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-zinc-300">
                          Category *
                        </label>
                        <select
                          value={projectForm.category}
                          onChange={(e) => {
                            const catId = e.target.value;
                            const catMeta = categories.find((c) => c.id === catId);
                            setProjectForm((prev) => ({
                              ...prev,
                              category: catId,
                              categoryLabel: catMeta?.label || catId,
                            }));
                          }}
                          className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00d2ff] cursor-pointer"
                        >
                          {categories
                            .filter((c) => c.id !== "all")
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.label}
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Client Name */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-zinc-300">
                          Client Name (optional)
                        </label>
                        <input
                          type="text"
                          value={projectForm.client || ""}
                          onChange={(e) =>
                            setProjectForm((prev) => ({ ...prev, client: e.target.value }))
                          }
                          placeholder="e.g. RedBull, Nike, Apex"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>
                    </div>

                    {/* Duration & Tags */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Video Duration */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-zinc-300">
                          Video Duration
                        </label>
                        <input
                          type="text"
                          value={projectForm.duration || ""}
                          onChange={(e) =>
                            setProjectForm((prev) => ({ ...prev, duration: e.target.value }))
                          }
                          placeholder="e.g. 1:45"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>

                      {/* Tags */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-zinc-300">
                          Tags (comma separated)
                        </label>
                        <input
                          type="text"
                          value={tagsInput}
                          onChange={(e) => setTagsInput(e.target.value)}
                          placeholder="e.g. 4K, Color Grade, VFX"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#00d2ff]"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-300">
                        Project Description
                      </label>
                      <textarea
                        rows={4}
                        value={projectForm.description}
                        onChange={(e) =>
                          setProjectForm((prev) => ({ ...prev, description: e.target.value }))
                        }
                        placeholder="Describe the creative direction, camera workflow, sound design, and impact of this reel..."
                        className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#00d2ff] resize-none"
                      />
                    </div>

                    {/* Featured Toggle */}
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-white">Featured Project</p>
                          <p className="text-[10.5px] text-zinc-400">Showcase this reel on the hero & top portfolio slots</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        id="featuredProject"
                        checked={!!projectForm.featured}
                        onChange={(e) =>
                          setProjectForm((prev) => ({ ...prev, featured: e.target.checked }))
                        }
                        className="w-4 h-4 rounded text-[#00d2ff] focus:ring-0 cursor-pointer accent-[#00d2ff]"
                      />
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Media Studio & Video Player (6 cols) */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center gap-2 pb-1 border-b border-white/5 text-xs font-bold text-[#00d2ff] uppercase tracking-wider font-mono">
                      <Film className="w-3.5 h-3.5" />
                      <span>Media Studio & Stream Source</span>
                    </div>

                    {/* VIDEO UPLOADER / LINK TABBED BOX */}
                    <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                          <Film className="w-3.5 h-3.5 text-[#00d2ff]" />
                          <span>Video Source *</span>
                        </label>

                        {/* Mode Selector Pill Buttons */}
                        <div className="flex items-center p-0.5 rounded-lg bg-white/5 border border-white/10">
                          <button
                            type="button"
                            onClick={() => setVideoMode("upload")}
                            className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                              videoMode === "upload"
                                ? "bg-[#00d2ff] text-black shadow-sm"
                                : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            Upload File
                          </button>
                          <button
                            type="button"
                            onClick={() => setVideoMode("link")}
                            className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                              videoMode === "link"
                                ? "bg-[#00d2ff] text-black shadow-sm"
                                : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            Paste Link
                          </button>
                        </div>
                      </div>

                      {/* Mode 1: File Upload */}
                      {videoMode === "upload" ? (
                        <div className="space-y-3">
                          <input
                            ref={videoInputRef}
                            type="file"
                            accept="video/mp4,video/quicktime,video/webm,video/x-matroska,video/*"
                            onChange={handleVideoFileSelect}
                            className="hidden"
                          />

                          {/* Drop / Pick Zone */}
                          <div
                            onClick={() => videoInputRef.current?.click()}
                            className="border-2 border-dashed border-white/15 hover:border-[#00d2ff]/50 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-white/[0.01] hover:bg-[#00d2ff]/5 flex flex-col items-center justify-center gap-1.5 group"
                          >
                            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[#00d2ff] group-hover:scale-110 transition-transform">
                              <UploadCloud className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white group-hover:text-[#00d2ff] transition-colors">
                                {videoFileName
                                  ? videoFileName
                                  : "Click or drag & drop video file"}
                              </p>
                              <p className="text-[10px] text-zinc-500 mt-0.5">
                                MP4, MOV, WebM (Cloudflare R2 Direct Streaming)
                              </p>
                            </div>
                          </div>

                          {/* Upload Error */}
                          {videoUploadError && (
                            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{videoUploadError}</span>
                            </div>
                          )}

                          {/* Upload Progress Bar */}
                          {isUploadingVideo && (
                            <div className="p-3 rounded-xl bg-black/60 border border-white/10 space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] font-mono">
                                <span className="text-[#00d2ff] font-bold flex items-center gap-1.5">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span>{videoUploadStats ? `Uploading: ${videoUploadStats}` : "Uploading video..."}</span>
                                </span>
                                <span className="text-zinc-300 font-bold">{videoProgress}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-[#00d2ff] to-blue-500 transition-all duration-300"
                                  style={{ width: `${videoProgress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Currently Linked or Uploaded Video Confirmation */}
                          {projectForm.videoUrl && (
                            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span className="text-zinc-300 truncate font-mono text-[11px]">
                                  {projectForm.videoUrl}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setProjectForm((prev) => ({ ...prev, videoUrl: "" }));
                                  setVideoFileName("");
                                }}
                                className="text-zinc-400 hover:text-red-400 p-1 transition-colors"
                                title="Remove Video"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Mode 2: Paste External Video Link */
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={projectForm.videoUrl || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setProjectForm((prev) => ({ ...prev, videoUrl: val }));
                              const ytId = getYouTubeVideoId(val);
                              if (ytId && !projectForm.thumbnail) {
                                setProjectForm((prev) => ({
                                  ...prev,
                                  thumbnail: `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`,
                                }));
                              }
                            }}
                            placeholder="Paste YouTube (unlisted/public), Vimeo, or direct MP4 URL"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#00d2ff]"
                          />
                          <p className="text-[10.5px] text-zinc-500">
                            ✦ Unlisted YouTube links stream in 4K with 0 buffer and our cloaked player automatically hides all YouTube branding.
                          </p>
                        </div>
                      )}

                      {/* Live Video Preview Box (If URL is Present) */}
                      {projectForm.videoUrl && (
                        <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] text-zinc-400">
                            <span className="font-mono text-zinc-400 flex items-center gap-1.5">
                              <Eye className="w-3 h-3 text-[#00d2ff]" />
                              <span>Live Stream Preview:</span>
                            </span>
                            <span className="text-[10px] text-emerald-400 font-mono">Ready to Stream</span>
                          </div>
                          <div className="relative w-full aspect-video rounded-xl bg-black overflow-hidden border border-white/10 shadow-inner">
                            {getYouTubeVideoId(projectForm.videoUrl) ? (
                              <iframe
                                src={`https://www.youtube.com/embed/${getYouTubeVideoId(projectForm.videoUrl)}?controls=1&modestbranding=1`}
                                title="Video Preview"
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                className="w-full h-full border-0"
                              />
                            ) : (
                              <video
                                src={resolveMediaUrl(projectForm.videoUrl) || projectForm.videoUrl}
                                controls
                                preload="metadata"
                                className="w-full h-full object-contain"
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Thumbnail Image with Upload Support */}
                    <div>
                      <ImageUploadField
                        label="Project Thumbnail Image (16:9 Showcase)"
                        value={projectForm.thumbnail}
                        onChange={(url) =>
                          setProjectForm((prev) => ({ ...prev, thumbnail: url }))
                        }
                        variant="banner"
                        placeholder="https://images.unsplash.com/... or upload thumbnail"
                        description="High-resolution 16:9 thumbnail. If left blank with a YouTube link, automatically fetched."
                        buttonLabel="Upload Project Thumbnail"
                        badgeText="16:9 Showcase"
                      />
                    </div>

                    {/* Pro Optimization Tip Notice */}
                    <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-cyan-300 text-[11px] leading-relaxed flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-[#00d2ff] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">Pro Streaming Tip:</strong> For zero-lag mobile playback, keep direct MP4s under 30MB (H.264/WebM). Or paste an <em>Unlisted YouTube link</em> to get unlimited 4K 60FPS bandwidth with zero buffer!
                      </span>
                    </div>

                  </div>
                </div>
              </div>

              {/* Modal Sticky Footer */}
              <div className="px-5 sm:px-6 py-3.5 border-t border-white/10 flex items-center justify-between shrink-0 bg-[#080d1a]">
                <span className="hidden sm:inline-block text-[11px] text-zinc-500 font-mono">
                  All updates sync in real-time to the landing page showcase.
                </span>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsProjectModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProject}
                    className="px-6 py-2.5 rounded-xl bg-[#00d2ff] hover:bg-[#00b8e6] text-black font-extrabold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.4)] disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingProject ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Save Project</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CATEGORY MODAL ================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
          <div className="relative w-full max-w-md bg-[#080d1a] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#080d1a]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-[#00d2ff]">
                  <Layers className="w-4 h-4" />
                </div>
                <h2 className="text-base font-black text-white">Add Portfolio Category</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryForm.label}
                    onChange={(e) => {
                      const label = e.target.value;
                      const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                      setCategoryForm((prev) => ({ ...prev, label, id: slug }));
                    }}
                    placeholder="e.g. Music Videos"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00d2ff]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Slug / ID
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryForm.id}
                    onChange={(e) =>
                      setCategoryForm((prev) => ({
                        ...prev,
                        id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                      }))
                    }
                    placeholder="e.g. music-videos"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00d2ff] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Badge Label (optional)
                  </label>
                  <input
                    type="text"
                    value={categoryForm.badge || ""}
                    onChange={(e) =>
                      setCategoryForm((prev) => ({ ...prev, badge: e.target.value }))
                    }
                    placeholder="e.g. Viral, 3D, High-ROI"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00d2ff]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Short Description
                  </label>
                  <textarea
                    rows={2}
                    value={categoryForm.description || ""}
                    onChange={(e) =>
                      setCategoryForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Brief description of this portfolio category..."
                    className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-[#00d2ff] resize-none"
                  />
                </div>
              </div>

              <div className="px-5 py-3.5 border-t border-white/10 flex items-center justify-end gap-3 shrink-0 bg-[#080d1a]">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCategory}
                  className="px-5 py-2.5 rounded-xl bg-[#00d2ff] hover:bg-[#00b8e6] text-black font-extrabold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.4)] disabled:opacity-50 cursor-pointer"
                >
                  {isSavingCategory ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Save Category</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
