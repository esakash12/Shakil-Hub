"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getCartAction } from "@/lib/actions/cart";

export default function GeneralCheckoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function redirect() {
      try {
        const cartData = await getCartAction();
        const slug = cartData?.items?.[0]?.courseSlug || "premiere-pro-masterclass";
        router.replace(`/checkout/${slug}`);
      } catch {
        router.replace("/checkout/premiere-pro-masterclass");
      }
    }
    redirect();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3 select-none">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <span className="text-xs text-gray-500 font-medium">
        Redirecting to secure gateway...
      </span>
    </div>
  );
}
