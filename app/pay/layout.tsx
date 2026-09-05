import React from "react";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Secure Payment Gateway | Sakil Hub",
  description: "Independent 256-Bit Encrypted Secure Checkout Portal",
};

export const viewport: Viewport = {
  themeColor: "#f8fafc",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function PayIsolatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 min-h-screen w-screen bg-[#f0f3f8] text-gray-900 flex items-center justify-center p-3 sm:p-6 overflow-x-hidden overflow-y-auto z-50 select-none">
      {children}
    </div>
  );
}
