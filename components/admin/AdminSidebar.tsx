"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  CreditCard,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Play,
  Award,
  ShoppingBag,
} from "lucide-react";
import { adminLogoutAction } from "@/lib/actions/admin-auth";

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Enrollments",
      href: "/admin/enrollments",
      icon: CreditCard,
      exact: false,
    },
    {
      label: "Masterclasses",
      href: "/admin/courses",
      icon: GraduationCap,
      exact: false,
    },
    {
      label: "Digital Shop",
      href: "/admin/shop",
      icon: ShoppingBag,
      exact: false,
    },
    {
      label: "Instructors",
      href: "/admin/instructors",
      icon: Award,
      exact: false,
    },
    {
      label: "Students",
      href: "/admin/students",
      icon: Users,
      exact: false,
    },
    {
      label: "Platform Settings",
      href: "/admin/settings",
      icon: Settings,
      exact: false,
    },
  ];

  const isActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside className="w-64 bg-[#080808] border-r border-white/5 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-white tracking-tight leading-none">
              Sakil<span className="text-blue-500">Hub</span>
            </div>
            <div className="text-[10px] font-mono text-gray-500 font-semibold mt-0.5 uppercase tracking-wider">
              Admin Console
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-inner"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-blue-400" : "text-gray-500"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-white/5 space-y-3">
        {/* Storefront Link */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Storefront Live</span>
          </span>
          <span className="text-[10px] font-mono text-emerald-400">● 200 OK</span>
        </Link>

        {/* Admin User Info */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                Admin Console
              </div>
              <div className="text-[10px] text-gray-500 font-mono truncate">
                admin@sakilhub.com
              </div>
            </div>
          </div>

          <form action={adminLogoutAction}>
            <button
              type="submit"
              title="Logout"
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
