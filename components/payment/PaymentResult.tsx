"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Ban } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

type Variant = "success" | "fail" | "cancel";

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    tone: "text-accent",
    ring: "bg-accent/10",
    title: "Payment complete",
    body: "Your booking is confirmed. We've emailed your invoice — you can also download it from your bookings.",
  },
  fail: {
    icon: XCircle,
    tone: "text-destructive",
    ring: "bg-destructive/10",
    title: "Payment failed",
    body: "The gateway couldn't process your payment, so the booking wasn't confirmed. You haven't been charged.",
  },
  cancel: {
    icon: Ban,
    tone: "text-muted-foreground",
    ring: "bg-muted",
    title: "Payment cancelled",
    body: "You cancelled before completing payment. The booking is still there if you'd like to try again.",
  },
} as const;

/**
 * The backend redirects here after SSLCommerz calls its own success/fail/cancel
 * endpoints, appending ?transactionId&message&amount&status. Those params are
 * display-only — the booking and payment records were already updated
 * server-side, so nothing here mutates state.
 */
export function PaymentResult({ variant }: { variant: Variant }) {
  const searchParams = useSearchParams();
  const config = VARIANTS[variant];
  const Icon = config.icon;

  const transactionId = searchParams.get("transactionId");
  const amountRaw = searchParams.get("amount");
  const message = searchParams.get("message");
  const amount = amountRaw ? Number(amountRaw) : null;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <motion.span
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`flex h-16 w-16 items-center justify-center rounded-full ${config.ring}`}
      >
        <Icon className={`h-8 w-8 ${config.tone}`} />
      </motion.span>

      <h1 className="mt-6 text-2xl font-bold">{config.title}</h1>
      <p className="mt-2 text-muted-foreground">{config.body}</p>

      {(transactionId || amount != null) && (
        <dl className="mt-8 w-full space-y-3 rounded-card border border-border bg-card p-5 text-left text-sm">
          {transactionId && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Transaction ID</dt>
              <dd className="break-all font-medium">{transactionId}</dd>
            </div>
          )}
          {amount != null && !Number.isNaN(amount) && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="font-medium">{formatCurrency(amount)}</dd>
            </div>
          )}
          {message && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium">{message}</dd>
            </div>
          )}
        </dl>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/dashboard/bookings">
          <Button>View my bookings</Button>
        </Link>
        <Link href="/tours">
          <Button variant="outline">Browse more tours</Button>
        </Link>
      </div>
    </div>
  );
}
