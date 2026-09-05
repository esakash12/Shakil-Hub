"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Award,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Film,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  UploadCloud,
  X,
  BookOpen,
} from "lucide-react";
import {
  getAdminInstructorsAction,
  saveAdminInstructorAction,
  deleteAdminInstructorAction,
} from "@/lib/actions/admin-instructors";
import { getLiveStorefrontCoursesAction } from "@/lib/actions/storefront-courses";
import { InstructorItem } from "@/lib/data/instructor-types";
import { CourseDetail } from "@/lib/data/courses";

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<InstructorItem[]>([]);
  const [availableCourses, setAvailableCourses] = useState<CourseDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<InstructorItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [instructorToDelete, setInstructorToDelete] = useState<InstructorItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formAvatar, setFormAvatar] = useState("");
  const [formExperience, setFormExperience] = useState("5+ Years");
  const [formProjects, setFormProjects] = useState("100+");
  const [formStudents, setFormStudents] = useState("1K+");
  const [formBio, setFormBio] = useState("");
  const [formYoutube, setFormYoutube] = useState("");
  const [formInstagram, setFormInstagram] = useState("");
  const [formFacebook, setFormFacebook] = useState("");
  const [formLinkedin, setFormLinkedin] = useState("");
  const [formCourseSlugs, setFormCourseSlugs] = useState<string[]>([]);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Load Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [instRes, coursesRes] = await Promise.all([
        getAdminInstructorsAction(),
        getLiveStorefrontCoursesAction(),
      ]);

      if (instRes.success) {
        setInstructors(instRes.instructors);
      }
      if (coursesRes.success && coursesRes.courses) {
        setAvailableCourses(coursesRes.courses);
      }
    } catch (err) {
      console.error("Failed to load instructors page data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingInstructor(null);
    setFormName("");
    setFormRole("Lead Video Editor");
    setFormAvatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80");
    setFormExperience("5+ Years");
    setFormProjects("150+");
    setFormStudents("5K+");
    setFormBio("");
    setFormYoutube("https://youtube.com");
    setFormInstagram("https://instagram.com");
    setFormFacebook("https://facebook.com");
    setFormLinkedin("https://linkedin.com");
    setFormCourseSlugs([]);
    setSaveError("");
    setSaveSuccess("");
    setIsModalOpen(true);
  };

  const openEditModal = (inst: InstructorItem) => {
    setEditingInstructor(inst);
    setFormName(inst.name);
    setFormRole(inst.role);
    setFormAvatar(inst.avatar);
    setFormExperience(inst.experience || "5+ Years");
    setFormProjects(inst.projects || "100+");
    setFormStudents(inst.students || "1K+");
    setFormBio(inst.bio || "");
    setFormYoutube(inst.socials?.youtube || "");
    setFormInstagram(inst.socials?.instagram || "");
    setFormFacebook(inst.socials?.facebook || "");
    setFormLinkedin(inst.socials?.linkedin || "");
    setFormCourseSlugs(inst.courseSlugs || []);
    setSaveError("");
    setSaveSuccess("");
    setIsModalOpen(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setSaveError("");

    try {
      const uploadForm = new FormData();
      uploadForm.append("file", file);

      const res = await fetch("/api/r2/upload", {
        method: "POST",
        body: uploadForm,
      });

      if (!res.ok) {
        throw new Error("Failed to upload avatar to Cloudflare R2.");
      }

      const data = await res.json();
      if (data?.url) {
        setFormAvatar(data.url);
      } else {
        throw new Error("Invalid response from server upload.");
      }
    } catch (err: any) {
      setSaveError(err.message || "Failed to upload image.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const toggleCourseSlug = (slug: string) => {
    setFormCourseSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleSaveInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setSaveError("Instructor Name is required.");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setSaveSuccess("");

    // Prepare courses summary array based on selected slugs
    const assignedCoursesSummaries = availableCourses
      .filter((c) => formCourseSlugs.includes(c.slug))
      .map((c) => ({
        slug: c.slug,
        title: c.title,
        badge: c.badge || "Featured",
        price: c.price,
      }));

    try {
      const payload: Omit<InstructorItem, "createdAt" | "updatedAt"> = {
        id: editingInstructor?.id || "",
        name: formName.trim(),
        role: formRole.trim(),
        avatar: formAvatar.trim(),
        experience: formExperience.trim(),
        projects: formProjects.trim(),
        students: formStudents.trim(),
        bio: formBio.trim(),
        socials: {
          youtube: formYoutube.trim() || undefined,
          instagram: formInstagram.trim() || undefined,
          facebook: formFacebook.trim() || undefined,
          linkedin: formLinkedin.trim() || undefined,
        },
        courseSlugs: formCourseSlugs,
        courses: assignedCoursesSummaries,
      };

      const res = await saveAdminInstructorAction(payload);
      if (res.success && res.instructor) {
        setSaveSuccess("Instructor saved successfully!");
        await loadData();
        setTimeout(() => {
          setIsModalOpen(false);
        }, 800);
      } else {
        setSaveError(res.error || "Failed to save instructor.");
      }
    } catch (err: any) {
      setSaveError(err.message || "Error saving instructor.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteInstructor = async () => {
    if (!instructorToDelete) return;
    setIsDeleting(true);

    try {
      const res = await deleteAdminInstructorAction(instructorToDelete.id);
      if (res.success) {
        await loadData();
        setIsDeleteModalOpen(false);
        setInstructorToDelete(null);
      } else {
        alert(res.error || "Failed to delete instructor.");
      }
    } catch (err: any) {
      alert(err.message || "Error deleting instructor.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredInstructors = instructors.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Content Management System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Instructors & Mentors
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Manage instructors, update bios, profile photos, social handles, and course assignments.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Instructor</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#0e1320]/80 border border-white/10 backdrop-blur-xl shadow-lg">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search instructors by name or specialty..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
        <div className="text-xs font-mono text-gray-400">
          Total: <span className="text-cyan-400 font-bold">{filteredInstructors.length}</span> Mentors
        </div>
      </div>

      {/* Instructors Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="text-xs text-gray-400 font-mono">Loading instructors...</span>
        </div>
      ) : filteredInstructors.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <Award className="w-10 h-10 text-gray-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Instructors Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery
              ? "No instructors match your search query."
              : "Get started by adding your first instructor to the platform."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInstructors.map((inst) => (
            <div
              key={inst.id}
              className="rounded-2xl bg-[#0e1320]/80 border border-white/10 hover:border-cyan-500/30 backdrop-blur-xl p-5 shadow-lg transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header Profile */}
                <div className="flex items-start gap-3.5">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black border border-white/10 shrink-0">
                    <Image
                      src={inst.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"}
                      alt={inst.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-white tracking-tight truncate">
                      {inst.name}
                    </h3>
                    <p className="text-[11px] text-cyan-300 font-medium truncate">
                      {inst.role}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-400 font-mono">
                      <span>{inst.experience} Exp</span>
                      <span>•</span>
                      <span>{inst.students} Students</span>
                    </div>
                  </div>
                </div>

                {/* Bio snippet */}
                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                  {inst.bio || "No bio description provided."}
                </p>

                {/* Assigned Courses */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Assigned Masterclasses ({inst.courseSlugs?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {inst.courseSlugs && inst.courseSlugs.length > 0 ? (
                      inst.courseSlugs.map((slug) => (
                        <span
                          key={slug}
                          className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[10px] text-zinc-300 font-medium truncate max-w-[180px]"
                        >
                          {slug}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-gray-500 italic">No assigned courses</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(inst)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-xs font-semibold text-gray-300 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => {
                      setInstructorToDelete(inst);
                      setIsDeleteModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-xs font-semibold text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

                <a
                  href="/instructors"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-gray-500 hover:text-white transition-colors"
                  title="View on Storefront"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0e1320] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">
                  {editingInstructor ? "Edit Instructor" : "Add New Instructor"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{saveSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveInstructor} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Sakil Ahmed"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Specialty / Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Lead Filmmaker & Colorist"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              {/* Avatar Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Avatar Photo URL
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black border border-white/10 shrink-0">
                    <Image
                      src={formAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"}
                      alt="Avatar Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <input
                    type="text"
                    value={formAvatar}
                    onChange={(e) => setFormAvatar(e.target.value)}
                    placeholder="Image URL or upload file..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  />
                  <label className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-xs font-semibold text-gray-200 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer transition-colors shrink-0">
                    <UploadCloud className="w-4 h-4" />
                    <span>{isUploadingAvatar ? "Uploading..." : "Upload"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={isUploadingAvatar}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Stats Pods */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Experience
                  </label>
                  <input
                    type="text"
                    value={formExperience}
                    onChange={(e) => setFormExperience(e.target.value)}
                    placeholder="8+ Years"
                    className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Projects Done
                  </label>
                  <input
                    type="text"
                    value={formProjects}
                    onChange={(e) => setFormProjects(e.target.value)}
                    placeholder="400+"
                    className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Students
                  </label>
                  <input
                    type="text"
                    value={formStudents}
                    onChange={(e) => setFormStudents(e.target.value)}
                    placeholder="10K+"
                    className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Biography & Background
                </label>
                <textarea
                  rows={3}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Professional background, editing expertise, and achievements..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={formYoutube}
                    onChange={(e) => setFormYoutube(e.target.value)}
                    placeholder="https://youtube.com/@username"
                    className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={formInstagram}
                    onChange={(e) => setFormInstagram(e.target.value)}
                    placeholder="https://instagram.com/username"
                    className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    value={formFacebook}
                    onChange={(e) => setFormFacebook(e.target.value)}
                    placeholder="https://facebook.com/username"
                    className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formLinkedin}
                    onChange={(e) => setFormLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              {/* Course Assignment */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-semibold text-gray-300">
                  Assign Masterclasses
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 rounded-xl bg-black/40 border border-white/10">
                  {availableCourses.map((c) => {
                    const isSelected = formCourseSlugs.includes(c.slug);
                    return (
                      <div
                        key={c.slug}
                        onClick={() => toggleCourseSlug(c.slug)}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-200"
                            : "bg-white/[0.02] border border-white/5 text-gray-300 hover:bg-white/[0.04]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="accent-cyan-400 rounded"
                        />
                        <span className="text-xs truncate font-medium">{c.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Instructor</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && instructorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e1320] border border-red-500/30 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Delete Instructor</h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-white">{instructorToDelete.name}</strong>? This action cannot
              be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteInstructor}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
