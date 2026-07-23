"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";
import {
  CalendarDays,
  CreditCard,
  Download,
  Luggage,
  MapPin,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/booking/BookingStatusBadge";
import { formatCurrency } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  useGetMyBookingsQuery,
  useUpdateBookingStatusMutation,
} from "@/redux/features/booking/bookingApi";
import { useInitPaymentMutation } from "@/redux/features/payment/paymentApi";
import type { IBooking } from "@/types";

const PAGE_SIZE = 10;

export default function MyBookingsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetMyBookingsQuery({
    page,
    limit: PAGE_SIZE,
  });
  const [updateStatus, { isLoading: cancelling }] =
    useUpdateBookingStatusMutation();
  const [initPayment] = useInitPaymentMutation();
  const [toCancel, setToCancel] = useState<IBooking | null>(null);
  // Tracked per booking, not from the mutation's own isLoading: that flag is
  // shared across every card and would spin all of them at once.
  const [payingId, setPayingId] = useState<string | null>(null);

  const bookings = data?.bookings ?? [];
  const totalPage = data?.meta?.totalPage ?? 1;

  const handlePay = async (booking: IBooking) => {
    setPayingId(booking._id);
    try {
      const res = await initPayment(booking._id).unwrap();
      const url = res.data?.paymentUrl;
      if (!url) throw new Error("No payment URL returned");
      // SSLCommerz is an external gateway — must be a full page navigation,
      // not router.push. `assign` over `location.href =` because Next 16's
      // react-hooks/immutability rule rejects the assignment form.
      window.location.assign(url);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not start the payment"));
      setPayingId(null);
    }
  };

  const confirmCancel = async () => {
    if (!toCancel) return;
    try {
      await updateStatus({ id: toCancel._id, status: "CANCEL" }).unwrap();
      toast.success("Booking cancelled");
      setToCancel(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not cancel the booking"));
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">My bookings</h1>
        <p className="mt-1 text-muted-foreground">
          Every trip you&apos;ve booked, and where its payment stands.
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-card" />
          ))}
        </div>
      ) : !bookings.length ? (
        <div className="rounded-card border border-dashed border-border bg-card p-12 text-center">
          <Luggage className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-3 font-semibold">No bookings yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            When you book a tour it&apos;ll show up here with its payment
            status.
          </p>
          <Link href="/tours">
            <Button className="mt-5">Browse tours</Button>
          </Link>
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onCancel={() => setToCancel(booking)}
                onPay={() => handlePay(booking)}
                paying={payingId === booking._id}
              />
            ))}
          </ul>

          {totalPage > 1 && (
            <Pagination
              page={page}
              totalPages={totalPage}
              onPageChange={setPage}
              className="mt-8"
            />
          )}
        </>
      )}

      <ConfirmDelete
        open={Boolean(toCancel)}
        onClose={() => setToCancel(null)}
        onConfirm={confirmCancel}
        loading={cancelling}
        itemName={toCancel?.tour?.title ?? "This booking"}
        description="Cancelling can't be undone. If you've already paid, contact support about a refund."
      />
    </div>
  );
}

function BookingCard({
  booking,
  onCancel,
  onPay,
  paying,
}: {
  booking: IBooking;
  onCancel: () => void;
  onPay: () => void;
  paying: boolean;
}) {
  const tour = booking.tour;
  const payment = booking.payment;

  // A tour deleted after booking leaves a dangling reference (no cascade
  // delete on the backend), so every tour field has to tolerate null.
  const cover = tour?.images?.[0];

  const canCancel =
    booking.status === "PENDING" || booking.status === "FAILED";

  // Pay later: the Payment document is created up-front with the booking, so an
  // unpaid one can always be re-sent to the gateway. Requires the payment to
  // exist (init-payment 404s without it) and the booking to still be live —
  // a cancelled trip shouldn't offer a checkout.
  const canPay =
    Boolean(payment) &&
    payment?.status !== "PAID" &&
    payment?.status !== "REFUNDED" &&
    (booking.status === "PENDING" || booking.status === "FAILED");

  return (
    <li className="overflow-hidden rounded-card border border-border bg-card">
      <div className="flex flex-col gap-4 p-4 sm:flex-row">
        <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:h-24 sm:w-36">
          {cover ? (
            <Image
              src={cover}
              alt=""
              fill
              sizes="144px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <MapPin className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              {tour ? (
                <Link
                  href={`/tours/${tour.slug}`}
                  className="font-semibold hover:underline"
                >
                  {tour.title}
                </Link>
              ) : (
                <span className="font-semibold text-muted-foreground">
                  Tour no longer available
                </span>
              )}
              {tour?.location && (
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {tour.location}
                </p>
              )}
            </div>
            <BookingStatusBadge status={booking.status} />
          </div>

          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <dd>
                {booking.guestCount} guest{booking.guestCount === 1 ? "" : "s"}
              </dd>
            </div>
            {tour?.startDate && (
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                <dd>{format(new Date(tour.startDate), "MMM d, yyyy")}</dd>
              </div>
            )}
            {payment && (
              <div className="flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5" />
                <dd className="font-medium text-foreground">
                  {formatCurrency(payment.amount)}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {payment && <PaymentStatusBadge status={payment.status} />}

            {canPay && (
              <Button size="sm" onClick={onPay} loading={paying}>
                {!paying && <CreditCard className="h-3.5 w-3.5" />}
                {payment?.status === "FAILED" ||
                payment?.status === "CANCELLED"
                  ? "Retry payment"
                  : "Pay now"}
              </Button>
            )}

            {payment?.invoiceUrl && (
              <a
                href={payment.invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="outline">
                  <Download className="h-3.5 w-3.5" />
                  Invoice
                </Button>
              </a>
            )}

            {canCancel && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onCancel}
                className="text-destructive hover:bg-destructive/10"
              >
                Cancel booking
              </Button>
            )}
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Booked {format(new Date(booking.createdAt), "MMM d, yyyy")}
            {payment?.transactionId && ` · ${payment.transactionId}`}
          </p>
        </div>
      </div>
    </li>
  );
}
