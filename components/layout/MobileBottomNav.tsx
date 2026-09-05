"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlaySquare, Users, ShoppingBag, Info } from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const tabs = [
    { id: "home", name: "Home", href: "/", icon: Home, exact: true },
    { id: "courses", name: "Courses", href: "/courses", icon: PlaySquare, exact: false },
    { id: "shop", name: "Shop", href: "/shop", icon: ShoppingBag, exact: false },
    { id: "instructors", name: "Instructors", href: "/instructors", icon: Users, exact: false },
    { id: "about", name: "About", href: "/about", icon: Info, exact: false },
  ];

  const isTabActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#07090e]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 shadow-[0_-10px_35px_rgba(0,0,0,0.85)]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = isTabActive(tab.href, tab.exact);

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    : "text-gray-400"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-semibold">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
