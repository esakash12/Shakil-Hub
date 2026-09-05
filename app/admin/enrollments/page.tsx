import React from "react";
import { Sparkles, ShieldCheck } from "lucide-react";
import { fetchAdminOrders } from "@/lib/actions/admin-orders";
import OrderList from "@/components/admin/OrderList";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminEnrollmentsPage() {
  const { orders } = await fetchAdminOrders();

  const pendingCount = orders.filter((o) => o.status === "pending_verification").length;
  const approvedCount = orders.filter((o) => o.status === "approved").length;
  const totalVolume = orders
    .filter((o) => o.status === "approved")
    .reduce((acc, o) => acc + o.amount, 0);

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>Medusa v2 Order Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Order & TrxID Verification
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-normal">
            Review incoming bKash/Nagad mobile transfers, verify Transaction IDs, and grant masterclass access.
          </p>
        </div>

        {/* Quick KPI Stat Pills */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono">
            <span className="text-[10px] text-gray-400 block uppercase">Pending</span>
            <span className="text-sm font-bold">{pendingCount} orders</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
            <span className="text-[10px] text-gray-400 block uppercase">Verified Volume</span>
            <span className="text-sm font-bold">৳{totalVolume.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Interactive Orders List Table */}
      <OrderList initialOrders={orders} />
    </div>
  );
}
