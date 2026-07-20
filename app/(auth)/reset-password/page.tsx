import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Reset password" };

/**
 * Deliberately NOT behind GuestGuard: this is reached from an emailed link and
 * has to work whatever the current session is — including for someone still
 * signed in on this device who is resetting because they forgot the password.
 */
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="h-96 w-full max-w-md animate-pulse rounded-card bg-muted" />
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
