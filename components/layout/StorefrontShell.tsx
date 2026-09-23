"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";

import { PlatformBrandingSettings } from "@/lib/data/branding-types";

/**
 * StorefrontShell manages global storefront chrome (Navbar, PreFooterStatsBar, Footer, MobileBottomNav, FloatingWhatsApp).
 * For /admin routes, it completely suppresses the storefront chrome to provide an isolated enterprise workspace.
 */
export default function StorefrontShell({
  children,
  branding,
}: {
  children: React.ReactNode;
  branding?: PlatformBrandingSettings;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isPayGateway = pathname?.startsWith("/pay");
  const isLearnPage = pathname?.includes("/learn");
  const isCourseSinglePage = pathname?.startsWith("/courses/") && pathname !== "/courses";

  if (isAdmin) {
    return <div className="min-h-screen bg-[#050505] text-white flex flex-col">{children}</div>;
  }

  if (isPayGateway) {
    return <main className="min-h-screen w-full bg-slate-50 text-gray-900">{children}</main>;
  }

  // Cinema LMS Mode for student classroom (Zero Distraction)
  if (isLearnPage) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <main className="flex-grow">{children}</main>
        <FloatingWhatsApp hasBottomNav={false} />
      </div>
    );
  }

  const showMobileBottomNav = !isCourseSinglePage;

  return (
    <>
      <Navbar branding={branding} />
      <main className="flex-grow">{children}</main>
      <Footer branding={branding} />
      {showMobileBottomNav && <MobileBottomNav />}
      <FloatingWhatsApp hasBottomNav={showMobileBottomNav} />
    </>
  );
}
