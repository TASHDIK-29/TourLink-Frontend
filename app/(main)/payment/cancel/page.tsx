import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentResult } from "@/components/payment/PaymentResult";

export const metadata: Metadata = { title: "Payment cancelled" };

export default function PaymentCancelPage() {
  // PaymentResult reads the gateway's query params via useSearchParams.
  return (
    <Suspense fallback={null}>
      <PaymentResult variant="cancel" />
    </Suspense>
  );
}
