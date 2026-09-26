"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Play, LayoutDashboard, Menu, X } from "lucide-react";
import { getCustomerAction } from "@/lib/actions/auth";
import { PlatformBrandingSettings, DEFAULT_BRANDING } from "@/lib/data/branding-types";

export default function Navbar({
  branding = DEFAULT_BRANDING,
}: {
  branding?: PlatformBrandingSettings;
}) {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsMobileMenuOpen(false);
    async function checkAuth() {
      try {
        const auth = await getCustomerAction();
        if (isMounted) {
          setIsLoggedIn(auth.isAuthenticated);
        }
      } catch {}
    }
    checkAuth();
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
    <>
      {/* Top Announcement Ribbon - Scrolls away naturally and smoothly collapses past 40px */}
      {branding.announcement && (
        <div
          className={`w-full bg-gradient-to-r from-cyan-950/95 via-[#00334e]/90 to-blue-950/95 border-b border-cyan-500/20 px-4 text-center text-[11px] sm:text-xs text-cyan-200 font-medium tracking-wide shadow-sm transition-all duration-300 relative z-30 ${
            isScrolled
              ? "max-h-0 py-0 opacity-0 overflow-hidden -translate-y-2 pointer-events-none"
              : "max-h-12 py-1.5 opacity-100 translate-y-0"
          }`}
        >
          <span>{branding.announcement}</span>
        </div>
      )}

      {/* Sticky Floating Island Navigation Container */}
      <header className="sticky top-0 z-40 w-full pointer-events-none">
        {/* Subtle Top Gradient Backdrop Mask (Softly dissolves scrolling content before reaching the top gap) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-4 inset-x-0 h-20 sm:h-24 bg-gradient-to-b from-[#02050e] via-[#02050e]/90 to-transparent -z-10"
        />

        {/* Floating Island Navigation Container */}
        <div
          className={`px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto transition-all duration-300 ${
            isScrolled ? "pt-1.5 sm:pt-2" : "pt-2 sm:pt-3"
          }`}
        >
          <div className="pointer-events-auto rounded-2xl md:rounded-full border border-white/[0.1] bg-[#02050e]/85 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.65),0_0_20px_rgba(0,210,255,0.06)] px-4 sm:px-6 transition-all duration-300">
          <div className="flex items-center justify-between h-13 sm:h-14">
            {/* Brand Logo - Sakil Hub */}
            <Link href="/" className="flex items-center gap-2 group">
              {branding.logoUrl ? (
                <div className="relative h-7 sm:h-8 w-28 sm:w-32 overflow-hidden rounded-md">
                  <Image
                    src={branding.logoUrl}
                    alt={branding.siteName || "Sakil Hub"}
                    fill
                    unoptimized={Boolean(
                      branding.logoUrl?.startsWith("/api/r2/") ||
                        branding.logoUrl?.includes("r2.cloudflarestorage.com")
                    )}
                    sizes="(max-width: 640px) 112px, 128px"
                    className="object-contain object-left group-hover:scale-105 transition-transform"
                    priority
                  />
                </div>
              ) : (
                <div className="flex items-center gap-1 font-sans">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                    Sakil
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-[#0070f3] text-black font-black text-xs sm:text-sm shadow-[0_0_15px_rgba(0,112,243,0.4)]">
                    Hub
                  </span>
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
                  className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#00d2ff] hover:bg-[#00b8e6] text-black text-xs font-black shadow-[0_0_20px_rgba(0,210,255,0.4)] flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#00d2ff] hover:bg-[#00b8e6] text-black text-xs font-black shadow-[0_0_20px_rgba(0,210,255,0.4)] flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Log In</span>
                </Link>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Dropdown (Expanding within the floating island) */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-white/[0.08] py-2.5 space-y-1 animate-in slide-in-from-top-2 duration-200">
              {navLinks.map((link) => {
                const active = isLinkActive(link.href, link.exact);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? "bg-[#00d2ff]/15 text-[#00d2ff] font-bold"
                        : "text-zinc-300 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  </>
);
}
