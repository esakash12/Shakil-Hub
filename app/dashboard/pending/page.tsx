import React from "react";
import type { Metadata } from "next";
import { Clock, ShieldCheck, ShoppingBag } from "lucide-react";
import { getAllStudentOrdersAction } from "@/lib/actions/student";
import StudentOrdersList from "@/components/dashboard/StudentOrdersList";

export const metadata: Metadata = {
  title: "Pending Orders | Student Dashboard | Sakil Hub",
  description: "Track your pending bKash & Nagad course payment verifications and enrollments.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StudentPendingOrdersPage() {
  const orders = await getAllStudentOrdersAction();

  const pendingCount = orders.filter(
    (o) =>
      o.status === "pending_verification" ||
      (o.status as any) === "pending" ||
      (o.status as any) === "processing"
  ).length;

  const approvedCount = orders.filter((o) => o.status === "approved").length;

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Payment & Verification Status</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Pending Orders & Enrollments
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-normal">
            Track manual bKash & Nagad mobile payment verifications for your course enrollments in real-time.
          </p>
        </div>

        {/* Quick KPI Stat Pills */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono">
            <span className="text-[10px] text-gray-400 block uppercase">Awaiting Action</span>
            <span className="text-sm font-bold">{pendingCount} Under Review</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
            <span className="text-[10px] text-gray-400 block uppercase">Active Courses</span>
            <span className="text-sm font-bold">{approvedCount} Approved</span>
          </div>
        </div>
      </div>

      {/* Interactive Orders List */}
      <StudentOrdersList orders={orders} />
    </div>
  );
}
