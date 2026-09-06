"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Heart,
  Award,
  Settings,
  LogOut,
  User,
  Clock,
} from "lucide-react";
import { logoutAction, CustomerProfile } from "@/lib/actions/auth";

interface DashboardSidebarProps {
  initialProfile?: CustomerProfile | null;
  initialPendingCount?: number;
}

export default function DashboardSidebar({
  initialProfile,
  initialPendingCount = 0,
}: DashboardSidebarProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(initialProfile || null);

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile?.email, initialProfile?.first_name]);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
    { name: "My Courses", href: "/dashboard/courses", icon: GraduationCap, exact: false },
    { name: "Pending Orders", href: "/dashboard/pending", icon: Clock, exact: false },
    { name: "Wishlist", href: "/dashboard/wishlist", icon: Heart, exact: false },
    { name: "My Certificates", href: "/dashboard/certificates", icon: Award, exact: false },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, exact: false },
  ];

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
    router.refresh();
  };

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : "Student";

  const displayEmail = profile?.email || "student@sakilhub.com";

  return (
    <aside className="w-full lg:w-64 shrink-0 rounded-2xl bg-white/[0.02] border border-white/5 p-4 sm:p-5 flex flex-col justify-between h-fit lg:min-h-[calc(100vh-6rem)]">
      <div className="space-y-6">
        {/* User Profile Block */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="relative w-11 h-11 rounded-full overflow-hidden bg-blue-600/20 border border-blue-500/30 shrink-0 flex items-center justify-center text-blue-400">
            {profile?.first_name ? (
              <span className="font-bold text-sm">
                {profile.first_name.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-bold text-white truncate">
              {displayName}
            </h3>
            <p className="text-[11px] text-gray-400 font-normal truncate">
              {displayEmail}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex lg:flex-col gap-1.5 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
                {item.name === "Pending Orders" && initialPendingCount > 0 && (
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                    {initialPendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="pt-4 border-t border-white/5 mt-4 hidden lg:block">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
