"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Play, LayoutDashboard } from "lucide-react";
import { getCustomerAction } from "@/lib/actions/auth";
import { getPlatformBrandingAction } from "@/lib/actions/branding";
import { PlatformBrandingSettings, DEFAULT_BRANDING } from "@/lib/data/branding-types";

export default function Navbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [branding, setBranding] = useState<PlatformBrandingSettings>(DEFAULT_BRANDING);

  useEffect(() => {
    let isMounted = true;
    async function checkAuthAndBranding() {
      try {
        const [auth, brandData] = await Promise.all([
          getCustomerAction(),
          getPlatformBrandingAction(),
        ]);
        if (isMounted) {
          setIsLoggedIn(auth.isAuthenticated);
          if (brandData) setBranding(brandData);
        }
      } catch {}
    }
    checkAuthAndBranding();
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/", exact: true },
    { name: "Courses", href: "/courses", exact: false },
    { name: "Shop", href: "/shop", exact: false },
    { name: "Instructors", href: "/instructors", exact: false },
    { name: "About", href: "/about", exact: false },
  ];

  const isLinkActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#07090e]/85 backdrop-blur-xl shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group">
            {branding.logoUrl ? (
              <div className="relative h-7 sm:h-8 w-28 sm:w-36 overflow-hidden">
                <Image
                  src={branding.logoUrl}
                  alt={branding.siteName || "Sakil Hub"}
                  fill
                  sizes="(max-width: 640px) 112px, 144px"
                  className="object-contain object-left group-hover:scale-105 transition-transform"
                />
              </div>
            ) : (
              <>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black fill-black ml-0.5" />
                </div>
                <span className="text-base sm:text-lg font-bold tracking-tight text-white">
                  {branding.siteName ? (
                    branding.siteName
                  ) : (
                    <>
                      Sakil<span className="text-cyan-400">Hub</span>
                    </>
                  )}
                </span>
              </>
            )}
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href, link.exact);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-all duration-200 ${
                    active
                      ? "text-cyan-400 font-semibold drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                      : "text-gray-400 hover:text-white hover:drop-shadow-sm"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action - Dashboard / Login Button */}
          <div className="flex items-center">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center gap-1.5 transition-all active:scale-95 border border-cyan-300/40"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center gap-1.5 transition-all active:scale-95 border border-cyan-300/40"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
