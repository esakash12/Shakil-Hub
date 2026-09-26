import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Calendar,
  User,
  GraduationCap,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { verifyCertificateByCodeAction } from "@/lib/actions/certificates";

export const dynamic = "force-dynamic";

interface VerifyCodePageProps {
  params: Promise<{
    code: string;
  }>;
}

export async function generateMetadata({
  params,
}: VerifyCodePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const code = (resolvedParams?.code || "").toUpperCase();
  return {
    title: `Verify Certificate ${code} | Sakil Hub Registry`,
    description: `Official verification portal for Sakil Hub credential ${code}.`,
  };
}

export default async function VerifyCodePage({ params }: VerifyCodePageProps) {
  const resolvedParams = await params;
  const rawCode = resolvedParams?.code || "";
  const code = decodeURIComponent(rawCode).trim().toUpperCase();

  const result = await verifyCertificateByCodeAction(code);

  if (!result.success || !result.certificate) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 select-none">
        <div className="w-full max-w-lg rounded-3xl bg-[#0c1017] border border-red-500/20 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <XCircle className="w-8 h-8 shrink-0" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-semibold uppercase tracking-wider">
              Verification Failed
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Unverified Certificate Code
            </h1>
            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
              We could not find an accredited certificate matching code{" "}
              <span className="text-red-300 font-mono font-bold">{code}</span> in our official database.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-400 text-left space-y-1">
            <p>• Ensure the code was copied accurately (including dashes).</p>
            <p>• Only students who achieved 100% curriculum completion receive verified credentials.</p>
          </div>

          <Link
            href="/verify"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all"
          >
            <span>Try Another Code</span>
          </Link>
        </div>
      </div>
    );
  }

  const cert = result.certificate;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 select-none">
      <div className="w-full max-w-2xl rounded-3xl bg-[#0c1017] border border-emerald-500/30 p-6 sm:p-10 shadow-[0_0_60px_rgba(16,185,129,0.1)] backdrop-blur-xl space-y-8">
        {/* Verification Status Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-md shadow-emerald-500/10">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>AUTHENTICATED OFFICIAL CREDENTIAL</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Certificate Verified
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
            This certifies that the recipient successfully fulfilled all course requirements and demonstrated technical mastery.
          </p>
        </div>

        {/* Certificate Credential Breakdown Card */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <User className="w-5 h-5 shrink-0" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">
                  Graduate Name
                </span>
                <span className="text-sm sm:text-base font-bold text-white">
                  {cert.studentName}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600/15 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <GraduationCap className="w-5 h-5 shrink-0" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">
                  Course Title
                </span>
                <span className="text-sm sm:text-base font-bold text-white">
                  {cert.title.replace(" Certificate", "")}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Calendar className="w-5 h-5 shrink-0" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">
                  Issued Date
                </span>
                <span className="text-sm font-semibold text-gray-200 font-mono">
                  {cert.issuedDate}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5 shrink-0" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">
                  Verification Code
                </span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {cert.code}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-gray-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Issuer: Sakil Hub Academy • Lead: Sakil Ahmed</span>
            </div>

            <Link
              href={`/courses/${cert.courseSlug}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors"
            >
              <span>View Course Curriculum</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/verify"
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Verify another certificate
          </Link>
        </div>
      </div>
    </div>
  );
}
