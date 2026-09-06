"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  AlertCircle,
  Copy,
  Check,
  Search,
  ExternalLink,
  MessageCircle,
  ShoppingBag,
} from "lucide-react";
import { PendingStudentOrder } from "@/lib/actions/student";

interface StudentOrdersListProps {
  orders: PendingStudentOrder[];
}

export default function StudentOrdersList({ orders }: StudentOrdersListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const handleCopyTrx = (trxId: string, id: string) => {
    navigator.clipboard.writeText(trxId);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pendingCount = orders.filter(
    (o) =>
      o.status === "pending_verification" ||
      (o.status as any) === "pending" ||
      (o.status as any) === "processing"
  ).length;

  const approvedCount = orders.filter((o) => o.status === "approved").length;
  const rejectedCount = orders.filter((o) => o.status === "rejected").length;

  const filteredOrders = orders.filter((order) => {
    // Tab filter
    if (filterTab === "pending") {
      const isPending =
        order.status === "pending_verification" ||
        (order.status as any) === "pending" ||
        (order.status as any) === "processing";
      if (!isPending) return false;
    } else if (filterTab === "approved") {
      if (order.status !== "approved") return false;
    } else if (filterTab === "rejected") {
      if (order.status !== "rejected") return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        order.orderNumber?.toLowerCase().includes(q) ||
        order.courseTitle?.toLowerCase().includes(q) ||
        order.trxId?.toLowerCase().includes(q) ||
        order.paymentMethod?.toLowerCase().includes(q) ||
        order.senderNumber?.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterTab("pending")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === "pending"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                : "bg-white/[0.03] text-gray-400 hover:text-white border border-white/5"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending ({pendingCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("approved")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === "approved"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "bg-white/[0.03] text-gray-400 hover:text-white border border-white/5"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved ({approvedCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("rejected")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === "rejected"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "bg-white/[0.03] text-gray-400 hover:text-white border border-white/5"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected ({rejectedCount})</span>
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
            All Orders ({orders.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search TrxID, order #..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => {
            const isPending =
              order.status === "pending_verification" ||
              (order.status as any) === "pending" ||
              (order.status as any) === "processing";
            const isApproved = order.status === "approved";
            const isRejected = order.status === "rejected";

            const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={order.id}
                className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 space-y-4 backdrop-blur-md transition-all ${
                  isPending
                    ? "bg-gradient-to-r from-amber-500/5 via-white/[0.02] to-transparent border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.05)]"
                    : isApproved
                    ? "bg-gradient-to-r from-emerald-500/5 via-white/[0.02] to-transparent border border-emerald-500/20"
                    : "bg-gradient-to-r from-red-500/5 via-white/[0.02] to-transparent border border-red-500/20"
                }`}
              >
                {/* Top Row: Course Thumbnail, Title, Order Info & Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                      {order.courseThumbnail ? (
                        <Image
                          src={order.courseThumbnail}
                          alt={order.courseTitle}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-600/20 text-blue-400">
                          <Play className="w-5 h-5 fill-current" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            isPending
                              ? "text-amber-400"
                              : isApproved
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {isPending
                            ? "Manual Payment Verification"
                            : isApproved
                            ? "Enrollment Verified"
                            : "Payment Rejected"}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                        {order.courseTitle}
                      </h3>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        Order #{order.orderNumber} • {formattedDate}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    {isPending && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>Awaiting Verification</span>
                      </div>
                    )}
                    {isApproved && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Access Granted</span>
                      </div>
                    )}
                    {isRejected && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Rejected</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Breakdown Pill Box */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 sm:p-4 rounded-xl bg-black/40 border border-white/5 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-medium">
                      Payment Gateway
                    </span>
                    <span className="font-semibold text-white capitalize">
                      {order.paymentMethod}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-medium">
                      Amount Paid
                    </span>
                    <span className="font-semibold text-emerald-400 font-mono">
                      ৳{order.amount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-medium">
                      Transaction ID (TrxID)
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-cyan-300 font-bold text-xs select-all">
                        {order.trxId}
                      </span>
                      {order.trxId && order.trxId !== "N/A" && (
                        <button
                          type="button"
                          onClick={() => handleCopyTrx(order.trxId, order.id)}
                          title="Copy TrxID"
                          className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedId === order.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-medium">
                      Sender Number
                    </span>
                    <span className="font-mono text-gray-300 text-xs">
                      {order.senderNumber || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Progress / Actions / Explanations */}
                {isPending && (
                  <div className="space-y-3 pt-1">
                    {/* Visual 3-Step Verification Pipeline */}
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>1. Order Placed</span>
                      </span>
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span>2. Admin TrxID Review</span>
                      </span>
                      <span className="text-gray-600 font-medium">
                        3. Course Unlocked
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden flex">
                      <div className="w-1/2 h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full" />
                      <div className="w-1/2 h-full bg-white/5" />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                      <div className="flex items-start gap-2 text-[11px] text-gray-400 max-w-xl">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <p>
                          আপনার পেমেন্ট ভেরিফিকেশন চলছে। সাধারণত ১০–৩০ মিনিটের মধ্যে অ্যাডমিন আপনার TrxID মিলিয়ে কোর্সটি আনলক করে দেবেন।
                        </p>
                      </div>

                      <a
                        href={`https://wa.me/8801700000000?text=Hi%20Sakil%20Hub,%20I%20have%20submitted%20order%20%23${order.orderNumber}%20with%20TrxID%20${order.trxId}.%20Please%20verify.`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors self-start sm:self-auto shrink-0"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Support</span>
                      </a>
                    </div>
                  </div>
                )}

                {isApproved && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <p className="text-xs text-emerald-400/90 font-medium">
                      ✓ Your payment was successfully verified and course access is fully unlocked!
                    </p>
                    <Link
                      href={order.courseSlug ? `/dashboard/courses/${order.courseSlug}/learn` : "/dashboard/courses"}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Learning Now</span>
                    </Link>
                  </div>
                )}

                {isRejected && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <p className="text-xs text-red-400 font-medium">
                      ✕ Reason: {order.rejectionReason || "Invalid or unverifiable Transaction ID."}
                    </p>
                    <a
                      href="https://wa.me/8801700000000?text=Hi%20Sakil%20Hub,%20my%20payment%20verification%20was%20rejected.%20Please%20help."
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold transition-colors self-start sm:self-auto shrink-0"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Contact Support</span>
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-white">
              {filterTab === "pending"
                ? "No Pending Orders"
                : filterTab === "approved"
                ? "No Approved Orders"
                : filterTab === "rejected"
                ? "No Rejected Orders"
                : "No Orders Found"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto">
              {filterTab === "pending"
                ? "You currently have no pending payment verifications awaiting review."
                : "Explore our professional video editing and filmmaking masterclasses to start learning."}
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Masterclasses</span>
          </Link>
        </div>
      )}
    </div>
  );
}
