import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCustomerProfile } from "@/lib/actions/auth";
import { getPendingOrdersAction } from "@/lib/actions/student";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export const metadata: Metadata = {
  title: "Student Dashboard | Sakil Hub",
  description: "Manage your enrolled courses, learning progress, certificates and account on Sakil Hub.",
};

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const hasToken = Boolean(
    cookieStore.get("sakil_customer_token")?.value ||
    cookieStore.get("sakil_customer_info")?.value
  );

  const [customer, pendingOrders] = await Promise.all([
    getCustomerProfile(),
    getPendingOrdersAction(),
  ]);

  if (!customer) {
    if (hasToken) {
      redirect("/login?error=account_suspended&logout=true");
    }
    redirect("/login?redirect=/dashboard");
  }

  return (
    <div className="min-h-screen bg-black text-white py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Persistent Left Sidebar with Server-Fetched Profile & Pending Badge */}
          <DashboardSidebar
            initialProfile={customer}
            initialPendingCount={pendingOrders.length}
          />

          {/* Main Content Area */}
          <div className="flex-1 w-full min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
