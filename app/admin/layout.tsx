import React from "react";
import type { Metadata } from "next";
import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";

export const metadata: Metadata = {
  title: "Enterprise Admin Console | Sakil Hub",
  description: "Administrative control center for Sakil Hub video editing masterclass platform.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
