"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Play, LayoutDashboard, Menu, X } from "lucide-react";
import { getCustomerAction } from "@/lib/actions/auth";
import { getPlatformBrandingAction } from "@/lib/actions/branding";
import { PlatformBrandingSettings, DEFAULT_BRANDING } from "@/lib/data/branding-types";

export default function Navbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [branding, setBranding] = useState<PlatformBrandingSettings>(DEFAULT_BRANDING);

  useEffect(() => {
    let isMounted = true;
    setIsMobileMenuOpen(false);
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
    { name: "Portfolio", href: "/#portfolio", exact: false },
    { name: "Courses", href: "/courses", exact: false },
    { name: "Shop", href: "/shop", exact: false },
    { name: "Contact", href: "/#contact", exact: false },
  ];

  const isLinkActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#02050e]/90 backdrop-blur-2xl shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand Logo - Stylized SH Play Logo */}
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
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00d2ff] via-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,210,255,0.4)] group-hover:scale-105 transition-transform">
                  <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                </div>
                <div className="flex items-baseline">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                    Sakil<span className="text-[#00d2ff]">Hub</span>
                  </span>
                </div>
              </div>
            )}
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href, link.exact);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs lg:text-sm font-medium transition-all duration-200 ${
                    active
                      ? "text-[#00d2ff] font-bold drop-shadow-[0_0_10px_rgba(0,210,255,0.5)]"
                      : "text-zinc-400 hover:text-white hover:drop-shadow-sm"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action - Dashboard / Login Button & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-4 sm:px-5 py-2 rounded-full bg-[#00d2ff] hover:bg-[#00b8e6] text-black text-xs font-black shadow-[0_0_20px_rgba(0,210,255,0.4)] flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 sm:px-5 py-2 rounded-full bg-[#00d2ff] hover:bg-[#00b8e6] text-black text-xs font-black shadow-[0_0_20px_rgba(0,210,255,0.4)] flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Log In</span>
              </Link>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-[#02050e]/98 backdrop-blur-2xl px-4 py-3 space-y-1 shadow-2xl">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href, link.exact);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-[#00d2ff]/10 text-[#00d2ff] font-bold"
                    : "text-zinc-300 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
