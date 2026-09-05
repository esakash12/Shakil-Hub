"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

/**
 * StorefrontShell manages global storefront chrome (Navbar, PreFooterStatsBar, Footer, MobileBottomNav).
 * For /admin routes, it completely suppresses the storefront chrome to provide an isolated enterprise workspace.
 */
export default function StorefrontShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isPayGateway = pathname?.startsWith("/pay");

  if (isAdmin) {
    return <div className="min-h-screen bg-[#050505] text-white flex flex-col">{children}</div>;
  }

  if (isPayGateway) {
    return <main className="min-h-screen w-full bg-slate-50 text-gray-900">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
