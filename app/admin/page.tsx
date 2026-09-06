import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  CreditCard,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Plus,
  Settings,
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getLiveStorefrontCourses } from "@/lib/data/courses";
import { fetchAdminOrders, AdminOrderRecord } from "@/lib/actions/admin-orders";
import { fetchAdminStudentsAction } from "@/lib/actions/admin-students";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [liveCourses, ordersResult, studentsResult] = await Promise.all([
    getLiveStorefrontCourses(),
    fetchAdminOrders(),
    fetchAdminStudentsAction(),
  ]);

  const orders: AdminOrderRecord[] = ordersResult?.orders || [];
  const students = studentsResult?.students || [];

  // Aggregate live metrics
  const distinctStudents = new Set(
    orders.map((o) => (o.email ? o.email.toLowerCase().trim() : "")).filter(Boolean)
  ).size;

  const totalRevenue = orders
    .filter((o) => o.status === "approved")
    .reduce((acc, o) => acc + (Number(o.amount) || 0), 0);

  const pendingVerificationCount = orders.filter(
    (o) => o.status === "pending_verification"
  ).length;

  const backendUrl =
    process.env.MEDUSA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    "http://localhost:9000";

  // Real-time API Gateway Health & Latency Telemetry Check
  let gatewayStatus = "Standalone";
  let gatewayLatency = "Local Mode Active";
  let isGatewayOnline = false;

  try {
    const startPing = Date.now();
    const pingRes = await fetch(`${backendUrl}/store/products?limit=1`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    }).catch(() => null);

    const elapsed = Date.now() - startPing;

    if (pingRes && pingRes.status < 500) {
      gatewayStatus = "100% Online";
      gatewayLatency = `${elapsed}ms (Medusa Engine)`;
      isGatewayOnline = true;
    } else {
      gatewayStatus = "Standalone";
      gatewayLatency = "Local Fallback Active";
    }
  } catch {
    gatewayStatus = "Standalone";
    gatewayLatency = "Local Fallback Active";
  }

  const stats = [
    {
      label: "Active Masterclasses",
      value: liveCourses.length.toString(),
      change: liveCourses.length > 0 ? "Live in Database" : "Clean Catalog",
      icon: GraduationCap,
      color: "from-blue-600 to-cyan-500",
    },
    {
      label: "Registered Students",
      value: students.length.toString(),
      change: `${orders.length} total orders`,
      icon: Users,
      color: "from-emerald-600 to-teal-500",
    },
    {
      label: "Verified Revenue",
      value: `৳${totalRevenue.toLocaleString()}`,
      change: pendingVerificationCount > 0 ? `${pendingVerificationCount} pending` : "All verified",
      icon: CreditCard,
      color: "from-purple-600 to-indigo-500",
    },
    {
      label: "API Gateway Status",
      value: gatewayStatus,
      change: gatewayLatency,
      icon: Zap,
      color: isGatewayOnline ? "from-emerald-600 to-teal-500" : "from-amber-600 to-yellow-500",
    },
  ];

  const recentOrders: AdminOrderRecord[] = orders.slice(0, 6);

  return (
    <div className="space-y-8 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>Enterprise Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administrative Command
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-normal">
            Real-time telemetry for masterclasses, live enrollments, and headless commerce.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/settings"
            className="px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white font-medium text-xs flex items-center gap-1.5 transition-all"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Platform Settings</span>
          </Link>
          <Link
            href="/admin/courses/create"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Masterclass</span>
          </Link>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-normal">
                  {stat.label}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${stat.color} flex items-center justify-center text-white shadow-md`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>{stat.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Content: Live Enrollments & Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Enrollments Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Recent Student Enrollments</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                Live Feed ({orders.length})
              </span>
            </h2>
            <Link
              href="/admin/enrollments"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Manage All Orders →
            </Link>
          </div>

          <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.02] border-b border-white/5 text-gray-400">
                  <tr>
                    <th className="p-3.5 font-semibold">Ref #</th>
                    <th className="p-3.5 font-semibold">Student</th>
                    <th className="p-3.5 font-semibold">Masterclass</th>
                    <th className="p-3.5 font-semibold">Amount</th>
                    <th className="p-3.5 font-semibold">Method / TrxID</th>
                    <th className="p-3.5 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        No orders recorded yet. Prospective students will appear here in real-time.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="p-3.5 font-mono text-blue-400 font-semibold">
                          #{item.orderNumber || item.id}
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-white">{item.studentName}</div>
                          <div className="text-[10px] text-gray-500">{item.email}</div>
                        </td>
                        <td className="p-3.5 text-gray-300 font-medium max-w-[240px] 2xl:max-w-md truncate">
                          {item.courseTitle}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-white">
                          ৳{Number(item.amount).toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <div className="text-[11px] text-gray-300 font-medium uppercase">
                            {item.paymentMethod}
                          </div>
                          <div className="font-mono text-[10px] text-cyan-400 font-semibold">
                            {item.trxId}
                          </div>
                        </td>
                        <td className="p-3.5">
                          {item.status === "approved" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Approved</span>
                            </span>
                          ) : item.status === "rejected" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-semibold">
                              <XCircle className="w-3 h-3" />
                              <span>Rejected</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold">
                              <Clock className="w-3 h-3" />
                              <span>Pending</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Platform Quick Overview */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Courses Widget */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <span>Live Masterclasses ({liveCourses.length})</span>
              </h3>
              <Link
                href="/admin/courses"
                className="text-[11px] text-blue-400 hover:text-blue-300"
              >
                View Catalog →
              </Link>
            </div>

            <div className="space-y-2.5">
              {liveCourses.length === 0 ? (
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center text-xs text-gray-400">
                  No courses published yet.
                </div>
              ) : (
                liveCourses.map((course) => (
                  <Link
                    key={course.slug}
                    href={`/courses/${course.slug}`}
                    target="_blank"
                    className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-blue-500/30 flex items-center justify-between gap-3 text-xs transition-colors group"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-white group-hover:text-blue-400 transition-colors truncate">
                        {course.title}
                      </div>
                      <div className="text-[10px] text-gray-500 font-normal">
                        By {course.instructor.name}
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white shrink-0" />
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* System Health Card */}
          <div className="rounded-2xl bg-blue-600/5 border border-blue-500/15 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Headless Architecture Status</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed font-normal">
              Next.js 16 (App Router) is actively connected to the Medusa v2 headless engine. Automatic digital fulfillment is operational.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
