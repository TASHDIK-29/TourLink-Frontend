"use client";

import { Loader2, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { GuideCategoryBadge } from "@/components/guide/GuideCategoryBadge";
import { getApiErrorMessage } from "@/lib/apiError";
import { useGetAvailableGuidesQuery } from "@/redux/features/guide/guideApi";
import { useAssignGuideToBookingMutation } from "@/redux/features/booking/bookingApi";
import { guideCategoryFromCount, type IBooking, type IUser } from "@/types";

/**
 * Admin picker for manually (re)assigning the guide on a booking. Lists approved
 * guides in the tour's division; the backend rejects a guide from another
 * division, so the pool is scoped there.
 */
export function AssignGuideModal({
  booking,
  onClose,
}: {
  booking: IBooking | null;
  onClose: () => void;
}) {
  // `division` is populated onto the tour as an id string (tours aren't deep-populated).
  const divisionId =
    booking?.tour && typeof booking.tour.division === "string"
      ? booking.tour.division
      : undefined;

  const { data: guides, isLoading } = useGetAvailableGuidesQuery(
    { division: divisionId as string },
    { skip: !divisionId },
  );

  const [assignGuide, { isLoading: assigning }] =
    useAssignGuideToBookingMutation();

  const currentGuideId =
    booking?.guide && typeof booking.guide === "object"
      ? booking.guide._id
      : typeof booking?.guide === "string"
        ? booking.guide
        : undefined;

  const assign = async (guideUserId: string) => {
    if (!booking) return;
    try {
      await assignGuide({ id: booking._id, guideId: guideUserId }).unwrap();
      toast.success("Guide assigned");
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not assign the guide"));
    }
  };

  return (
    <Modal
      open={Boolean(booking)}
      onClose={onClose}
      title="Assign a guide"
      description="Approved guides in this tour's division."
    >
      {!divisionId ? (
        <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          This booking&apos;s tour is unavailable, so guides can&apos;t be looked
          up.
        </p>
      ) : isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : !guides?.length ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <UserCheck className="mx-auto h-7 w-7 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No approved guides in this division yet.
          </p>
        </div>
      ) : (
        <ul className="max-h-80 space-y-2 overflow-y-auto">
          {guides.map((guide) => {
            const guideUser =
              typeof guide.user === "object"
                ? (guide.user as Pick<IUser, "_id" | "name" | "email">)
                : null;
            const count = guide.completedGuidings ?? 0;
            const isCurrent = guideUser?._id === currentGuideId;

            return (
              <li
                key={guide._id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {guideUser?.name ?? "Unknown guide"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {guideUser?.email ?? ""} · {count} guiding
                    {count === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <GuideCategoryBadge category={guideCategoryFromCount(count)} />
                  <button
                    type="button"
                    disabled={assigning || isCurrent || !guideUser}
                    onClick={() => guideUser && assign(guideUser._id)}
                    className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {isCurrent ? "Assigned" : "Assign"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
