"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  Video,
  DollarSign,
  User,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Save,
  ExternalLink,
  HelpCircle,
  Plus,
} from "lucide-react";
import {
  getAdminCourseByIdAction,
  updateAdminCourseAction,
  deleteAdminCourseAction,
} from "@/lib/actions/admin-courses";
import { getAdminInstructorsAction } from "@/lib/actions/admin-instructors";
import { InstructorItem } from "@/lib/data/instructor-types";
import { CourseFaqItem } from "@/lib/data/courses";
import CurriculumBuilder from "@/components/admin/CurriculumBuilder";
import ImageUploader from "@/components/admin/ImageUploader";
import VideoUploader from "@/components/admin/VideoUploader";

export default function AdminEditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || "";

  // Core metadata
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("Bestseller");
  const [category, setCategory] = useState("Video Editing");
  const [level, setLevel] = useState("Beginner to Advanced");
  const [mainSlogan, setMainSlogan] = useState("");
  const [heroSlogan, setHeroSlogan] = useState("");

  // Pricing
  const [priceBdt, setPriceBdt] = useState("1299");
  const [originalPriceBdt, setOriginalPriceBdt] = useState("3500");
  const [discountPct, setDiscountPct] = useState("63% OFF");

  // Instructor
  const [instructor, setInstructor] = useState("Sakil Ahmed");
  const [instructorId, setInstructorId] = useState("");
  const [instructorsList, setInstructorsList] = useState<InstructorItem[]>([]);

  // Highlights
  const [highlightHours, setHighlightHours] = useState("18+ Hours");
  const [highlightAccess, setHighlightAccess] = useState("Lifetime Access");
  const [highlightCertificate, setHighlightCertificate] = useState("Certificate Included");

  // Media & URLs
  const [thumbnail, setThumbnail] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [curriculum, setCurriculum] = useState<any[]>([]);

  // What you will learn, requirements, includes
  const [whatYouWillLearn, setWhatYouWillLearn] = useState("");
  const [requirements, setRequirements] = useState("");
  const [includes, setIncludes] = useState("");

  // FAQs
  const [faqs, setFaqs] = useState<CourseFaqItem[]>([]);

  // UI state
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Load course details & instructors
  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setIsFetching(true);
      try {
        const [res, instRes] = await Promise.all([
          getAdminCourseByIdAction(id),
          getAdminInstructorsAction(),
        ]);

        if (instRes.success && instRes.instructors) {
          setInstructorsList(instRes.instructors);
        }

        if (res.success && res.product) {
          const p = res.product;
          setTitle(p.title || "");
          setDescription(p.description || "");
          setThumbnail(p.thumbnail || "");
          setSlug(p.handle || "");

          const meta = p.metadata || {};
          if (meta.subtitle) setSubtitle(meta.subtitle);
          if (meta.badge) setBadge(meta.badge);
          if (meta.category) setCategory(meta.category);
          if (meta.level) setLevel(meta.level);
          if (meta.mainSlogan) setMainSlogan(meta.mainSlogan);
          if (meta.heroSlogan) setHeroSlogan(meta.heroSlogan);

          if (meta.instructor) setInstructor(meta.instructor);
          if (meta.instructorId) setInstructorId(meta.instructorId);

          if (meta.trailer_url) setTrailerUrl(meta.trailer_url);
          if (meta.trailerUrl) setTrailerUrl(meta.trailerUrl);

          if (meta.highlights?.hours) setHighlightHours(meta.highlights.hours);
          if (meta.highlights?.access) setHighlightAccess(meta.highlights.access);
          if (meta.highlights?.certificate) setHighlightCertificate(meta.highlights.certificate);

          if (meta.faqs && Array.isArray(meta.faqs)) {
            setFaqs(meta.faqs);
          } else if (typeof meta.faqs === "string") {
            try {
              setFaqs(JSON.parse(meta.faqs));
            } catch {}
          }

          if (meta.curriculum && Array.isArray(meta.curriculum)) {
            setCurriculum(meta.curriculum);
          }
          if (meta.whatYouWillLearn) {
            setWhatYouWillLearn(
              Array.isArray(meta.whatYouWillLearn)
                ? meta.whatYouWillLearn.join("\n")
                : String(meta.whatYouWillLearn)
            );
          }
          if (meta.requirements) {
            setRequirements(
              Array.isArray(meta.requirements)
                ? meta.requirements.join("\n")
                : String(meta.requirements)
            );
          }
          if (meta.includes) {
            setIncludes(
              Array.isArray(meta.includes)
                ? meta.includes.join("\n")
                : String(meta.includes)
            );
          }
          const price =
            p.variants?.[0]?.prices?.find(
              (pr: any) => pr.currency_code === "bdt"
            )?.amount ||
            p.variants?.[0]?.prices?.[0]?.amount ||
            meta.numericPrice ||
            1299;
          setPriceBdt(price.toString());

          if (meta.numericOriginalPrice) {
            setOriginalPriceBdt(meta.numericOriginalPrice.toString());
          } else {
            setOriginalPriceBdt(Math.round(price * 2.2).toString());
          }

          if (meta.discountPct) {
            setDiscountPct(meta.discountPct);
          }
        } else {
          // Fallback title
          setTitle(
            id
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")
          );
          setSlug(id);
        }
      } catch {
        setErrorMsg("Failed to load course details.");
      } finally {
        setIsFetching(false);
      }
    }

    loadData();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Please provide a Course Title.");
      return;
    }

    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await updateAdminCourseAction(id, {
        title: title.trim(),
        description: description.trim(),
        subtitle: subtitle.trim(),
        badge: badge.trim(),
        category: category.trim(),
        level: level.trim(),
        mainSlogan: mainSlogan.trim(),
        heroSlogan: heroSlogan.trim(),
        priceBdt: Number(priceBdt) || 1299,
        originalPriceBdt: Number(originalPriceBdt) || 3500,
        discountPct: discountPct.trim(),
        instructor: instructor.trim(),
        instructorId: instructorId || undefined,
        thumbnail: thumbnail.trim(),
        trailerUrl: trailerUrl.trim(),
        highlights: {
          hours: highlightHours.trim(),
          access: highlightAccess.trim(),
          certificate: highlightCertificate.trim(),
        },
        faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()),
        whatYouWillLearn: whatYouWillLearn
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        requirements: requirements
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        includes: includes
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      });

      if (res.success) {
        setIsSuccess(true);
        setSuccessMsg("Masterclass updated successfully!");
        setTimeout(() => setIsSuccess(false), 3000);
      } else {
        setErrorMsg(res.error || "Failed to update masterclass.");
      }
    } catch {
      setErrorMsg("Network error while updating masterclass.");
    } finally {
      setIsLoading(false);
    }
  };

  const addFaqItem = () => {
    setFaqs((prev) => [
      ...prev,
      {
        question: "",
        answer: "",
      },
    ]);
  };

  const updateFaqItem = (index: number, field: "question" | "answer", value: string) => {
    setFaqs((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeFaqItem = (index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInstructorSelect = (selectedId: string) => {
    setInstructorId(selectedId);
    const found = instructorsList.find((i) => i.id === selectedId);
    if (found) {
      setInstructor(found.name);
    }
  };

  const handleDelete = async () => {
    setErrorMsg("");
    setIsDeleting(true);

    try {
      const res = await deleteAdminCourseAction(id);
      if (res.success) {
        setShowDeleteModal(false);
        router.push("/admin/courses");
        router.refresh();
      } else {
        setErrorMsg(res.error || "Failed to delete masterclass.");
        setIsDeleting(false);
      }
    } catch {
      setErrorMsg("Network error while deleting masterclass.");
      setIsDeleting(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-xs text-gray-400 font-mono">Loading course details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 select-none pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>Masterclass Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Edit Masterclass
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-mono">ID: {id}</p>
        </div>

        <div className="flex items-center gap-3">
          {slug && (
            <Link
              href={`/courses/${slug}`}
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white font-medium text-xs flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview</span>
            </Link>
          )}

          <Link
            href="/admin/courses"
            className="px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white font-medium text-xs flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Courses</span>
          </Link>
        </div>
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Edit Core Metadata Form */}
      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0e1320]/80 border border-white/10 space-y-6">
          <div className="border-b border-white/5 pb-3">
            <h2 className="text-base font-bold text-white tracking-tight">
              General Information & Display Texts
            </h2>
            <p className="text-xs text-gray-400">
              Configure course titles, marketing slogans, badges, and categories.
            </p>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-300">
              Course Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading || isDeleting}
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition-all font-medium"
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-300">
              Course Subtitle (Detailed headline below title)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Master Adobe Premiere Pro from cutting basics to commercial color grading..."
              disabled={isLoading || isDeleting}
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>

          {/* Display Texts Row: Badge, Category, Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                Course Badge
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Bestseller / Hot & New / Top Rated"
                disabled={isLoading || isDeleting}
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Video Editing / Motion Graphics"
                disabled={isLoading || isDeleting}
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                Skill Level
              </label>
              <input
                type="text"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="Beginner to Advanced / All Levels"
                disabled={isLoading || isDeleting}
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
              />
            </div>
          </div>

          {/* Marketing Slogans */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                Main Slogan
              </label>
              <input
                type="text"
                value={mainSlogan}
                onChange={(e) => setMainSlogan(e.target.value)}
                placeholder="The complete roadmap to becoming a professional video editor."
                disabled={isLoading || isDeleting}
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                Hero Banner Slogan
              </label>
              <input
                type="text"
                value={heroSlogan}
                onChange={(e) => setHeroSlogan(e.target.value)}
                placeholder="Master Commercial Editing & Filmmaking"
                disabled={isLoading || isDeleting}
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-300">
              Full Course Overview
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading || isDeleting}
              className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition-all resize-none font-normal"
            />
          </div>

          {/* Pricing & Discount Grid */}
          <div className="border-t border-white/5 pt-4 space-y-3">
            <h3 className="text-sm font-bold text-white">
              Pricing & Discount Configurations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Selling Price (৳ BDT) *</span>
                </label>
                <input
                  type="number"
                  required
                  value={priceBdt}
                  onChange={(e) => setPriceBdt(e.target.value)}
                  disabled={isLoading || isDeleting}
                  className="w-full px-4 py-2 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Original Price (৳ BDT)</span>
                </label>
                <input
                  type="number"
                  value={originalPriceBdt}
                  onChange={(e) => {
                    setOriginalPriceBdt(e.target.value);
                    const orig = Number(e.target.value);
                    const curr = Number(priceBdt);
                    if (orig > curr && curr > 0) {
                      setDiscountPct(`${Math.round((1 - curr / orig) * 100)}% OFF`);
                    }
                  }}
                  disabled={isLoading || isDeleting}
                  className="w-full px-4 py-2 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Discount Badge Text
                </label>
                <input
                  type="text"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(e.target.value)}
                  placeholder="e.g. 63% OFF"
                  disabled={isLoading || isDeleting}
                  className="w-full px-4 py-2 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Assigned Instructor Section */}
          <div className="border-t border-white/5 pt-4 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <User className="w-4 h-4 text-cyan-400" />
              <span>Assigned Lead Instructor</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Select from Live Instructors
                </label>
                <select
                  value={instructorId}
                  onChange={(e) => handleInstructorSelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="">Custom / Unassigned</option>
                  {instructorsList.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Display Instructor Name
                </label>
                <input
                  type="text"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  placeholder="Sakil Ahmed"
                  disabled={isLoading || isDeleting}
                  className="w-full px-4 py-2 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Course Features / Highlights */}
          <div className="border-t border-white/5 pt-4 space-y-3">
            <h3 className="text-sm font-bold text-white">
              Course Highlights & Badges
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Duration Text
                </label>
                <input
                  type="text"
                  value={highlightHours}
                  onChange={(e) => setHighlightHours(e.target.value)}
                  placeholder="18+ Hours (or leave auto)"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Access Model
                </label>
                <input
                  type="text"
                  value={highlightAccess}
                  onChange={(e) => setHighlightAccess(e.target.value)}
                  placeholder="Lifetime Access"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Certification
                </label>
                <input
                  type="text"
                  value={highlightCertificate}
                  onChange={(e) => setHighlightCertificate(e.target.value)}
                  placeholder="Certificate Included"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Custom Thumbnail Upload & Preview */}
          <div className="border-t border-white/5 pt-4">
            <ImageUploader
              value={thumbnail}
              onChange={setThumbnail}
              label="Course Thumbnail (Upload File or Enter URL)"
            />
          </div>

          {/* Cloudflare R2 Direct Trailer Video Uploader */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-cyan-400" />
              <span>Trailer / Preview Video (Cloudflare R2 Direct Upload)</span>
            </label>
            <VideoUploader
              value={trailerUrl}
              r2ObjectKey={trailerUrl}
              onChange={(uploadedKey, publicUrl) => {
                setTrailerUrl(publicUrl || uploadedKey);
              }}
              lessonTitle="Course Trailer"
            />
          </div>

          {/* About Section Customization */}
          <div className="pt-4 border-t border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white">
              Course Details & Syllabus Highlights
            </h3>

            {/* What you will master */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                What You Will Master (One key learning point per line)
              </label>
              <textarea
                rows={4}
                value={whatYouWillLearn}
                onChange={(e) => setWhatYouWillLearn(e.target.value)}
                placeholder={"Master timeline precision cuts and narrative pacing\nCreate dynamic motion graphics and kinetic titles\nCinematic audio sound design and mixdown\nProfessional color grading with 3D LUTs and scopes"}
                className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition-all resize-none font-normal"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Requirements */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  Requirements (One point per line)
                </label>
                <textarea
                  rows={4}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder={"Computer capable of running modern video editing software\nNo prior video editing experience required — from zero to pro"}
                  className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition-all resize-none font-normal"
                />
              </div>

              {/* Includes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-300">
                  This Course Includes (One point per line)
                </label>
                <textarea
                  rows={4}
                  value={includes}
                  onChange={(e) => setIncludes(e.target.value)}
                  placeholder={"On-demand video lessons with R2 streaming\nDownloadable practice project files & RAW footage\nOfficial certificate of completion with verification ID"}
                  className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition-all resize-none font-normal"
                />
              </div>
            </div>
          </div>

          {/* Dynamic FAQ Builder */}
          <div className="pt-4 border-t border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  <span>Frequently Asked Questions ({faqs.length})</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Custom FAQ questions and answers displayed on this course's public details page.
                </p>
              </div>

              <button
                type="button"
                onClick={addFaqItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-bold text-cyan-300 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add FAQ Item</span>
              </button>
            </div>

            {faqs.length === 0 ? (
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center text-xs text-gray-500">
                No custom FAQs yet. Default platform FAQs will be shown if left empty.
              </div>
            ) : (
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2.5 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-cyan-400">
                        FAQ #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFaqItem(index)}
                        className="text-gray-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => updateFaqItem(index, "question", e.target.value)}
                      placeholder="e.g. Do I need any prior video editing experience?"
                      className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white font-medium focus:outline-none focus:border-cyan-500"
                    />

                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => updateFaqItem(index, "answer", e.target.value)}
                      placeholder="Answer details..."
                      className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-gray-300 focus:outline-none focus:border-cyan-500 resize-none font-normal"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            disabled={isLoading || isDeleting}
            className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Masterclass</span>
          </button>

          <button
            type="submit"
            disabled={isLoading || isDeleting}
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Masterclass...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Course Changes</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Curriculum Builder Section */}
      <div className="pt-6 border-t border-white/5">
        <CurriculumBuilder
          key={curriculum.length > 0 ? "loaded-curriculum" : "empty-curriculum"}
          courseId={id}
          initialCurriculum={curriculum}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0e0e10] border border-red-500/30 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Permanently Delete Masterclass?</h3>
                <p className="text-xs text-red-300/80">Hard Database Wipe</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs text-gray-300 font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">Course Title:</span>
                <span className="text-white font-bold">{title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Slug / ID:</span>
                <span className="text-cyan-400">{slug || id}</span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              This action will completely and permanently erase <strong className="text-white">&ldquo;{title}&rdquo;</strong> from the Medusa database, unpublish it from the storefront catalog, and revoke access from all student dashboards.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-400">
                Type <strong className="text-red-400 font-mono">DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                placeholder="Type DELETE"
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmInput("");
                }}
                className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting || deleteConfirmInput.trim() !== "DELETE"}
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all active:scale-95 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Permanently Wipe Masterclass</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
