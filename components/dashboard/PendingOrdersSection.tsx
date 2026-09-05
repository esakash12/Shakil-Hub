"use client";

import React from "react";
import Image from "next/image";
import { Clock, CheckCircle2, Play, AlertCircle } from "lucide-react";
import { PendingStudentOrder } from "@/lib/actions/student";

interface PendingOrdersSectionProps {
  orders: PendingStudentOrder[];
}

export default function PendingOrdersSection({ orders }: PendingOrdersSectionProps) {
  if (!orders || orders.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Pending Verifications</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
              {orders.length} Under Review
            </span>
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {orders.map((order) => {
          const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={order.id}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/5 via-white/[0.02] to-transparent border border-amber-500/30 p-4 sm:p-6 space-y-4 backdrop-blur-md shadow-[0_0_30px_rgba(245,158,11,0.05)]"
            >
              {/* Top Row: Course info & Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                    {order.courseThumbnail ? (
                      <Image
                        src={order.courseThumbnail}
                        alt={order.courseTitle}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-600/20 text-blue-400">
                        <Play className="w-5 h-5 fill-current" />
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      Manual Payment Approval
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight line-clamp-1">
                      {order.courseTitle}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono">
                      Order #{order.orderNumber} • {formattedDate}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold self-start sm:self-auto shrink-0">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying Payment</span>
                </div>
              </div>

              {/* Payment Details Pill Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-medium">Gateway</span>
                  <span className="font-semibold text-white capitalize">{order.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-medium">Amount</span>
                  <span className="font-semibold text-emerald-400">৳{order.amount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-medium">TrxID</span>
                  <span className="font-mono text-cyan-300 font-bold text-[11px] select-all">
                    {order.trxId}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-medium">Sender No.</span>
                  <span className="font-mono text-gray-300 text-[11px]">
                    {order.senderNumber || "N/A"}
                  </span>
                </div>
              </div>

              {/* Live Verification Timeline */}
              <div className="pt-1">
                <div className="flex items-center justify-between text-[11px] text-gray-400 pb-2">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>1. Order Placed</span>
                  </span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>2. Admin TrxID Review</span>
                  </span>
                  <span className="text-gray-600 font-medium">
                    3. Seat Unlocked
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden flex">
                  <div className="w-1/2 h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full" />
                  <div className="w-1/2 h-full bg-white/5" />
                </div>
              </div>

              {/* Helper Notice */}
              <div className="flex items-start gap-2 pt-1 text-[11px] text-gray-400">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  Our admissions team manually verifies manual bKash/Nagad transactions within 15–30 minutes. Once approved, this course will automatically appear in your active enrolled courses!
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
