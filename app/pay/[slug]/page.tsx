"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { processManualCheckout } from "@/lib/actions/checkout";
import { getLiveCourseAction } from "@/lib/actions/storefront-courses";
import { getStorefrontShopProductBySlugAction } from "@/lib/actions/shop";
import { getLMSSettingsAction, LMSSettingsPayload } from "@/lib/actions/admin-settings";
import { getCourseBySlug, CourseDetail } from "@/lib/data/courses";
import PaymentSelectionModal from "@/components/checkout/PaymentSelectionModal";
import ThemedGatewayModal from "@/components/checkout/ThemedGatewayModal";
import { PaymentGatewayType } from "@/components/checkout/ThemedPaymentGateway";

function PayGatewayInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = (params?.slug as string) || "premiere-pro-masterclass";

  const [itemType, setItemType] = useState<"course" | "product">("course");
  const [course, setCourse] = useState<CourseDetail>(() => getCourseBySlug(slug));
  const [settings, setSettings] = useState<LMSSettingsPayload>({
    bkashNumber: "01754511619",
    nagadNumber: "01812345678",
    rocketNumber: "01912345678",
    supportEmail: "support@sakilhub.com",
    supportPhone: "+880 1712-345678",
  });

  const [step, setStep] = useState<2 | 3>(2);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayType>("bkash");

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [customerData, setCustomerData] = useState({
    fullName: "",
    email: "",
    phone: "",
    whatsappNumber: "",
    senderNumber: "",
    trxId: "",
  });

  // Hydrate customer data from URL searchParams or sessionStorage
  useEffect(() => {
    const qName = searchParams.get("name");
    const qEmail = searchParams.get("email");
    const qPhone = searchParams.get("phone");
    const qWhatsapp = searchParams.get("whatsapp");
    const qType = searchParams.get("type") as "course" | "product" | null;

    let savedData: any = {};
    try {
      const raw = sessionStorage.getItem("sakil_checkout_data");
      if (raw) savedData = JSON.parse(raw);
    } catch {}

    setCustomerData((prev) => ({
      ...prev,
      fullName: qName || savedData.fullName || prev.fullName || "Customer",
      email: qEmail || savedData.email || prev.email || "customer@sakilhub.com",
      phone: qPhone || savedData.phone || prev.phone || "",
      whatsappNumber: qWhatsapp || savedData.whatsappNumber || prev.whatsappNumber || "",
    }));

    if (qType) {
      setItemType(qType);
    } else if (savedData.itemType) {
      setItemType(savedData.itemType);
    }
  }, [searchParams]);

  // Load live course / product and merchant settings
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [courseRes, settingsRes] = await Promise.all([
          getLiveCourseAction(slug),
          getLMSSettingsAction(),
        ]);

        if (isMounted) {
          if (courseRes.success && courseRes.course) {
            setCourse(courseRes.course);
            setItemType("course");
          } else {
            let foundProduct = false;
            try {
              const shopRes = await getStorefrontShopProductBySlugAction(slug);
              if (shopRes.success && shopRes.product) {
                foundProduct = true;
                const prod = shopRes.product;
                const mappedProduct: any = {
                  id: prod.id,
                  title: prod.title,
                  slug: prod.slug,
                  price: `৳${prod.price}`,
                  numericPrice: prod.price,
                  originalPrice: prod.originalPrice ? `৳${prod.originalPrice}` : undefined,
                  numericOriginalPrice: prod.originalPrice || Math.round(prod.price * 1.5),
                  discountPct: prod.discountBadge || "EXCLUSIVE DEAL",
                  badge: prod.badge || prod.category,
                  thumbnail: prod.thumbnail,
                  image: prod.thumbnail,
                  description: prod.shortDescription,
                  subtitle: prod.shortDescription,
                };
                setCourse(mappedProduct);
                setItemType("product");
              }
            } catch {}

            if (!foundProduct) {
              router.replace("/courses");
              return;
            }
          }

          if (settingsRes) {
            setSettings(settingsRes);
          }
        }
      } catch (err) {
        console.error("Failed to load gateway details:", err);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const numericAmount = course.numericPrice || 1299;
  const payablePrice = course.price || `৳${numericAmount.toLocaleString()}`;

  const orderReference = `SKL-${slug.slice(0, 4).toUpperCase()}-${Date.now()
    .toString()
    .slice(-4)}`;

  const getMerchantNumber = (gw: PaymentGatewayType): string => {
    switch (gw) {
      case "nagad":
        return settings.nagadNumber || "01812345678";
      case "rocket":
        return settings.rocketNumber || "01912345678";
      case "bkash":
      default:
        return settings.bkashNumber || "01754511619";
    }
  };

  /* Final Verification & Checkout Action */
  const handleGatewaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanSender = customerData.senderNumber.trim().replace(/[\s-]/g, "");
    const cleanTrx = customerData.trxId.trim().toUpperCase();

    const BD_PHONE_REGEX = /^01[3-9]\d{8,10}$/;
    if (!cleanSender) {
      setErrorMsg(`Please enter your ${selectedGateway.toUpperCase()} sender number.`);
      return;
    }
    if (!BD_PHONE_REGEX.test(cleanSender)) {
      setErrorMsg(
        `Invalid sender number. Must be a valid mobile banking number starting with 01.`
      );
      return;
    }

    const TRX_ID_REGEX = /^[A-Za-z0-9]{4,25}$/;
    if (!cleanTrx) {
      setErrorMsg("Transaction ID (TrxID) is required.");
      return;
    }
    if (!TRX_ID_REGEX.test(cleanTrx) || cleanTrx.length < 4) {
      setErrorMsg(
        "Invalid Transaction ID. Please check the receipt SMS and enter all alphanumeric characters."
      );
      return;
    }

    try {
      setIsProcessing(true);

      const res = await processManualCheckout({
        courseSlug: slug,
        senderNumber: cleanSender,
        trxId: cleanTrx,
        paymentMethod: selectedGateway,
        fullName: customerData.fullName.trim(),
        email: customerData.email.trim(),
        phone: customerData.phone.trim() || customerData.whatsappNumber.trim() || cleanSender,
        whatsappNumber: customerData.whatsappNumber.trim(),
        itemType,
      });

      if (res.success && res.orderId) {
        // Clear saved form data
        try {
          sessionStorage.removeItem("sakil_checkout_data");
        } catch {}

        router.push(`/checkout/success/${res.orderId}`);
      } else {
        setErrorMsg(res.error || "Failed to process order. Please try again.");
        setIsProcessing(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "A network error occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center relative">
      {/* Floating Error Toast */}
      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 w-full max-w-[430px] p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between gap-3 shadow-md"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg("")}
            className="text-xs font-bold underline hover:text-red-900 cursor-pointer"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Pure Centered Themed Modals */}
      <AnimatePresence mode="wait">
        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="w-full flex justify-center"
          >
            <PaymentSelectionModal
              onSelect={(gw) => {
                setSelectedGateway(gw);
                setStep(3);
              }}
              onBackToDetails={() =>
                router.push(
                  itemType === "product"
                    ? `/checkout/product/${slug}`
                    : `/checkout/${slug}`
                )
              }
              onClose={() =>
                router.push(
                  itemType === "product"
                    ? `/checkout/product/${slug}`
                    : `/checkout/${slug}`
                )
              }
              numericAmount={numericAmount}
              payableAmountFormatted={payablePrice}
            />
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="w-full flex justify-center"
          >
            <ThemedGatewayModal
              method={selectedGateway}
              merchantNumber={getMerchantNumber(selectedGateway)}
              payableAmount={payablePrice}
              numericAmount={numericAmount}
              orderReference={orderReference}
              senderNumber={customerData.senderNumber}
              trxId={customerData.trxId}
              onSenderNumberChange={(val) =>
                setCustomerData((prev) => ({ ...prev, senderNumber: val }))
              }
              onTrxIdChange={(val) =>
                setCustomerData((prev) => ({ ...prev, trxId: val }))
              }
              onSubmit={handleGatewaySubmit}
              onBack={() => setStep(2)}
              onClose={() =>
                router.push(
                  itemType === "product"
                    ? `/checkout/product/${slug}`
                    : `/checkout/${slug}`
                )
              }
              isProcessing={isProcessing}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PaySlugPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center p-6 space-y-3 select-none">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-xs text-gray-500 font-medium">
            Loading secure payment gateway...
          </span>
        </div>
      }
    >
      <PayGatewayInner />
    </Suspense>
  );
}
