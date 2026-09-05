import React from "react";
import { Clock } from "lucide-react";
import { fetchAdminOrders } from "@/lib/actions/admin-orders";
import OrderList from "@/components/admin/OrderList";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPendingOrdersPage() {
  const { orders } = await fetchAdminOrders();

  const pendingOrders = orders.filter((o) => o.status === "pending_verification");
  const pendingCount = pendingOrders.length;
  const pendingVolume = pendingOrders.reduce((acc, o) => acc + o.amount, 0);

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Sector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Approvals Sector</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Pending Orders Queue
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-normal">
            Review incoming bKash and Nagad mobile payments awaiting manual verification. Verify TrxIDs and approve student access.
          </p>
        </div>

        {/* Quick KPI Stat Pills */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono">
            <span className="text-[10px] text-gray-400 block uppercase">Awaiting Action</span>
            <span className="text-sm font-bold">{pendingCount} pending</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono">
            <span className="text-[10px] text-gray-400 block uppercase">Pending Volume</span>
            <span className="text-sm font-bold">৳{pendingVolume.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Interactive Orders List focused on Pending Verification */}
      <OrderList initialOrders={orders} initialFilter="pending" pendingOnly={true} />
    </div>
  );
}
