import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { GuestGuard } from "@/components/auth/GuestGuard";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  // LoginForm reads searchParams via useSearchParams, so it needs a Suspense
  // boundary to avoid opting the whole route into client-side rendering.
  return (
    <GuestGuard>
      <Suspense fallback={<div className="h-96 w-full max-w-md animate-pulse rounded-card bg-muted" />}>
        <LoginForm />
      </Suspense>
    </GuestGuard>
  );
}
