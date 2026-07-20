import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";

export const metadata: Metadata = { title: "Verify your email" };

export default function VerifyPage() {
  // VerifyEmailForm reads ?email and ?sent via useSearchParams.
  return (
    <Suspense
      fallback={
        <div className="h-96 w-full max-w-md animate-pulse rounded-card bg-muted" />
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
