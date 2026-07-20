"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";

/**
 * Payment outcome pages describe a specific person's transaction, so they
 * require a session. One layout guards all three (success/fail/cancel).
 *
 * No `preserveTarget`: these are landed on from the SSLCommerz redirect and
 * carry the gateway's query string, which is meaningless to replay after a
 * fresh login. The booking record is already updated server-side by then, so
 * anyone bounced here can see the outcome on /dashboard/bookings.
 */
export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
