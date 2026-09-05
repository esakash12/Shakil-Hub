"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertCircle,
  X,
  BellRing,
  Sparkles,
} from "lucide-react";
import { CustomerNotice } from "@/lib/data/customers";
import { dismissStudentNoticeAction } from "@/lib/actions/student";

interface StudentNoticeBannerProps {
  initialNotices: CustomerNotice[];
}

export default function StudentNoticeBanner({
  initialNotices = [],
}: StudentNoticeBannerProps) {
  const [notices, setNotices] = useState<CustomerNotice[]>(initialNotices);

  React.useEffect(() => {
    if (initialNotices) {
      setNotices(initialNotices);
    }
  }, [initialNotices?.length]);

  if (!notices || notices.length === 0) {
    return null;
  }

  const handleDismiss = async (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    try {
      await dismissStudentNoticeAction(id);
    } catch {}
  };

  return (
    <div className="space-y-3">
      {notices.map((notice) => {
        const type = notice.type || "info";

        let containerStyles = "bg-blue-500/10 border-blue-500/30 text-blue-300";
        let iconStyles = "text-blue-400";
        let badgeBg = "bg-blue-600/30 text-blue-200 border-blue-400/30";
        let IconComponent = Info;

        if (type === "warning") {
          containerStyles = "bg-amber-500/10 border-amber-500/30 text-amber-300";
          iconStyles = "text-amber-400";
          badgeBg = "bg-amber-600/30 text-amber-200 border-amber-400/30";
          IconComponent = AlertTriangle;
        } else if (type === "alert") {
          containerStyles = "bg-red-500/10 border-red-500/30 text-red-300";
          iconStyles = "text-red-400";
          badgeBg = "bg-red-600/30 text-red-200 border-red-400/30";
          IconComponent = AlertCircle;
        } else if (type === "success") {
          containerStyles = "bg-emerald-500/10 border-emerald-500/30 text-emerald-300";
          iconStyles = "text-emerald-400";
          badgeBg = "bg-emerald-600/30 text-emerald-200 border-emerald-400/30";
          IconComponent = CheckCircle2;
        }

        return (
          <div
            key={notice.id}
            className={`p-4 rounded-2xl border backdrop-blur-md flex items-start justify-between gap-4 transition-all shadow-lg ${containerStyles}`}
          >
            <div className="flex items-start gap-3.5">
              <div className={`p-2 rounded-xl bg-black/40 border border-white/10 shrink-0 mt-0.5 ${iconStyles}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${badgeBg}`}>
                    Admin Notice
                  </span>
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {notice.title}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date(notice.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs text-gray-200 leading-relaxed">
                  {notice.message}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDismiss(notice.id)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Dismiss notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
