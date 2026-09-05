"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  FileText,
  FileArchive,
  Palette,
  Sparkles,
  MessageSquare,
  Plus,
  Trash2,
  Send,
  User,
  ShieldCheck,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Lock,
} from "lucide-react";
import {
  getCourseProgressAction,
  toggleLessonCompletionAction,
} from "@/lib/actions/progress";
import {
  getLessonNotesAction,
  saveLessonNoteAction,
  deleteLessonNoteAction,
  getLessonQuestionsAction,
  postLessonQuestionAction,
  QuestionItem,
} from "@/lib/actions/classroom-interactions";

interface LessonInfoTabsProps {
  lessonTitle?: string;
  courseSlug?: string;
  lessonId?: string;
  moduleTitle?: string;
  duration?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  overview?: string;
  prevLessonId?: string;
  nextLessonId?: string;
  isCompleted?: boolean;
  isToggling?: boolean;
  isUnlockThresholdReached?: boolean;
  watchPercentage?: number;
  onToggleComplete?: () => void;
}

export default function LessonInfoTabs({
  lessonTitle = "Lesson",
  courseSlug = "",
  lessonId = "",
  moduleTitle = "",
  duration = "",
  attachmentUrl,
  attachmentName,
  overview,
  prevLessonId,
  nextLessonId,
  isCompleted: propIsCompleted,
  isToggling: propIsToggling,
  isUnlockThresholdReached,
  watchPercentage = 0,
  onToggleComplete: propOnToggleComplete,
}: LessonInfoTabsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "resources" | "qa" | "notes">("overview");
  const [isCompleted, setIsCompleted] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [downloadToast, setDownloadToast] = useState("");

  // Notes & Q&A States
  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [isPostingQuestion, setIsPostingQuestion] = useState(false);

  // Load persistent completion status, notes, and Q&A on mount/lesson change
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [progress, loadedNotes, loadedQA] = await Promise.all([
          getCourseProgressAction(courseSlug),
          getLessonNotesAction(courseSlug, lessonId),
          getLessonQuestionsAction(courseSlug, lessonId),
        ]);

        if (isMounted) {
          setIsCompleted(progress.completedLessonIds.includes(lessonId));
          setNotes(loadedNotes || []);
          setQuestions(loadedQA || []);
        }
      } catch (err) {
        console.error("Failed to load lesson interactions:", err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [courseSlug, lessonId]);

  const handleToggleComplete = async () => {
    if (isToggling) return;
    setIsToggling(true);
    const previous = isCompleted;
    setIsCompleted(!previous);

    try {
      const res = await toggleLessonCompletionAction(courseSlug, lessonId);
      if (res.success) {
        setIsCompleted(res.isCompleted);
      } else {
        setIsCompleted(previous);
      }
    } catch {
      setIsCompleted(previous);
    } finally {
      setIsToggling(false);
    }
  };

  // Handle Note Add & Delete
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || isSavingNote) return;
    setIsSavingNote(true);

    const noteText = newNote.trim();
    setNewNote("");
    // Optimistic
    setNotes((prev) => [...prev, noteText]);

    try {
      const res = await saveLessonNoteAction(courseSlug, lessonId, noteText);
      if (res.success && res.notes) {
        setNotes(res.notes);
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteNote = async (index: number) => {
    // Optimistic
    setNotes((prev) => prev.filter((_, i) => i !== index));
    try {
      const res = await deleteLessonNoteAction(courseSlug, lessonId, index);
      if (res.success && res.notes) {
        setNotes(res.notes);
      }
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  // Handle Q&A Post
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || isPostingQuestion) return;
    setIsPostingQuestion(true);

    const qText = newQuestion.trim();
    setNewQuestion("");

    // Optimistic
    const tempQ: QuestionItem = {
      id: `temp-${Date.now()}`,
      courseSlug,
      lessonId,
      author: "You",
      time: "Just now",
      question: qText,
      createdAt: new Date().toISOString(),
    };
    setQuestions((prev) => [tempQ, ...prev]);

    try {
      const res = await postLessonQuestionAction(courseSlug, lessonId, qText, "You");
      if (res.success && res.questions) {
        setQuestions(res.questions);
      }
    } catch (err) {
      console.error("Failed to post question:", err);
    } finally {
      setIsPostingQuestion(false);
    }
  };

  // Dynamic Shortcuts based on Masterclass
  const shortcuts =
    courseSlug === "after-effects-masterclass"
      ? [
          { key: "V", action: "Selection Tool" },
          { key: "U", action: "Reveal Keyframes (Properties with animation)" },
          { key: "P", action: "Position Property" },
          { key: "S", action: "Scale Property" },
          { key: "R", action: "Rotation Property" },
          { key: "T", action: "Opacity Property" },
          { key: "N", action: "Set Work Area End" },
          { key: "Space", action: "RAM Preview Playback Toggle" },
        ]
      : courseSlug === "davinci-resolve-color-grading"
      ? [
          { key: "Alt + S", action: "Add Serial Node" },
          { key: "Alt + P", action: "Add Parallel Node" },
          { key: "Alt + L", action: "Add Layer Node" },
          { key: "Shift + H", action: "Highlight / Qualifier Selection Mask" },
          { key: "B", action: "Blade (Cut) Tool" },
          { key: "A", action: "Arrow Selection Tool" },
          { key: "Space", action: "Play / Stop Timeline Toggle" },
          { key: "Shift + Z", action: "Fit Timeline to View" },
        ]
      : [
          { key: "V", action: "Selection Tool" },
          { key: "C", action: "Razor (Cut) Tool" },
          { key: "Q", action: "Ripple Trim Previous Edit to Playhead" },
          { key: "W", action: "Ripple Trim Next Edit to Playhead" },
          { key: "Space", action: "Play / Stop Toggle" },
          { key: "L", action: "Fast Forward Playback (2x, 4x, 8x)" },
        ];

  // Real lesson attachment assets
  const resources = attachmentUrl
    ? [
        {
          title: attachmentName || "Lesson_Project_Files.zip",
          size: "Downloadable Asset",
          icon: FileArchive,
          type: "Direct Lesson Resource Attachment",
          url: attachmentUrl,
        },
      ]
    : [];

  const handleDownload = (res: { title: string; url?: string }) => {
    if (res.url && res.url.startsWith("http")) {
      window.open(res.url, "_blank");
    } else {
      setDownloadToast(`Preparing download for ${res.title}...`);
      setTimeout(() => setDownloadToast(""), 3500);
    }
  };

  return (
    <div className="space-y-6 pt-2 select-none">
      {/* Lesson Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {lessonTitle}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {moduleTitle} • {duration} • Full HD 1080p
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {prevLessonId && (
            <Link
              href={`/learn/${courseSlug}/${prevLessonId}`}
              className="px-3.5 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white font-medium text-xs flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prev</span>
            </Link>
          )}

          {(() => {
            const effectiveCompleted =
              propIsCompleted !== undefined ? propIsCompleted : isCompleted;
            const effectiveToggling =
              propIsToggling !== undefined ? propIsToggling : isToggling;
            const effectiveToggle = propOnToggleComplete || handleToggleComplete;
            const isLocked =
              !effectiveCompleted && isUnlockThresholdReached === false;

            if (isLocked) {
              return (
                <button
                  type="button"
                  disabled={true}
                  title="Watch at least 90% of the video lesson to unlock completion"
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 bg-white/[0.03] text-gray-500 border border-white/5 cursor-not-allowed opacity-75"
                >
                  <Lock className="w-4 h-4 text-gray-500" />
                  <span>
                    Watch 90% to Complete ({Math.round(watchPercentage)}%)
                  </span>
                </button>
              );
            }

            return (
              <button
                type="button"
                onClick={effectiveToggle}
                disabled={effectiveToggling}
                className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                  effectiveCompleted
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    : "bg-blue-600/20 text-blue-400 border border-blue-500/40 hover:bg-blue-600 hover:text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] animate-pulse"
                }`}
              >
                {effectiveToggling ? (
                  <Loader2
                    className={`w-4 h-4 animate-spin ${
                      effectiveCompleted ? "text-emerald-400" : "text-blue-400"
                    }`}
                  />
                ) : (
                  <CheckCircle
                    className={`w-4 h-4 ${
                      effectiveCompleted ? "text-emerald-400" : "text-blue-400"
                    }`}
                  />
                )}
                <span>
                  {effectiveCompleted ? "Completed" : "Mark as Complete"}
                </span>
              </button>
            );
          })()}

          {nextLessonId && (
            <Link
              href={`/learn/${courseSlug}/${nextLessonId}`}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all"
            >
              <span>Next Lesson</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {downloadToast && (
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Download className="w-4 h-4 shrink-0" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Tabs Navigation - High-Contrast Elevated Glowing Pill Architecture */}
      <div className="rounded-2xl bg-[#0e1320]/85 border border-white/10 p-1.5 shadow-[0_4px_25px_rgba(0,0,0,0.4)] backdrop-blur-xl flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
        {(
          [
            { id: "overview", label: "Overview", icon: FileText, count: null },
            { id: "resources", label: "Resources", icon: FileArchive, count: resources.length },
            { id: "qa", label: "Q&A", icon: MessageSquare, count: questions.length },
            { id: "notes", label: "Notes", icon: Sparkles, count: notes.length },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/25 to-blue-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.05] border border-transparent"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive ? "text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]" : "text-zinc-400"
                }`}
              />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                      : "bg-white/[0.06] text-zinc-400"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {/* 1. Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-5">
            <div className="text-xs sm:text-sm text-gray-300 space-y-2.5 leading-relaxed font-normal">
              <p>
                {overview ||
                  (courseSlug === "after-effects-masterclass"
                    ? "In this masterclass lesson, you will master essential visual effects techniques, keyframe interpolation, graph editor smoothing, and composition masking."
                    : courseSlug === "davinci-resolve-color-grading"
                    ? "In this masterclass lesson, you will master professional digital color grading: DaVinci node pipelines, Primaries wheels, HDR grading palettes, and shot matching."
                    : "In this masterclass lesson, you will master precision video editing: Timeline tools, track targeting, snapping, and pacing your sequence seamlessly.")}
              </p>
            </div>

            {/* Key Takeaways */}
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 sm:p-5 space-y-3">
              <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Key Lesson Takeaways
              </h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>
                    {courseSlug === "after-effects-masterclass"
                      ? "Always use Easy Ease (F9) and tweak the Speed Graph for organic, smooth motion kinematics."
                      : courseSlug === "davinci-resolve-color-grading"
                      ? "Balance contrast and pivot in node 1 before applying any creative look LUTs down the chain."
                      : "Always keep snapping turned on (S) to avoid microscopic 1-frame black gaps on edits."}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>
                    {courseSlug === "after-effects-masterclass"
                      ? "Master Null Object parenting to orchestrate complex multi-layer camera animations easily."
                      : courseSlug === "davinci-resolve-color-grading"
                      ? "Use the Waveform and Vectorscope instruments to verify broadcast-safe skin tone luminance and hue."
                      : "Master the three-point editing technique to insert clips from the Source monitor with surgical accuracy."}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>
                    {courseSlug === "after-effects-masterclass"
                      ? "Use Shape Layer trim paths and repeater modifiers to create dynamic animated UI accents."
                      : courseSlug === "davinci-resolve-color-grading"
                      ? "Parallel and Layer nodes allow you to isolate qualifiers and power windows without compounding noise."
                      : "Track targeting dictates where paste operations and keyboard inserts land on your sequence."}
                  </span>
                </li>
              </ul>
            </div>

            {/* Shortcuts Cheat Sheet */}
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 sm:p-5">
              <h4 className="text-xs sm:text-sm font-bold text-white mb-3">
                {courseSlug === "after-effects-masterclass"
                  ? "Essential After Effects Shortcuts"
                  : courseSlug === "davinci-resolve-color-grading"
                  ? "Essential DaVinci Resolve Shortcuts"
                  : "Essential Premiere Pro Shortcuts"}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {shortcuts.map((sc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5 text-xs"
                  >
                    <span className="text-gray-400">{sc.action}</span>
                    <kbd className="px-2 py-0.5 rounded bg-blue-600/20 border border-blue-500/30 text-blue-400 font-mono font-bold">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. Resources Tab */}
        {activeTab === "resources" && (
          <div className="space-y-3">
            {resources.length > 0 ? (
              resources.map((res, index) => {
                const Icon = res.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-white">
                          {res.title}
                        </h4>
                        <p className="text-[11px] text-gray-400">
                          {res.type} • {res.size}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownload(res)}
                      className="p-2 sm:px-3.5 sm:py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                    >
                      {res.url && res.url.startsWith("http") ? (
                        <>
                          <ExternalLink className="w-4 h-4 text-cyan-400" />
                          <span className="hidden sm:inline">Open Asset</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 text-blue-400" />
                          <span className="hidden sm:inline">Download</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-8 sm:p-12 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                <FileArchive className="w-8 h-8 text-gray-500 mx-auto" />
                <h4 className="text-xs sm:text-sm font-semibold text-white">No Downloadable Assets</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto font-normal leading-relaxed">
                  This lesson does not have additional project files attached. Follow along directly with the instructor&apos;s timeline demonstration.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 3. Q&A Tab */}
        {activeTab === "qa" && (
          <div className="space-y-6">
            {/* Ask Question Form */}
            <form onSubmit={handleAddQuestion} className="space-y-3">
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Have a question about this lesson? Ask instructor and community..."
                rows={3}
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 p-3.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPostingQuestion}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isPostingQuestion ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Post Question</span>
                </button>
              </div>
            </form>

            {/* Questions Thread */}
            {questions.length > 0 ? (
              <div className="space-y-4">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">
                          {q.author.charAt(0)}
                        </div>
                        <span className="font-semibold text-white">{q.author}</span>
                      </div>
                      <span className="text-gray-500 text-[11px]">{q.time}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                      {q.question}
                    </p>

                    {/* Instructor Reply */}
                    {q.reply && (
                      <div className="ml-4 p-3 rounded-lg bg-blue-600/10 border border-blue-500/20 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-blue-400 font-semibold text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{q.reply.author}</span>
                          </div>
                          <span className="text-gray-500 text-[10px]">{q.reply.time}</span>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {q.reply.text}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 sm:p-12 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-gray-500 mx-auto" />
                <h4 className="text-xs sm:text-sm font-semibold text-white">No Questions Yet</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto font-normal leading-relaxed">
                  Have a question or stuck on a concept? Post your question above to get guidance from your instructor and classmates.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 4. Notes Tab */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Type a personal note for this lesson (e.g., '14:20 - Remember to check color scopes')..."
                rows={3}
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 p-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
              <button
                type="submit"
                disabled={isSavingNote}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isSavingNote ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>Save Note</span>
              </button>
            </form>

            <div className="space-y-2.5 pt-2">
              {notes.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">
                  No notes added yet for this lesson.
                </p>
              ) : (
                notes.map((note, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start justify-between gap-3 text-xs text-gray-300"
                  >
                    <span className="leading-relaxed font-normal">{note}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(index)}
                      className="text-gray-500 hover:text-red-400 p-1 transition-colors shrink-0 cursor-pointer"
                      aria-label="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
