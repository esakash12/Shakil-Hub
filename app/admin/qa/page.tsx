"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import {
  getAllAdminQuestionsAction,
  replyToQuestionAction,
  deleteQuestionAction,
  QuestionItem,
} from "@/lib/actions/classroom-interactions";

export default function AdminQAPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"all" | "unanswered" | "answered">("unanswered");
  const [searchQuery, setSearchQuery] = useState("");

  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await getAllAdminQuestionsAction();
      setQuestions(data);
    } catch {
      setActionMsg({ type: "error", text: "Failed to load questions." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSendReply = async (q: QuestionItem) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    setActionMsg(null);

    try {
      const res = await replyToQuestionAction(q.id, replyText, q.courseSlug, q.lessonId);
      if (res.success) {
        setActionMsg({ type: "success", text: "Reply posted successfully!" });
        setReplyText("");
        setActiveReplyId(null);
        fetchQuestions();
      } else {
        setActionMsg({ type: "error", text: res.error || "Failed to post reply." });
      }
    } catch {
      setActionMsg({ type: "error", text: "An error occurred while posting reply." });
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDelete = async (q: QuestionItem) => {
    if (!window.confirm("Are you sure you want to delete this student question?")) return;
    try {
      const res = await deleteQuestionAction(q.id, q.courseSlug, q.lessonId);
      if (res.success) {
        setActionMsg({ type: "success", text: "Question deleted." });
        setQuestions((prev) => prev.filter((item) => item.id !== q.id));
      } else {
        setActionMsg({ type: "error", text: "Failed to delete question." });
      }
    } catch {
      setActionMsg({ type: "error", text: "An error occurred while deleting question." });
    }
  };

  const unansweredCount = questions.filter((q) => !q.reply).length;
  const answeredCount = questions.filter((q) => !!q.reply).length;

  const filteredQuestions = questions.filter((q) => {
    const isUnanswered = !q.reply;
    if (filterTab === "unanswered" && !isUnanswered) return false;
    if (filterTab === "answered" && isUnanswered) return false;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchAuthor = (q.author || "").toLowerCase().includes(query);
      const matchQuestion = (q.question || "").toLowerCase().includes(query);
      const matchCourse = (q.courseSlug || "").toLowerCase().includes(query);
      return matchAuthor || matchQuestion || matchCourse;
    }
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>Classroom Support</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Classroom Q&A Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-normal">
            Moderate, review, and answer questions asked by enrolled students across all masterclasses.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchQuestions}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 flex items-center gap-2 self-start sm:self-auto cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Questions</span>
        </button>
      </div>

      {actionMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            actionMsg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {actionMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterTab("unanswered")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === "unanswered"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                : "bg-white/[0.03] text-gray-400 hover:text-white border border-white/5"
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Unanswered ({unansweredCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab("answered")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === "answered"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "bg-white/[0.03] text-gray-400 hover:text-white border border-white/5"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Answered ({answeredCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterTab === "all"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-white/[0.03] text-gray-400 hover:text-white border border-white/5"
            }`}
          >
            All ({questions.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student or question..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Questions Feed */}
      {loading ? (
        <div className="py-16 text-center text-xs text-gray-500 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
          <p>Loading classroom discussions...</p>
        </div>
      ) : filteredQuestions.length > 0 ? (
        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const isUnanswered = !q.reply;

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border transition-all space-y-4 backdrop-blur-md ${
                  isUnanswered
                    ? "bg-amber-500/[0.02] border-amber-500/20"
                    : "bg-white/[0.02] border-white/5"
                }`}
              >
                {/* Top Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-white">{q.author}</span>
                    {q.email && (
                      <span className="text-[11px] text-gray-500 font-mono">({q.email})</span>
                    )}
                    <span className="text-gray-600">•</span>
                    <span className="text-[11px] text-gray-500">{q.time}</span>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Link
                      href={`/learn/${q.courseSlug}/${q.lessonId}`}
                      target="_blank"
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                    >
                      <span className="capitalize">{q.courseSlug.replace(/-/g, " ")}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(q)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Delete question"
                    >
                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </div>
                </div>

                {/* Question Content */}
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-normal">
                  {q.question}
                </p>

                {/* Existing Reply */}
                {q.reply && (
                  <div className="p-3.5 rounded-xl bg-blue-600/10 border border-blue-500/20 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-blue-400 font-semibold text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>{q.reply.author}</span>
                      </div>
                      <span className="text-gray-500 text-[10px]">{q.reply.time}</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {q.reply.text}
                    </p>
                  </div>
                )}

                {/* Reply Form */}
                {activeReplyId === q.id ? (
                  <div className="space-y-2 pt-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your official instructor response to this student..."
                      rows={3}
                      className="w-full rounded-xl bg-black/40 border border-white/15 p-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveReplyId(null);
                          setReplyText("");
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendReply(q)}
                        disabled={submittingReply || !replyText.trim()}
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {submittingReply ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                        ) : (
                          <Send className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>Post Reply</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveReplyId(q.id);
                        setReplyText(q.reply ? q.reply.text : "");
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3 shrink-0" />
                      <span>{q.reply ? "Edit Reply" : "Answer Question"}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 text-center space-y-3 rounded-2xl bg-white/[0.02] border border-white/5 p-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6 shrink-0" />
          </div>
          <h3 className="text-base font-bold text-white">
            {filterTab === "unanswered" ? "No Unanswered Questions" : "No Questions Found"}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {filterTab === "unanswered"
              ? "All student questions in the classroom currently have replies. Great work!"
              : "No student questions match your search or filter."}
          </p>
        </div>
      )}
    </div>
  );
}
