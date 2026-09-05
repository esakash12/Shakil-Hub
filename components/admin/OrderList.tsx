"use client";

import React, { useState, useTransition } from "react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Copy,
  Check,
  Check as CheckIcon,
  X as XIcon,
  Loader2,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Filter,
  RefreshCw,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  AdminOrderRecord,
  approveOrderAction,
  rejectOrderAction,
  deleteAdminOrderAction,
} from "@/lib/actions/admin-orders";

interface OrderListProps {
  initialOrders: AdminOrderRecord[];
}

export default function OrderList({ initialOrders }: OrderListProps) {
  const [orders, setOrders] = useState<AdminOrderRecord[]>(initialOrders);
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Delete modal state
  const [deleteModalOrder, setDeleteModalOrder] = useState<AdminOrderRecord | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopyTrx = (trxId: string, id: string) => {
    navigator.clipboard.writeText(trxId);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApprove = async (orderId: string) => {
    setActionLoadingId(orderId);
    try {
      const res = await approveOrderAction(orderId);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "approved" } : o))
        );
        showToast(res.message || `Order #${orderId} approved successfully!`);
      } else {
        showToast(res.error || "Failed to approve order.", "error");
      }
    } catch {
      showToast("Network error approving order.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (orderId: string) => {
    setActionLoadingId(orderId);
    try {
      const res = await rejectOrderAction(orderId);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "rejected" } : o))
        );
        showToast(res.message || `Order #${orderId} rejected.`);
      } else {
        showToast(res.error || "Failed to reject order.", "error");
      }
    } catch {
      showToast("Network error rejecting order.", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Hard Delete Modal
  const handleOpenDeleteModal = (order: AdminOrderRecord) => {
    setDeleteModalOrder(order);
    setDeleteConfirmText("");
  };

  // Execute Hard Delete
  const handleExecuteDelete = async () => {
    if (!deleteModalOrder) return;
    setIsDeleting(true);
    try {
      const res = await deleteAdminOrderAction(deleteModalOrder.id);
      if (res.success) {
        setOrders((prev) => prev.filter((o) => o.id !== deleteModalOrder.id));
        showToast(res.message || `Order #${deleteModalOrder.id} permanently deleted.`);
        setDeleteModalOrder(null);
      } else {
        showToast(res.error || "Failed to delete order.", "error");
      }
    } catch {
      showToast("Network error deleting order.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    // 1. Status Tab filter
    if (filterTab === "pending" && order.status !== "pending_verification") return false;
    if (filterTab === "approved" && order.status !== "approved") return false;
    if (filterTab === "rejected" && order.status !== "rejected") return false;

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        order.orderNumber.toLowerCase().includes(q) ||
        order.studentName.toLowerCase().includes(q) ||
        order.email.toLowerCase().includes(q) ||
        order.courseTitle.toLowerCase().includes(q) ||
        order.trxId.toLowerCase().includes(q) ||
        order.senderNumber.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const totalOrders = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === "pending_verification").length;
  const approvedOrdersCount = orders.filter((o) => o.status === "approved").length;
  const totalApprovedRevenue = orders
    .filter((o) => o.status === "approved")
    .reduce((acc, o) => acc + o.amount, 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-5 duration-200 ${
            toastMessage.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-300"
              : "bg-red-950/90 border-red-500/40 text-red-300"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Total Orders</span>
            <Filter className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {totalOrders}
          </div>
          <p className="text-[11px] text-gray-500 font-mono">All enrollment attempts</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-amber-400">
            <span>Awaiting Verification</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">
            {pendingOrdersCount}
          </div>
          <p className="text-[11px] text-gray-500 font-mono">Requires manual check</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-emerald-400">
            <span>Verified Enrolled</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            {approvedOrdersCount}
          </div>
          <p className="text-[11px] text-gray-500 font-mono">Unlocked active seats</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-purple-400">
            <span>Gross Revenue</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-400">
            ৳{totalApprovedRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-gray-500 font-mono">Total verified collections</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
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
            All Orders ({totalOrders})
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
            Pending Verification ({pendingOrdersCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("approved")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterTab === "approved"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "bg-white/[0.03] text-gray-400 hover:text-white border border-white/5"
            }`}
          >
            Approved ({approvedOrdersCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("rejected")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterTab === "rejected"
                ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                : "bg-white/[0.03] text-gray-400 hover:text-white border border-white/5"
            }`}
          >
            Rejected ({orders.filter((o) => o.status === "rejected").length})
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search TrxID, student, phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/5 text-gray-400">
              <tr>
                <th className="p-4 font-semibold">Order / Date</th>
                <th className="p-4 font-semibold">Student Details</th>
                <th className="p-4 font-semibold">Course Enrolled</th>
                <th className="p-4 font-semibold">Method & Sender</th>
                <th className="p-4 font-semibold">Transaction ID</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((item) => {
                  const isLoadingThis = actionLoadingId === item.id;
                  const isPendingStatus = item.status === "pending_verification";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Order Info */}
                      <td className="p-4">
                        <div className="font-mono font-bold text-white">
                          #{item.orderNumber}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Student Info */}
                      <td className="p-4">
                        <div className="font-semibold text-white">
                          {item.studentName}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono truncate max-w-[160px]">
                          {item.email}
                        </div>
                      </td>

                      {/* Course */}
                      <td className="p-4">
                        <div className="font-medium text-gray-200 line-clamp-1 max-w-[180px]">
                          {item.courseTitle}
                        </div>
                        <span className="text-[10px] text-blue-400 font-mono">
                          {item.courseSlug}
                        </span>
                      </td>

                      {/* Payment Method & Sender Phone */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              item.paymentMethod.toLowerCase() === "bkash"
                                ? "bg-[#D12053]/20 text-[#FF4081] border border-[#D12053]/40"
                                : "bg-[#F7931E]/20 text-[#FFA726] border border-[#F7931E]/40"
                            }`}
                          >
                            {item.paymentMethod}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-gray-400 mt-1 flex items-center gap-1">
                          <Smartphone className="w-3 h-3 text-gray-500" />
                          <span>{item.senderNumber}</span>
                        </div>
                      </td>

                      {/* Transaction ID with 1-Click Copy */}
                      <td className="p-4">
                        <div className="inline-flex items-center gap-1.5 p-1.5 rounded-lg bg-black/60 border border-white/10 font-mono text-xs font-bold text-cyan-300">
                          <span>{item.trxId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyTrx(item.trxId, item.id)}
                            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                            title="Copy Transaction ID"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="p-4 font-mono font-bold text-white text-xs sm:text-sm">
                        ৳{item.amount.toLocaleString()}
                      </td>

                      {/* Status Badge */}
                      <td className="p-4">
                        {item.status === "pending_verification" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                            <Clock className="w-3 h-3 animate-spin" />
                            <span>Pending TrxID</span>
                          </span>
                        )}
                        {item.status === "approved" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Enrolled & Active</span>
                          </span>
                        )}
                        {item.status === "rejected" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold">
                            <XCircle className="w-3 h-3" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>

                      {/* Verification Action Buttons & Hard Delete */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPendingStatus ? (
                            <>
                              <button
                                type="button"
                                disabled={isLoadingThis}
                                onClick={() => handleApprove(item.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center gap-1 shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                                title="Verify TrxID and Unlock Course for Student"
                              >
                                {isLoadingThis ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CheckIcon className="w-3 h-3" />
                                )}
                                <span>Approve</span>
                              </button>

                              <button
                                type="button"
                                disabled={isLoadingThis}
                                onClick={() => handleReject(item.id)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/30 text-gray-400 hover:text-amber-400 transition-colors disabled:opacity-50 cursor-pointer"
                                title="Reject Fake or Unpaid Order"
                              >
                                <XIcon className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-gray-500 font-mono mr-1">
                              {item.status === "approved" ? "Active Seat" : "Declined"}
                            </span>
                          )}

                          {/* Hard Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(item)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                            title="Hard delete order from database"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-500 text-xs">
                    No course orders found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STRICT ORDER DELETE CONFIRMATION MODAL */}
      {deleteModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#0c1017] border border-red-500/30 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Permanently Delete Order?</h3>
                <p className="text-xs text-red-300/80">Hard Database Wipe</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs text-gray-300 font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID:</span>
                <span className="text-white font-bold">#{deleteModalOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Student:</span>
                <span className="text-white">{deleteModalOrder.studentName} ({deleteModalOrder.email})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Course:</span>
                <span className="text-cyan-400">{deleteModalOrder.courseTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="text-emerald-400 font-bold">৳{deleteModalOrder.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="uppercase text-amber-400">{deleteModalOrder.status}</span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              This will completely eradicate this transaction record from the database and deduct the revenue. If access was granted, it will be immediately revoked from the student&apos;s dashboard.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-400">
                Type <strong className="text-red-400 font-mono">DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteModalOrder(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting || deleteConfirmText.trim() !== "DELETE"}
                onClick={handleExecuteDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-red-600/30"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Wipe Order</span>
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
