"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Luggage, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/booking/BookingStatusBadge";
import { AssignGuideModal } from "@/components/admin/AssignGuideModal";
import { GuideInfoModal } from "@/components/admin/GuideInfoModal";
import { formatCurrency } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  useGetAllBookingsQuery,
  useUpdateBookingStatusMutation,
} from "@/redux/features/booking/bookingApi";
import type { BookingStatus, IBooking, IUser } from "@/types";

const PAGE_SIZE = 15;
const STATUSES: BookingStatus[] = ["PENDING", "COMPLETE", "CANCEL", "FAILED"];

export default function AdminBookingsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<BookingStatus | "">("");

  const [assignTarget, setAssignTarget] = useState<IBooking | null>(null);
  const [infoTarget, setInfoTarget] = useState<IBooking | null>(null);

  const { data, isLoading, isFetching } = useGetAllBookingsQuery({
    page,
    limit: PAGE_SIZE,
    ...(status ? { status } : {}),
  });
  const [updateStatus] = useUpdateBookingStatusMutation();

  const bookings = data?.bookings ?? [];
  const totalPage = data?.meta?.totalPage ?? 1;

  const changeStatus = async (id: string, next: BookingStatus) => {
    try {
      await updateStatus({ id, status: next }).unwrap();
      toast.success(`Booking marked ${next}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update the booking"));
    }
  };

  return (
    <>
      <PageHeader
        title="Bookings"
        description="Every booking across all customers."
        action={
          <Select
            value={status}
            aria-label="Filter by status"
            onChange={(e) => {
              setStatus(e.target.value as BookingStatus | "");
              setPage(1);
            }}
            className="w-48"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : !bookings.length ? (
        <div className="rounded-card border border-dashed border-border bg-card p-12 text-center">
          <Luggage className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 font-semibold">
            {status ? `No ${status} bookings` : "No bookings yet"}
          </h3>
        </div>
      ) : (
        <div
          className={`overflow-hidden rounded-card border border-border bg-card ${
            isFetching ? "opacity-60" : ""
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-sm">
              <thead className="border-b border-border bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Tour</th>
                  <th className="px-4 py-3 font-medium">Guests</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Booking</th>
                  <th className="px-4 py-3 font-medium">Guide</th>
                  <th className="px-4 py-3 text-right font-medium">Set status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.map((booking) => {
                  // `user` is populated on this route but typed as a union,
                  // since /booking/my-bookings leaves it as a bare id.
                  const customer =
                    typeof booking.user === "object"
                      ? (booking.user as IUser)
                      : null;

                  return (
                    <tr key={booking._id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <p className="font-medium">{customer?.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">
                          {customer?.email ?? ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="max-w-48 truncate">
                          {booking.tour?.title ?? (
                            <span className="text-muted-foreground">
                              Tour deleted
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(booking.createdAt), "MMM d, yyyy")}
                        </p>
                      </td>
                      <td className="px-4 py-3">{booking.guestCount}</td>
                      <td className="px-4 py-3">
                        {formatCurrency(booking.payment?.amount)}
                      </td>
                      <td className="px-4 py-3">
                        {booking.payment ? (
                          <PaymentStatusBadge status={booking.payment.status} />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <BookingStatusBadge status={booking.status} />
                      </td>
                      <td className="px-4 py-3">
                        <GuideCell
                          booking={booking}
                          onAssign={() => setAssignTarget(booking)}
                          onInfo={() => setInfoTarget(booking)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          aria-label={`Change status for ${customer?.name ?? "booking"}`}
                          value={booking.status}
                          onChange={(e) =>
                            changeStatus(
                              booking._id,
                              e.target.value as BookingStatus,
                            )
                          }
                          className="h-9 w-36 text-xs"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </Select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPage > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPage} · {data?.meta?.total} total
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <AssignGuideModal
        booking={assignTarget}
        onClose={() => setAssignTarget(null)}
      />
      <GuideInfoModal
        booking={infoTarget}
        onClose={() => setInfoTarget(null)}
      />
    </>
  );
}

/**
 * Guide column: the guide's first name (a button opening their profile + credit
 * action) and a reassign button. Unassigned bookings show an assign button.
 */
function GuideCell({
  booking,
  onAssign,
  onInfo,
}: {
  booking: IBooking;
  onAssign: () => void;
  onInfo: () => void;
}) {
  const guide =
    booking.guide && typeof booking.guide === "object" ? booking.guide : null;

  if (!guide) {
    return (
      <button
        type="button"
        onClick={onAssign}
        disabled={booking.guidingConfirmed}
        className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs hover:bg-muted disabled:opacity-50"
      >
        <UserPlus className="h-3 w-3" />
        Assign
      </button>
    );
  }

  // Only the first word of the name, per the compact column design.
  const firstName = guide.name.split(" ")[0];

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onInfo}
        className="font-medium text-primary hover:underline"
      >
        {firstName}
      </button>
      <button
        type="button"
        onClick={onAssign}
        disabled={booking.guidingConfirmed}
        aria-label={`Reassign guide for ${firstName}`}
        title={booking.guidingConfirmed ? "Credited — locked" : "Reassign"}
        className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
      >
        <UserPlus className="h-3 w-3" />
        Reassign
      </button>
    </div>
  );
}
