"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Layers,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Clock,
  ChevronDown,
  ChevronUp,
  Paperclip,
  FileDown,
  HardDrive,
} from "lucide-react";
import {
  updateCourseCurriculumAction,
  ModuleItemState,
  LessonItemState,
} from "@/lib/actions/admin-curriculum";
import VideoUploader from "@/components/admin/VideoUploader";

interface CurriculumBuilderProps {
  courseId: string;
  initialCurriculum?: ModuleItemState[];
}

export default function CurriculumBuilder({
  courseId,
  initialCurriculum = [],
}: CurriculumBuilderProps) {
  const [modules, setModules] = useState<ModuleItemState[]>(() => {
    if (initialCurriculum && initialCurriculum.length > 0) {
      return initialCurriculum;
    }
    return [
      {
        id: "mod-1",
        title: "Module 1: Interface & Project Organization",
        duration: "1h 15m",
        lessons: [
          {
            id: "1-1",
            title: "Course Introduction & Overview",
            duration: "05:20",
            r2_object_key: "",
            videoUrl: "",
            attachmentUrl: "",
            attachmentName: "",
            isPreview: true,
            isFreePreview: true,
          },
          {
            id: "1-2",
            title: "Workspace Customization & Essential Shortcuts",
            duration: "12:45",
            r2_object_key: "",
            videoUrl: "",
            attachmentUrl: "https://sakilhub.com/docs/shortcuts.pdf",
            attachmentName: "Premiere Pro Cheat Sheet (.PDF)",
            isPreview: false,
            isFreePreview: false,
          },
        ],
      },
    ];
  });

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    "mod-1": true,
  });

  const [expandedLessonDetails, setExpandedLessonDetails] = useState<
    Record<string, boolean>
  >({});

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const toggleLessonDetails = (lesId: string) => {
    setExpandedLessonDetails((prev) => ({
      ...prev,
      [lesId]: !prev[lesId],
    }));
  };

  // Add new module
  const handleAddModule = () => {
    const newId = `mod-${Date.now()}`;
    const newModule: ModuleItemState = {
      id: newId,
      title: `Module ${modules.length + 1}: New Curriculum Chapter`,
      duration: "1h 00m",
      lessons: [
        {
          id: `${newId}-1`,
          title: "Lesson 1: Overview",
          duration: "10:00",
          r2_object_key: "",
          videoUrl: "",
          attachmentUrl: "",
          attachmentName: "",
          isPreview: false,
          isFreePreview: false,
        },
      ],
    };

    setModules([...modules, newModule]);
    setExpandedModules((prev) => ({ ...prev, [newId]: true }));
  };

  // Delete module
  const handleDeleteModule = (modId: string) => {
    setModules(modules.filter((m) => m.id !== modId));
  };

  // Update module title
  const handleUpdateModuleTitle = (modId: string, title: string) => {
    setModules(
      modules.map((m) => (m.id === modId ? { ...m, title } : m))
    );
  };

  // Add lesson to module
  const handleAddLesson = (modId: string) => {
    setModules(
      modules.map((m) => {
        if (m.id === modId) {
          const newLesson: LessonItemState = {
            id: `les-${Date.now()}`,
            title: `Lesson ${m.lessons.length + 1}: `,
            duration: "12:00",
            r2_object_key: "",
            videoUrl: "",
            attachmentUrl: "",
            attachmentName: "",
            isPreview: false,
            isFreePreview: false,
          };
          return {
            ...m,
            lessons: [...m.lessons, newLesson],
          };
        }
        return m;
      })
    );
  };

  // Update lesson field
  const handleUpdateLesson = (
    modId: string,
    lesId: string,
    field: keyof LessonItemState,
    value: any
  ) => {
    setModules((prevModules) =>
      prevModules.map((m) => {
        if (m.id === modId) {
          return {
            ...m,
            lessons: m.lessons.map((l) => {
              if (l.id === lesId) {
                const updated = { ...l, [field]: value };
                if (field === "isFreePreview") {
                  updated.isPreview = value;
                }
                if (field === "isPreview") {
                  updated.isFreePreview = value;
                }
                if (field === "r2_object_key") {
                  updated.r2Key = value;
                }
                return updated;
              }
              return l;
            }),
          };
        }
        return m;
      })
    );
  };

  // Atomic update of multiple lesson fields (eliminates state race condition)
  const handleUpdateLessonFields = (
    modId: string,
    lesId: string,
    updates: Partial<LessonItemState>
  ) => {
    setModules((prevModules) =>
      prevModules.map((m) => {
        if (m.id === modId) {
          return {
            ...m,
            lessons: m.lessons.map((l) => {
              if (l.id === lesId) {
                return {
                  ...l,
                  ...updates,
                  r2_object_key: updates.r2_object_key !== undefined ? updates.r2_object_key : l.r2_object_key,
                  r2Key: updates.r2_object_key !== undefined ? updates.r2_object_key : l.r2Key,
                };
              }
              return l;
            }),
          };
        }
        return m;
      })
    );
  };

  // Delete lesson
  const handleDeleteLesson = (modId: string, lesId: string) => {
    setModules((prevModules) =>
      prevModules.map((m) => {
        if (m.id === modId) {
          return {
            ...m,
            lessons: m.lessons.filter((l) => l.id !== lesId),
          };
        }
        return m;
      })
    );
  };

  // Save Curriculum
  const handleSaveCurriculum = async () => {
    setErrorMsg("");
    setIsLoading(true);

    try {
      const sanitizedModules = modules.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => ({
          ...l,
          r2_object_key: l.r2_object_key || (l as any).r2Key || "",
          r2Key: l.r2_object_key || (l as any).r2Key || "",
          videoUrl: l.videoUrl || l.r2_object_key || "",
        })),
      }));

      console.log("Saving Curriculum Payload to Medusa:", sanitizedModules);

      const res = await updateCourseCurriculumAction(courseId, sanitizedModules);
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3500);
      } else {
        setErrorMsg(res.error || "Failed to save curriculum.");
      }
    } catch {
      setErrorMsg("A network error occurred while saving curriculum.");
    } finally {
      setIsLoading(false);
    }
  };

  const totalLessons = modules.reduce(
    (acc, mod) => acc + (mod.lessons?.length || 0),
    0
  );

  const totalAttachments = modules.reduce(
    (acc, mod) =>
      acc +
      (mod.lessons?.filter((l) => !!l.attachmentUrl?.trim()).length || 0),
    0
  );

  return (
    <div className="space-y-6 pt-4">
      {/* Curriculum Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Curriculum, Cloudflare R2 & Attachments
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              <span>R2 Storage</span>
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono">
              {modules.length} Chapters
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
              {totalLessons} Video Lectures
            </span>
            {totalAttachments > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono flex items-center gap-1">
                <Paperclip className="w-3 h-3" />
                <span>{totalAttachments} Downloadable Resources</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAddModule}
            className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Chapter</span>
          </button>

          <button
            type="button"
            onClick={handleSaveCurriculum}
            disabled={isLoading}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {isSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-semibold">
            Curriculum, Cloudflare R2 object keys, and downloadable attachments saved successfully!
          </span>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Modules List */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white/[0.01] border border-dashed border-white/10 text-center space-y-3">
            <Layers className="w-8 h-8 text-gray-500 mx-auto" />
            <p className="text-xs text-gray-400">No chapters added yet.</p>
            <button
              type="button"
              onClick={handleAddModule}
              className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Chapter</span>
            </button>
          </div>
        ) : (
          modules.map((module, modIndex) => {
            const isExpanded = expandedModules[module.id] ?? true;

            return (
              <div
                key={module.id}
                className="rounded-2xl bg-[#0c0c0e] border border-white/5 overflow-hidden transition-all duration-200"
              >
                {/* Module Header Card */}
                <div className="p-4 sm:p-5 bg-white/[0.02] border-b border-white/5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleModule(module.id)}
                      className="p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex-1 max-w-xl">
                      <input
                        type="text"
                        value={module.title}
                        onChange={(e) =>
                          handleUpdateModuleTitle(module.id, e.target.value)
                        }
                        placeholder="Chapter Title..."
                        className="w-full bg-transparent text-sm sm:text-base font-bold text-white focus:outline-none focus:border-b focus:border-orange-500 py-1 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-gray-500 hidden sm:inline">
                      {module.lessons.length} lessons
                    </span>

                    <button
                      type="button"
                      onClick={() => handleAddLesson(module.id)}
                      className="px-3 py-1.5 rounded-lg bg-orange-600/10 hover:bg-orange-600/20 text-orange-400 text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span className="hidden sm:inline">Add Lesson</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteModule(module.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                      title="Delete Chapter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Lessons Nested Container */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 space-y-3 bg-black/40">
                    {module.lessons.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-white/5 text-center text-xs text-gray-500">
                        No lessons in this chapter yet. Click &ldquo;+ Add Lesson&rdquo; above.
                      </div>
                    ) : (
                      module.lessons.map((lesson, lesIndex) => {
                        const isLessonExpanded =
                          expandedLessonDetails[lesson.id] ?? false;

                        return (
                          <div
                            key={lesson.id}
                            className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 space-y-3 transition-colors"
                          >
                            {/* Primary Row */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                              {/* Lesson Number & Title */}
                              <div className="md:col-span-5 flex items-center gap-2.5">
                                <span className="text-[11px] font-mono text-gray-500 shrink-0 w-6">
                                  #{lesIndex + 1}
                                </span>
                                <input
                                  type="text"
                                  value={lesson.title}
                                  onChange={(e) =>
                                    handleUpdateLesson(
                                      module.id,
                                      lesson.id,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Lesson Title..."
                                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 font-medium"
                                />
                              </div>

                              {/* Cloudflare R2 Direct Video Uploader */}
                              <div className="md:col-span-4">
                                <VideoUploader
                                  value={lesson.videoUrl || ""}
                                  r2ObjectKey={lesson.r2_object_key || lesson.r2Key || ""}
                                  onChange={(r2Key, videoUrl, extractedDuration) => {
                                    handleUpdateLessonFields(module.id, lesson.id, {
                                      r2_object_key: r2Key,
                                      r2Key: r2Key,
                                      videoUrl: videoUrl || r2Key,
                                      ...(extractedDuration ? { duration: extractedDuration } : {}),
                                    });
                                  }}
                                  onDurationExtracted={(durationStr) => {
                                    handleUpdateLesson(
                                      module.id,
                                      lesson.id,
                                      "duration",
                                      durationStr
                                    );
                                  }}
                                  lessonTitle={lesson.title}
                                />
                              </div>

                              {/* Duration, Preview Toggle & Actions */}
                              <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-2">
                                {/* Duration */}
                                <div
                                  className="flex items-center gap-1"
                                  title="Lesson Runtime Duration"
                                >
                                  <Clock className="w-3 h-3 text-gray-500" />
                                  <input
                                    type="text"
                                    value={lesson.duration || "10:00"}
                                    onChange={(e) =>
                                      handleUpdateLesson(
                                        module.id,
                                        lesson.id,
                                        "duration",
                                        e.target.value
                                      )
                                    }
                                    placeholder="10:00"
                                    className="w-14 bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-center text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                                  />
                                </div>

                                {/* Free Preview Toggle */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateLesson(
                                      module.id,
                                      lesson.id,
                                      "isFreePreview",
                                      !(lesson.isFreePreview ?? lesson.isPreview)
                                    )
                                  }
                                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${
                                    lesson.isFreePreview ?? lesson.isPreview
                                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                      : "bg-white/5 text-gray-500 hover:text-gray-300"
                                  }`}
                                  title="Toggle Free Preview for prospective students"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Free</span>
                                </button>

                                {/* Toggle Resource Details */}
                                <button
                                  type="button"
                                  onClick={() => toggleLessonDetails(lesson.id)}
                                  className={`p-1.5 rounded-lg border transition-colors ${
                                    lesson.attachmentUrl?.trim()
                                      ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                                      : "border-transparent text-gray-500 hover:text-gray-300"
                                  }`}
                                  title="Downloadable Source Files & Attachments"
                                >
                                  <Paperclip className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete Lesson */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteLesson(module.id, lesson.id)
                                  }
                                  className="p-1 rounded text-gray-500 hover:text-red-400 transition-colors"
                                  title="Delete Lesson"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Collapsible Attachment & Resource Panel */}
                            {(isLessonExpanded || !!lesson.attachmentUrl) && (
                              <div className="p-3 rounded-lg bg-black/60 border border-white/5 space-y-2 text-xs">
                                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-400">
                                  <FileDown className="w-3.5 h-3.5" />
                                  <span>Downloadable Source Files & PDF Notes</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[10px] text-gray-400 block mb-1">
                                      Attachment Download URL (Google Drive, Github, Dropbox, PDF)
                                    </label>
                                    <input
                                      type="url"
                                      value={lesson.attachmentUrl || ""}
                                      onChange={(e) =>
                                        handleUpdateLesson(
                                          module.id,
                                          lesson.id,
                                          "attachmentUrl",
                                          e.target.value
                                        )
                                      }
                                      placeholder="https://drive.google.com/..."
                                      className="w-full bg-black/80 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 font-mono"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[10px] text-gray-400 block mb-1">
                                      Display Label (e.g. Project RAW Clips.zip)
                                    </label>
                                    <input
                                      type="text"
                                      value={lesson.attachmentName || ""}
                                      onChange={(e) =>
                                        handleUpdateLesson(
                                          module.id,
                                          lesson.id,
                                          "attachmentName",
                                          e.target.value
                                        )
                                      }
                                      placeholder="e.g. 4K RAW Practice Files (.ZIP)"
                                      className="w-full bg-black/80 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Save Action */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSaveCurriculum}
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Curriculum Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Curriculum & R2 Objects 🚀</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
