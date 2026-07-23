"use client";

import { BadgeCheck, Mail, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { GuideCategoryBadge } from "@/components/guide/GuideCategoryBadge";
import { formatCurrency } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiError";
import { useGetAvailableGuidesQuery } from "@/redux/features/guide/guideApi";
import { useConfirmGuidingMutation } from "@/redux/features/booking/bookingApi";
import { guideCategoryFromCount, type IBooking, type IUser } from "@/types";

/**
 * Short profile of the guide assigned to a booking, plus the "credit guiding"
 * action. Opened from the guide's name in the admin bookings table.
 */
export function GuideInfoModal({
  booking,
  onClose,
}: {
  booking: IBooking | null;
  onClose: () => void;
}) {
  const guide =
    booking?.guide && typeof booking.guide === "object" ? booking.guide : null;

  // The guide's live guiding count isn't on the booking, so look it up from the
  // division's approved guides (cached by RTK; scoped to the tour's division).
  const divisionId =
    booking?.tour && typeof booking.tour.division === "string"
      ? booking.tour.division
      : undefined;

  const { data: guides } = useGetAvailableGuidesQuery(
    { division: divisionId as string },
    { skip: !divisionId || !booking },
  );

  const [confirmGuiding, { isLoading: confirming }] = useConfirmGuidingMutation();

  const record = guides?.find(
    (g) =>
      typeof g.user === "object" &&
      (g.user as Pick<IUser, "_id">)._id === guide?._id,
  );
  const count = record?.completedGuidings ?? 0;

  const credit = async () => {
    if (!booking) return;
    try {
      await confirmGuiding(booking._id).unwrap();
      toast.success("Guiding confirmed — credited to the guide");
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not confirm the guiding"));
    }
  };

  return (
    <Modal
      open={Boolean(booking)}
      onClose={onClose}
      title="Guide details"
      className="max-w-md"
    >
      {!guide ? (
        <p className="text-sm text-muted-foreground">
          No guide is assigned to this booking.
        </p>
      ) : (
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{guide.name}</p>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {guide.email}
              </p>
            </div>
            <GuideCategoryBadge category={guideCategoryFromCount(count)} />
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-border p-3">
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Trophy className="h-3.5 w-3.5" />
                Completed guidings
              </dt>
              <dd className="mt-1 text-lg font-bold">{count}</dd>
            </div>
            <div className="rounded-xl border border-border p-3">
              <dt className="text-xs text-muted-foreground">Guide fee (this trip)</dt>
              <dd className="mt-1 text-lg font-bold">
                {formatCurrency(booking?.guideCost)}
              </dd>
            </div>
          </dl>

          <div className="rounded-xl bg-muted/50 p-4">
            {booking?.guidingConfirmed ? (
              <p className="flex items-center gap-2 text-sm font-medium text-accent">
                <BadgeCheck className="h-4 w-4" />
                This trip has been credited to the guide.
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Confirm once this trip is completed to credit it to the
                  guide&apos;s record. This can only be done once.
                </p>
                <Button className="mt-3 w-full" onClick={credit} loading={confirming}>
                  <BadgeCheck className="h-4 w-4" />
                  Confirm Credit
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
