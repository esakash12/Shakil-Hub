"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  DollarSign,
  User,
  CheckCircle2,
  AlertCircle,
  Video,
  Plus,
  Trash2,
  HelpCircle,
} from "lucide-react";
import { createAdminCourseAction } from "@/lib/actions/admin-courses";
import { getAdminInstructorsAction } from "@/lib/actions/admin-instructors";
import { InstructorItem } from "@/lib/data/instructor-types";
import type { CourseFaqItem } from "@/lib/data/courses";
import VideoUploader from "@/components/admin/VideoUploader";
import ImageUploader from "@/components/admin/ImageUploader";

export default function AdminCreateCoursePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState("Bestseller");
  const [category, setCategory] = useState("Video Editing");
  const [level, setLevel] = useState("Beginner to Advanced");
  const [description, setDescription] = useState("");
  const [mainSlogan, setMainSlogan] = useState("");
  const [heroSlogan, setHeroSlogan] = useState("");

  // Pricing
  const [priceBdt, setPriceBdt] = useState("1299");
  const [originalPriceBdt, setOriginalPriceBdt] = useState("3500");
  const [discountPct, setDiscountPct] = useState("63% OFF");

  // Highlights
  const [highlightHours, setHighlightHours] = useState("18+ Hours");
  const [highlightAccess, setHighlightAccess] = useState("Lifetime Access");
  const [highlightCertificate, setHighlightCertificate] = useState("Certificate Included");

  // FAQs
  const [faqs, setFaqs] = useState<CourseFaqItem[]>([]);

  const [instructor, setInstructor] = useState("Sakil Ahmed");
  const [instructorId, setInstructorId] = useState("");
  const [instructorsList, setInstructorsList] = useState<InstructorItem[]>([]);
  const [thumbnail, setThumbnail] = useState(
    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80"
  );
  const [trailerUrl, setTrailerUrl] = useState("");
  const [r2Key, setR2Key] = useState("");
  const [whatYouWillLearn, setWhatYouWillLearn] = useState("");
  const [requirements, setRequirements] = useState("");
  const [includes, setIncludes] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  useEffect(() => {
    async function loadInstructors() {
      try {
        const res = await getAdminInstructorsAction();
        if (res.success && res.instructors) {
          setInstructorsList(res.instructors);
        }
      } catch {}
    }
    loadInstructors();
  }, []);

  const handleInstructorSelect = (selectedId: string) => {
    setInstructorId(selectedId);
    const found = instructorsList.find((i) => i.id === selectedId);
    if (found) {
      setInstructor(found.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Please provide a Course Title.");
      return;
    }

    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await createAdminCourseAction({
        title: title.trim(),
        subtitle: subtitle.trim(),
        badge: badge.trim(),
        category: category.trim(),
        level: level.trim(),
        description: description.trim(),
        mainSlogan: mainSlogan.trim(),
        heroSlogan: heroSlogan.trim(),
        priceBdt: Number(priceBdt) || 1299,
        originalPriceBdt: Number(originalPriceBdt) || 3500,
        discountPct: discountPct.trim(),
        instructor: instructor.trim(),
        instructorId: instructorId || undefined,
        thumbnail: thumbnail.trim(),
        trailerUrl: trailerUrl.trim() || r2Key || "https://youtube.com/watch?v=demo",
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
        const destination = "/admin/courses";
        setTimeout(() => {
          window.location.href = destination;
        }, 800);
      } else {
        setErrorMsg(res.error || "Failed to create masterclass.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>Headless LMS Creator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create Masterclass
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-normal">
            Physical weights, dimensions, and shipping are automatically bypassed.
          </p>
        </div>

        <Link
          href="/admin/courses"
          className="px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white font-medium text-xs flex items-center gap-1.5 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Courses</span>
        </Link>
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div>
            <div className="font-bold">Masterclass Created Successfully!</div>
            <div className="text-emerald-400/80 text-xs">
              Opening course editor to manage curriculum modules & video lessons...
            </div>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label
              htmlFor="course-title"
              className="block text-xs font-semibold text-gray-300"
            >
              Course Title *
            </label>
            <input
              id="course-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Premiere Pro Masterclass: Complete Video Editing Course"
              disabled={isLoading || isSuccess}
              className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-300">
              Course Subtitle (Headline description)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Master professional editing workflows from zero to hero..."
              disabled={isLoading || isSuccess}
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>

          {/* Badge & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                Badge
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Bestseller / Hot & New"
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
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
                placeholder="Video Editing"
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
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
                placeholder="Beginner to Advanced"
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Slogans */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                Main Headline Slogan
              </label>
              <input
                type="text"
                value={mainSlogan}
                onChange={(e) => setMainSlogan(e.target.value)}
                placeholder="e.g. MASTER THE ART OF CINEMATIC EDITING"
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 font-mono uppercase"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                Hero Badge Slogan
              </label>
              <input
                type="text"
                value={heroSlogan}
                onChange={(e) => setHeroSlogan(e.target.value)}
                placeholder="e.g. HOLLYWOOD PRODUCTION WORKFLOWS"
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 font-mono uppercase"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="course-desc"
              className="block text-xs font-semibold text-gray-300"
            >
              Course Description & Overview
            </label>
            <textarea
              id="course-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter curriculum highlights, tools taught, and software version..."
              disabled={isLoading || isSuccess}
              className="w-full p-4 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none font-normal"
            />
          </div>

          {/* Pricing Grid */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
              <span>Course Pricing & Discount (BDT) *</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <span className="text-[11px] text-gray-400">Sale Price (৳)</span>
                <input
                  type="number"
                  required
                  value={priceBdt}
                  onChange={(e) => setPriceBdt(e.target.value)}
                  placeholder="1299"
                  disabled={isLoading || isSuccess}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-all font-bold"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-gray-400">Original / Regular Price (৳)</span>
                <input
                  type="number"
                  value={originalPriceBdt}
                  onChange={(e) => setOriginalPriceBdt(e.target.value)}
                  placeholder="3500"
                  disabled={isLoading || isSuccess}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-gray-400 font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-gray-400">Discount Badge Text</span>
                <input
                  type="text"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(e.target.value)}
                  placeholder="63% OFF"
                  disabled={isLoading || isSuccess}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-emerald-400 font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-all font-bold"
                />
              </div>
            </div>
          </div>

          {/* Instructor Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Assign Instructor</span>
            </label>
            <select
              value={instructorId}
              onChange={(e) => handleInstructorSelect(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="">Select Instructor (or default)</option>
              {instructorsList.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.role})
                </option>
              ))}
            </select>
          </div>

          {/* Course Highlights */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-300">
              Course Highlights & Key Badges
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <span className="text-[11px] text-gray-400">Total Duration</span>
                <input
                  type="text"
                  value={highlightHours}
                  onChange={(e) => setHighlightHours(e.target.value)}
                  placeholder="18+ Hours"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-gray-400">Access Duration</span>
                <input
                  type="text"
                  value={highlightAccess}
                  onChange={(e) => setHighlightAccess(e.target.value)}
                  placeholder="Lifetime Access"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-gray-400">Certification</span>
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
          <div className="pt-1">
            <ImageUploader
              value={thumbnail}
              onChange={setThumbnail}
              onUploadingChange={setIsImageUploading}
              label="Course Thumbnail (Upload File or Enter URL)"
            />
          </div>

          {/* Cloudflare R2 Direct Trailer Video Uploader */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-orange-400" />
              <span>Trailer / Preview Video (Cloudflare R2 Direct Upload)</span>
            </label>
            <VideoUploader
              value={trailerUrl}
              r2ObjectKey={r2Key}
              onChange={(uploadedKey, publicUrl) => {
                setR2Key(uploadedKey);
                if (publicUrl) {
                  setTrailerUrl(publicUrl);
                }
              }}
              lessonTitle="Course Trailer"
            />
          </div>

          {/* About Section Highlights */}
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
                className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all resize-none font-normal"
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
                  className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all resize-none font-normal"
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
                  className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all resize-none font-normal"
                />
              </div>
            </div>
          </div>

          {/* FAQs Section */}
          <div className="pt-4 border-t border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-400" />
                  <span>Frequently Asked Questions (FAQs)</span>
                </h3>
                <p className="text-xs text-gray-400">Add course-specific questions and answers</p>
              </div>
              <button
                type="button"
                onClick={addFaqItem}
                className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add FAQ</span>
              </button>
            </div>

            {faqs.length === 0 ? (
              <div className="p-4 rounded-xl bg-black/40 border border-dashed border-white/10 text-center text-xs text-gray-500">
                No FAQs added yet. Click &quot;Add FAQ&quot; to provide helpful answers to prospective students.
              </div>
            ) : (
              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFaqItem(idx, "question", e.target.value)}
                        placeholder="e.g. Do I need previous editing experience?"
                        className="flex-1 px-3.5 py-2 rounded-lg bg-black/60 border border-white/10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeFaqItem(idx)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => updateFaqItem(idx, "answer", e.target.value)}
                      placeholder="Detailed answer to the question..."
                      className="w-full p-3 rounded-lg bg-black/60 border border-white/10 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none font-normal"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/courses"
            className="px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isLoading || isSuccess || isImageUploading}
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing Masterclass...</span>
              </>
            ) : isImageUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading Image...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Publish Masterclass 🚀</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
