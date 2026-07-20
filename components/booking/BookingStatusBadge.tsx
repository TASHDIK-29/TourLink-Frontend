import { cn } from "@/lib/utils";
import type { BookingStatus, PaymentStatus } from "@/types";

const BOOKING_TONES: Record<BookingStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  COMPLETE: "bg-accent/15 text-accent",
  CANCEL: "bg-muted text-muted-foreground",
  FAILED: "bg-destructive/15 text-destructive",
};

const BOOKING_LABELS: Record<BookingStatus, string> = {
  PENDING: "Awaiting payment",
  COMPLETE: "Confirmed",
  CANCEL: "Cancelled",
  FAILED: "Failed",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        BOOKING_TONES[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {BOOKING_LABELS[status] ?? status}
    </span>
  );
}

const PAYMENT_TONES: Record<PaymentStatus, string> = {
  PAID: "bg-accent/15 text-accent",
  UNPAID: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  CANCELLED: "bg-muted text-muted-foreground",
  FAILED: "bg-destructive/15 text-destructive",
  REFUNDED: "bg-muted text-muted-foreground",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        PAYMENT_TONES[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {status}
    </span>
  );
}
