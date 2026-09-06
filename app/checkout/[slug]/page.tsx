"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  Sparkles,
  ShoppingBag,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { getLiveCourseAction } from "@/lib/actions/storefront-courses";
import { getStorefrontShopProductBySlugAction } from "@/lib/actions/shop";
import { getLMSSettingsAction, LMSSettingsPayload } from "@/lib/actions/admin-settings";
import { getCustomerProfile } from "@/lib/actions/auth";
import { getEnrolledCoursesAction, getPendingOrdersAction } from "@/lib/actions/student";
import { getCourseBySlug, getFirstLessonId, CourseDetail } from "@/lib/data/courses";
import DynamicCheckoutForm, { CustomerFormData } from "@/components/checkout/DynamicCheckoutForm";

export default function CheckoutSlugPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "";

  const [itemType, setItemType] = useState<"course" | "product">("course");
  const [course, setCourse] = useState<CourseDetail>(() => getCourseBySlug(slug));
  const [settings, setSettings] = useState<LMSSettingsPayload>({
    bkashNumber: "01754511619",
    nagadNumber: "01812345678",
    rocketNumber: "01912345678",
    supportEmail: "support@sakilhub.com",
    supportPhone: "+880 1712-345678",
  });

  const [isCheckingOwnership, setIsCheckingOwnership] = useState(true);

  const [formData, setFormData] = useState<CustomerFormData>({
    fullName: "",
    email: "",
    phone: "",
    whatsappNumber: "",
  });

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [courseRes, settingsRes, profile, enrolledCourses, pendingOrders] = await Promise.all([
          getLiveCourseAction(slug),
          getLMSSettingsAction(),
          getCustomerProfile(),
          getEnrolledCoursesAction().catch(() => []),
          getPendingOrdersAction().catch(() => []),
        ]);

        if (isMounted) {
          if (courseRes.success && courseRes.course) {
            setCourse(courseRes.course);
            setItemType("course");
          } else {
            // If slug matches a digital shop product, route directly to dedicated product checkout
            try {
              const shopRes = await getStorefrontShopProductBySlugAction(slug);
              if (shopRes.success && shopRes.product) {
                router.replace(`/checkout/product/${slug}`);
                return;
              }
            } catch {}

            // Neither course nor product exists -> route away from ghost course
            router.replace("/courses");
            return;
          }

          if (settingsRes) {
            setSettings(settingsRes);
          }

          if (profile) {
            setFormData((prev) => ({
              ...prev,
              fullName:
                prev.fullName ||
                (profile.first_name
                  ? `${profile.first_name} ${profile.last_name || ""}`.trim()
                  : ""),
              email: prev.email || profile.email || "",
              phone: prev.phone || profile.phone || "",
              whatsappNumber: prev.whatsappNumber || profile.phone || "",
            }));
          }

          // Ownership verification: If student already owns this masterclass, route straight into classroom
          const isAlreadyEnrolled =
            Array.isArray(enrolledCourses) &&
            enrolledCourses.some((c) => c.slug?.toLowerCase() === slug.toLowerCase());

          if (isAlreadyEnrolled) {
            const firstLessonId = getFirstLessonId(courseRes.course);
            router.replace(firstLessonId ? `/learn/${slug}/${firstLessonId}` : `/dashboard/courses`);
            return;
          }

          // Pending verification check: If student has a pending order for this course, route to pending dashboard
          const isPendingCourse =
            Array.isArray(pendingOrders) &&
            pendingOrders.some(
              (o) =>
                o.courseSlug?.toLowerCase() === slug.toLowerCase() &&
                (o.status === "pending_verification" || (o.status as any) === "pending" || (o.status as any) === "processing")
            );

          if (isPendingCourse) {
            router.replace("/dashboard/pending");
            return;
          }

          setIsCheckingOwnership(false);
        }
      } catch (err) {
        console.error("Failed to load live course or settings for checkout:", err);
        if (isMounted) setIsCheckingOwnership(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [slug, router]);

  const numericAmount = course.numericPrice || 1299;
  const payablePrice = course.price || `৳${numericAmount.toLocaleString()}`;
  const originalPrice =
    course.originalPrice ||
    `৳${Math.round(numericAmount * 1.8).toLocaleString()}`;

  const handleContinueToPayment = () => {
    // 1. Temporarily store customer form data in sessionStorage
    try {
      sessionStorage.setItem(
        "sakil_checkout_data",
        JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          whatsappNumber: formData.whatsappNumber.trim(),
          itemType,
        })
      );
    } catch {}

    // 2. Append query params for fallback/SSR persistence
    const query = new URLSearchParams({
      name: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      whatsapp: formData.whatsappNumber.trim(),
      type: itemType,
    });

    // 3. Transition to isolated /pay/[slug] route
    router.push(`/pay/${slug}?${query.toString()}`);
  };

  if (isCheckingOwnership) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4 select-none">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-inner">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-sm font-semibold text-white">
            Verifying Enrollment Credentials...
          </h3>
          <p className="text-xs text-zinc-500">
            Checking your student dashboard status.
          </p>
        </div>
      </div>
    );
  }

  const isCourse = itemType === "course";

  return (
    <div className="min-h-screen text-white py-6 sm:py-10 select-none animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-zinc-600" />
          <Link href="/courses" className="hover:text-white transition-colors">
            Masterclasses
          </Link>
          <ChevronRight className="w-3 h-3 text-zinc-600" />
          <Link
            href={`/courses/${slug}`}
            className="hover:text-white transition-colors truncate max-w-[160px] sm:max-w-xs"
          >
            {course.title}
          </Link>
          <ChevronRight className="w-3 h-3 text-zinc-600" />
          <span className="text-cyan-400 font-medium">Checkout</span>
        </nav>

        {/* Header & Step Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-[11px] font-semibold">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Student Enrollment Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Complete Masterclass Enrollment
            </h1>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <span className="w-5 h-5 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-[10px] font-bold">
                1
              </span>
              <span>Information</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-black/40 border-white/10 text-zinc-500">
              <span className="w-5 h-5 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-[10px] font-bold">
                2
              </span>
              <span>Payment Gateway</span>
            </div>
          </div>
        </div>

        {/* 2-Column Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl bg-[#0e1320]/90 border border-white/10 p-5 sm:p-6 space-y-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Masterclass Order Summary
                </h2>
                <span className="text-xs text-emerald-400 font-mono font-bold">
                  {course.discountPct || "SPECIAL DEAL"}
                </span>
              </div>

              <div className="flex gap-3.5 items-center">
                <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-black/70 border border-white/10 shrink-0 flex items-center justify-center shadow-md">
                  {course.thumbnail || course.image ? (
                    <Image
                      src={course.thumbnail || course.image}
                      alt={course.title}
                      fill
                      sizes="100px"
                      className="object-cover"
                    />
                  ) : (
                    <Zap className="w-5 h-5 text-cyan-400" />
                  )}
                </div>

                <div className="space-y-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-tight line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 truncate">
                    {isCourse
                      ? `Lead Instructor: ${course.instructor?.name || "Professional Mentor"}`
                      : `${course.badge || "Verified Digital Asset"}`}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-zinc-300">
                {isCourse ? (
                  <>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Lifetime Unlimited 4K Video Streaming</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Downloadable Practice Footage & Project Files</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Official Certificate of Completion</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Instant Automated Delivery via WhatsApp</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>100% Tested & Verified Working Guarantee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>Full Commercial Royalty-Free License</span>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2 pt-3 border-t border-white/5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>List Price</span>
                  <span className="line-through">{originalPrice}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Exclusive Launch Savings</span>
                  <span>
                    - ৳
                    {(course.numericOriginalPrice - course.numericPrice) || 1200}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2.5 border-t border-white/10 text-sm sm:text-base font-bold text-white">
                  <span>Total Payable:</span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-cyan-400">
                    {payablePrice}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1320]/60 border border-white/10 flex items-center gap-3 text-xs text-zinc-400 backdrop-blur-xl">
              <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Need help paying? Contact our direct helpline at{" "}
                <strong className="text-white">
                  {settings.supportPhone || "+880 1712-345678"}
                </strong>{" "}
                (10 AM - 11 PM).
              </span>
            </div>
          </div>

          {/* Right Column: Step 1 Dynamic Information Form */}
          <div className="lg:col-span-7">
            <DynamicCheckoutForm
              itemType={itemType}
              formData={formData}
              onChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
              onContinue={handleContinueToPayment}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
