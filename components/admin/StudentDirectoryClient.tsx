"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  BookOpen,
  GraduationCap,
  Sparkles,
  CreditCard,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  BellRing,
  Trash2,
  Plus,
  X,
  Loader2,
  AlertTriangle,
  Send,
  MoreVertical,
  Check,
  Ban,
  UserCheck,
  Info,
} from "lucide-react";
import {
  AdminStudentItem,
  updateStudentStatusAction,
  sendStudentNoticeAction,
  deleteStudentNoticeAction,
  grantStudentCourseAccessAction,
  revokeStudentCourseAccessAction,
  deleteStudentAccountAction,
} from "@/lib/actions/admin-students";
import type { CustomerNotice } from "@/lib/data/customers";

interface StudentDirectoryClientProps {
  initialStudents: AdminStudentItem[];
  availableCourses?: { slug: string; title: string }[];
}

const DEFAULT_COURSES: { slug: string; title: string }[] = [];

export default function StudentDirectoryClient({
  initialStudents = [],
  availableCourses = DEFAULT_COURSES,
}: StudentDirectoryClientProps) {
  const [students, setStudents] = useState<AdminStudentItem[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState<
    "all" | "verified" | "pending" | "banned"
  >("all");

  // Modals state
  const [activeStudent, setActiveStudent] = useState<AdminStudentItem | null>(null);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form states
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [noticeType, setNoticeType] = useState<"info" | "warning" | "alert" | "success">("info");

  const [selectedStatus, setSelectedStatus] = useState<"active" | "banned" | "temp_banned">("active");
  const [banReason, setBanReason] = useState("");
  const [tempBanDays, setTempBanDays] = useState(7);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  const totalLearners = students.length;
  const verifiedCount = students.filter((s) => s.status === "verified").length;
  const pendingCount = students.filter((s) => s.status === "pending").length;
  const bannedCount = students.filter((s) => s.status === "banned" || s.status === "temp_banned").length;
  const totalRevenue = students.reduce((acc, s) => acc + (s.totalSpent || 0), 0);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Tab filter
      if (filterTab === "verified" && student.status !== "verified") return false;
      if (filterTab === "pending" && student.status !== "pending") return false;
      if (
        filterTab === "banned" &&
        student.status !== "banned" &&
        student.status !== "temp_banned"
      ) {
        return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(query);
        const matchesEmail = student.email.toLowerCase().includes(query);
        const matchesCourse = student.courses.some((c) =>
          c.toLowerCase().includes(query)
        );
        return matchesName || matchesEmail || matchesCourse;
      }

      return true;
    });
  }, [students, filterTab, searchTerm]);

  // Open Notice Modal
  const handleOpenNoticeModal = (student: AdminStudentItem) => {
    setActiveStudent(student);
    setNoticeTitle("");
    setNoticeMessage("");
    setNoticeType("info");
    setIsNoticeModalOpen(true);
  };

  // Open Course Modal
  const handleOpenCourseModal = (student: AdminStudentItem) => {
    setActiveStudent(student);
    setIsCourseModalOpen(true);
  };

  // Open Status Modal
  const handleOpenStatusModal = (student: AdminStudentItem) => {
    setActiveStudent(student);
    setSelectedStatus(
      student.status === "banned" || student.status === "temp_banned"
        ? student.status
        : "active"
    );
    setBanReason(student.banReason || "");
    setTempBanDays(7);
    setIsStatusModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (student: AdminStudentItem) => {
    setActiveStudent(student);
    setIsDeleteModalOpen(true);
  };

  // Submit Notice
  const handleSendNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent || !noticeTitle.trim() || !noticeMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await sendStudentNoticeAction(activeStudent.email, {
        title: noticeTitle.trim(),
        message: noticeMessage.trim(),
        type: noticeType,
      });

      if (res.success && res.notice) {
        setStudents((prev) =>
          prev.map((s) => {
            if (s.email === activeStudent.email) {
              return {
                ...s,
                notices: [res.notice!, ...(s.notices || [])],
              };
            }
            return s;
          })
        );
        setActiveStudent((prev) =>
          prev ? { ...prev, notices: [res.notice!, ...(prev.notices || [])] } : null
        );
        setNoticeTitle("");
        setNoticeMessage("");
        setActionSuccessMsg("Notice sent to student dashboard!");
        setTimeout(() => setActionSuccessMsg(""), 3000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Notice
  const handleDeleteNotice = async (noticeId: string) => {
    if (!activeStudent) return;
    try {
      await deleteStudentNoticeAction(activeStudent.email, noticeId);
      setStudents((prev) =>
        prev.map((s) => {
          if (s.email === activeStudent.email) {
            return {
              ...s,
              notices: (s.notices || []).filter((n) => n.id !== noticeId),
            };
          }
          return s;
        })
      );
      setActiveStudent((prev) =>
        prev
          ? {
              ...prev,
              notices: (prev.notices || []).filter((n) => n.id !== noticeId),
            }
          : null
      );
    } catch {}
  };

  // Toggle Course Access with Instant Reactive UI State
  const handleToggleCourseAccess = async (courseSlug: string, isEnrolled: boolean) => {
    if (!activeStudent) return;
    const email = activeStudent.email;
    const formattedTitle = courseSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    setIsSubmitting(true);

    if (isEnrolled) {
      // 1. Optimistic UI update: Revoke
      const updatedCourses = activeStudent.courses.filter(
        (c) =>
          c.toLowerCase() !== courseSlug.replace(/-/g, " ").toLowerCase() &&
          c.toLowerCase() !== formattedTitle.toLowerCase()
      );
      const updatedCustom = (activeStudent.customEnrolledSlugs || []).filter(
        (slug) => slug !== courseSlug
      );
      const updatedRevoked = Array.from(
        new Set([...(activeStudent.revokedSlugs || []), courseSlug])
      );

      const updatedStudent: AdminStudentItem = {
        ...activeStudent,
        courses: updatedCourses,
        enrolledCount: updatedCourses.length,
        customEnrolledSlugs: updatedCustom,
        revokedSlugs: updatedRevoked,
      };

      // Instantly update active modal state for real-time reactivity
      setActiveStudent(updatedStudent);

      // Instantly update table state
      setStudents((prev) =>
        prev.map((s) => (s.email === email ? updatedStudent : s))
      );

      try {
        await revokeStudentCourseAccessAction(email, courseSlug);
      } catch (err) {
        console.error("Failed to revoke course access:", err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // 2. Optimistic UI update: Grant
      const updatedCourses = activeStudent.courses.includes(formattedTitle)
        ? activeStudent.courses
        : [...activeStudent.courses, formattedTitle];
      const updatedCustom = Array.from(
        new Set([...(activeStudent.customEnrolledSlugs || []), courseSlug])
      );
      const updatedRevoked = (activeStudent.revokedSlugs || []).filter(
        (slug) => slug !== courseSlug
      );

      const updatedStudent: AdminStudentItem = {
        ...activeStudent,
        courses: updatedCourses,
        enrolledCount: updatedCourses.length,
        customEnrolledSlugs: updatedCustom,
        revokedSlugs: updatedRevoked,
      };

      // Instantly update active modal state for real-time reactivity
      setActiveStudent(updatedStudent);

      // Instantly update table state
      setStudents((prev) =>
        prev.map((s) => (s.email === email ? updatedStudent : s))
      );

      try {
        await grantStudentCourseAccessAction(email, courseSlug);
      } catch (err) {
        console.error("Failed to grant course access:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Submit Status Change
  const handleSaveStatus = async () => {
    if (!activeStudent) return;
    setIsSubmitting(true);
    try {
      const res = await updateStudentStatusAction(
        activeStudent.email,
        selectedStatus,
        banReason.trim(),
        selectedStatus === "temp_banned" ? tempBanDays : undefined
      );

      if (res.success) {
        const updatedStatus = selectedStatus === "active" ? (activeStudent.courses.length > 0 ? "verified" : "active") : selectedStatus;
        const updatedStudent: AdminStudentItem = {
          ...activeStudent,
          status: updatedStatus as any,
          banReason: selectedStatus !== "active" ? banReason.trim() : undefined,
          tempBanUntil:
            selectedStatus === "temp_banned"
              ? new Date(Date.now() + tempBanDays * 86400000).toISOString()
              : undefined,
        };

        setActiveStudent(updatedStudent);
        setStudents((prev) =>
          prev.map((s) => (s.email === activeStudent.email ? updatedStudent : s))
        );
        setIsStatusModalOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Student Account
  const handleDeleteAccount = async () => {
    if (!activeStudent) return;
    setIsSubmitting(true);
    try {
      const res = await deleteStudentAccountAction(activeStudent.email);
      if (res.success) {
        setStudents((prev) => prev.filter((s) => s.email !== activeStudent.email));
        setIsDeleteModalOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Total Learners</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {totalLearners}
          </div>
          <p className="text-[11px] text-gray-500 font-mono">Live registered students</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Verified Enrolled</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            {verifiedCount}
          </div>
          <p className="text-[11px] text-gray-500 font-mono">
            {pendingCount} pending payment
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Suspended / Banned</span>
            <ShieldX className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-extrabold text-red-400">
            {bannedCount}
          </div>
          <p className="text-[11px] text-gray-500 font-mono">Access restricted accounts</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Total Gross Revenue</span>
            <CreditCard className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-400">
            ৳{totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-gray-500 font-mono">Approved student payments</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterTab("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterTab === "all"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-white/[0.03] text-gray-400 hover:text-white border border-white/5"
            }`}
          >
            All Students ({totalLearners})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("verified")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterTab === "verified"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "bg-white/[0.03] text-gray-400 hover:text-white border border-white/5"
            }`}
          >
            Verified Access ({verifiedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("pending")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterTab === "pending"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                : "bg-white/[0.03] text-gray-400 hover:text-white border border-white/5"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("banned")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterTab === "banned"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "bg-white/[0.03] text-gray-400 hover:text-white border border-white/5"
            }`}
          >
            Banned ({bannedCount})
          </button>
        </div>

        {/* Instant Search Bar */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, email, or course..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/5 text-gray-400">
              <tr>
                <th className="p-4 font-semibold">Student Profile</th>
                <th className="p-4 font-semibold">Email & Phone</th>
                <th className="p-4 font-semibold">Enrolled Masterclasses</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Notices</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No students found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isBanned = student.status === "banned";
                  const isTempBanned = student.status === "temp_banned";

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isBanned ? "bg-red-500/[0.03]" : isTempBanned ? "bg-amber-500/[0.03]" : ""
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 border ${
                              isBanned
                                ? "bg-red-500/20 border-red-500/40 text-red-400"
                                : isTempBanned
                                ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                                : "bg-blue-600/20 border-blue-500/30 text-blue-400"
                            }`}
                          >
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{student.name}</span>
                              {isBanned && (
                                <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[9px] font-bold">
                                  BANNED
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-gray-500">
                              #{student.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-mono text-gray-300">
                          {student.email}
                        </div>
                        {student.phone ? (
                          <div className="text-[10px] font-mono text-gray-500">
                            {student.phone}
                          </div>
                        ) : null}
                      </td>

                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold text-[10px]">
                              <BookOpen className="w-3 h-3" />
                              <span>
                                {student.enrolledCount} Course
                                {student.enrolledCount !== 1 ? "s" : ""}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenCourseModal(student)}
                              className="text-[10px] text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
                            >
                              Manage Access
                            </button>
                          </div>
                          <div className="text-[11px] text-gray-400 truncate max-w-xs">
                            {student.courses.join(", ") || "No courses enrolled"}
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => handleOpenStatusModal(student)}
                          className="cursor-pointer group flex items-center gap-1"
                          title="Click to change account status"
                        >
                          {isBanned ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-semibold group-hover:bg-red-500/20 transition-colors">
                              <Ban className="w-3 h-3" />
                              <span>Permanently Banned</span>
                            </span>
                          ) : isTempBanned ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-semibold group-hover:bg-amber-500/20 transition-colors">
                              <Clock className="w-3 h-3" />
                              <span>Temp Banned</span>
                            </span>
                          ) : student.status === "verified" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold group-hover:bg-emerald-500/20 transition-colors">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verified Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-semibold group-hover:bg-blue-500/20 transition-colors">
                              <UserCheck className="w-3 h-3" />
                              <span>Active</span>
                            </span>
                          )}
                        </button>
                        {student.banReason && (
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5 max-w-[150px] truncate">
                            {student.banReason}
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => handleOpenNoticeModal(student)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer text-[10px] font-medium"
                        >
                          <BellRing className="w-3 h-3 text-blue-400" />
                          <span>
                            {student.notices?.length || 0} Notice
                            {(student.notices?.length || 0) !== 1 ? "s" : ""}
                          </span>
                        </button>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenNoticeModal(student)}
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors cursor-pointer"
                            title="Send notice/alert to student dashboard"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenCourseModal(student)}
                            className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 transition-colors cursor-pointer"
                            title="Grant/Revoke masterclasses"
                          >
                            <GraduationCap className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenStatusModal(student)}
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-colors cursor-pointer"
                            title="Change account status"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(student)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                            title="Delete student account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. SEND NOTICE / ALERT MODAL */}
      {isNoticeModalOpen && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#0c1017] border border-white/10 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Send Direct Admin Notice</h3>
                  <p className="text-xs text-gray-400">Target: {activeStudent.name} ({activeStudent.email})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNoticeModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSendNotice} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Notice Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["info", "warning", "alert", "success"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNoticeType(t)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                        noticeType === t
                          ? t === "alert"
                            ? "bg-red-500/20 border-red-500/50 text-red-400"
                            : t === "warning"
                            ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                            : t === "success"
                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                            : "bg-blue-500/20 border-blue-500/50 text-blue-400"
                          : "bg-white/[0.02] border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Notice Title</label>
                <input
                  type="text"
                  required
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Action Required: Update bKash Payment Details"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Notice Message</label>
                <textarea
                  required
                  rows={3}
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  placeholder="Enter the message that will display as a prominent alert banner on the student's dashboard..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !noticeTitle.trim() || !noticeMessage.trim()}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Dispatch Notice to Student Dashboard</span>
                  </>
                )}
              </button>
            </form>

            {/* Active Notices List */}
            {activeStudent.notices && activeStudent.notices.length > 0 && (
              <div className="pt-4 border-t border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-gray-300">
                  Active Notices ({activeStudent.notices.length})
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                  {activeStudent.notices.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span className="uppercase text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                            {n.type}
                          </span>
                          <span>{n.title}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteNotice(n.id)}
                        className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                        title="Delete notice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. MANAGE COURSE ACCESS MODAL */}
      {isCourseModalOpen && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-[#0c1017] border border-white/10 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Course Access Entitlements</h3>
                  <p className="text-xs text-gray-400">Student: {activeStudent.name} ({activeStudent.email})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCourseModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Grant or revoke access to individual masterclasses instantly. Changes take effect on the student dashboard immediately.
            </p>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {availableCourses.map((course) => {
                const isEnrolled =
                  activeStudent.courses.some(
                    (c) =>
                      c.toLowerCase() === course.title.toLowerCase() ||
                      c.toLowerCase().includes(course.slug.replace(/-/g, " ").toLowerCase())
                  ) ||
                  activeStudent.customEnrolledSlugs.includes(course.slug);

                const isExplicitlyRevoked = activeStudent.revokedSlugs.includes(course.slug);

                return (
                  <div
                    key={course.slug}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        {course.title}
                      </h4>
                      <p className="text-[10px] font-mono text-gray-500">
                        Slug: {course.slug}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleToggleCourseAccess(course.slug, isEnrolled && !isExplicitlyRevoked)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isEnrolled && !isExplicitlyRevoked
                          ? "bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400"
                          : "bg-white/5 border border-white/10 text-gray-300 hover:bg-blue-600 hover:border-blue-500 hover:text-white"
                      }`}
                    >
                      {isEnrolled && !isExplicitlyRevoked ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Access Granted (Revoke)</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Grant Access</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCourseModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CHANGE STATUS MODAL */}
      {isStatusModalOpen && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#0c1017] border border-white/10 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Manage Account Status</h3>
                  <p className="text-xs text-gray-400">User: {activeStudent.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Select Status</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStatus("active")}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedStatus === "active"
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                        : "bg-white/[0.02] border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    🟢 Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStatus("temp_banned")}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedStatus === "temp_banned"
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                        : "bg-white/[0.02] border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    🟡 Temp Ban
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStatus("banned")}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedStatus === "banned"
                        ? "bg-red-500/20 border-red-500/50 text-red-400"
                        : "bg-white/[0.02] border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    🔴 Permanent Ban
                  </button>
                </div>
              </div>

              {selectedStatus === "temp_banned" && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label className="text-xs font-semibold text-gray-300">Ban Duration (Days)</label>
                  <select
                    value={tempBanDays}
                    onChange={(e) => setTempBanDays(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value={3}>3 Days</option>
                    <option value={7}>7 Days (1 Week)</option>
                    <option value={14}>14 Days (2 Weeks)</option>
                    <option value={30}>30 Days (1 Month)</option>
                    <option value={90}>90 Days (3 Months)</option>
                  </select>
                </div>
              )}

              {selectedStatus !== "active" && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label className="text-xs font-semibold text-gray-300">Reason for Suspension</label>
                  <input
                    type="text"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="e.g. Account sharing / Fake payment details"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSaveStatus}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Save Status</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. DELETE ACCOUNT CONFIRMATION MODAL */}
      {isDeleteModalOpen && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#0c1017] border border-red-500/30 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Permanently Delete Account?</h3>
                <p className="text-xs text-red-300/80">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-white">{activeStudent.name}</strong> ({activeStudent.email})?
              All enrolled course entitlements, progress records, and customer metadata will be completely erased from the database.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteAccount}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete User Account</span>
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
