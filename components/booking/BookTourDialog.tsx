"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Award, Check, Loader2, Lock, Minus, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn, formatCurrency } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiError";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setUser } from "@/redux/features/auth/authSlice";
import { useLazyGetMeQuery } from "@/redux/features/auth/authApi";
import { useUpdateUserMutation } from "@/redux/features/user/userApi";
import { useCreateBookingMutation } from "@/redux/features/booking/bookingApi";
import { GUIDE_DAILY_RATE, type GuideCategory, type ITour } from "@/types";

/** Whole-day tour length for pricing the guide fee; mirrors the backend fallback. */
function tourDurationDays(tour: ITour): number {
  if (tour.startDate && tour.endDate) {
    const ms = new Date(tour.endDate).getTime() - new Date(tour.startDate).getTime();
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  }
  return 1;
}

const GUIDE_TIERS: {
  value: GuideCategory;
  label: string;
  blurb: string;
}[] = [
  { value: "STANDARD", label: "Standard guide", blurb: "Up to 20 guidings" },
  { value: "PREMIUM", label: "Premium guide", blurb: "20+ guidings, most experienced" },
];

/** Same rule as the backend's updateUserZodSchema. */
const profileSchema = z.object({
  phone: z
    .string()
    .regex(
      /^(?:\+8801\d{9}|01\d{9})$/,
      "Use a valid Bangladeshi number: +8801XXXXXXXXX or 01XXXXXXXXX.",
    ),
  address: z
    .string()
    .min(1, "Address is required.")
    .max(200, "Address cannot exceed 200 characters."),
});
type ProfileValues = z.infer<typeof profileSchema>;

export function BookTourDialog({
  tour,
  open,
  onClose,
}: {
  tour: ITour;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const [guestCount, setGuestCount] = useState(1);
  const [guideCategory, setGuideCategory] = useState<GuideCategory>("STANDARD");
  const [createBooking, { isLoading: booking }] = useCreateBookingMutation();
  const [updateUser, { isLoading: savingProfile }] = useUpdateUserMutation();
  const [fetchMe] = useLazyGetMeQuery();

  // The backend rejects a booking with 400 unless BOTH are present, so collect
  // them here rather than letting the user hit that error.
  const profileIncomplete = !user?.phone || !user?.address;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { phone: user?.phone ?? "", address: user?.address ?? "" },
  });

  const maxGuests = tour.maxGuest ?? 20;
  const unitPrice = tour.costFrom ?? 0;
  const toursTotal = unitPrice * guestCount;

  // Guide fee = chosen tier's daily rate × the tour's length, matching the
  // backend calculation so the preview equals what will be charged.
  const durationDays = tourDurationDays(tour);
  const guideRate = GUIDE_DAILY_RATE[guideCategory];
  const guideCost = guideRate * durationDays;
  const total = toursTotal + guideCost;

  const saveProfile = async (values: ProfileValues) => {
    if (!user) return;
    try {
      await updateUser({ id: user._id, payload: values }).unwrap();
      const me = await fetchMe().unwrap();
      dispatch(setUser(me));
      toast.success("Profile updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update your profile"));
    }
  };

  const confirmBooking = async () => {
    try {
      const res = await createBooking({
        tour: tour._id,
        guestCount,
        guideCategory,
      }).unwrap();

      const paymentUrl = res.data?.paymentUrl;
      if (!paymentUrl) {
        toast.error("Booking created, but no payment link was returned.");
        return;
      }

      toast.success("Redirecting to secure payment…");
      // Full-page navigation: SSLCommerz is an external gateway, so this must
      // leave the SPA rather than go through the router.
      window.location.href = paymentUrl;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create your booking"));
    }
  };

  if (!user) {
    return (
      <Modal open={open} onClose={onClose} title="Sign in to book">
        <p className="text-sm text-muted-foreground">
          You need an account to book a tour. Your selection will be here when
          you get back.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              router.push(
                `/login?redirect=${encodeURIComponent(`/tours/${tour.slug}`)}`,
              )
            }
          >
            Log in
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={profileIncomplete ? "Complete your details" : "Confirm your booking"}
      description={tour.title}
    >
      {profileIncomplete ? (
        <form onSubmit={handleSubmit(saveProfile)} className="space-y-4">
          <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            We need a phone number and address before you can book — they&apos;re
            sent to the payment gateway with your order.
          </p>

          <Input
            label="Phone"
            type="tel"
            placeholder="01XXXXXXXXX"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            label="Address"
            placeholder="Dhanmondi, Dhaka"
            error={errors.address?.message}
            {...register("address")}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={savingProfile}>
              Save and continue
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-5">
          <div>
            <span className="mb-1.5 block text-sm font-medium">Guests</span>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Fewer guests"
                disabled={guestCount <= 1}
                onClick={() => setGuestCount((n) => Math.max(1, n - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span
                className="w-10 text-center text-lg font-semibold"
                aria-live="polite"
              >
                {guestCount}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="More guests"
                disabled={guestCount >= maxGuests}
                onClick={() => setGuestCount((n) => Math.min(maxGuests, n + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Max {maxGuests}
              </span>
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium">Guide</span>
            <div className="grid grid-cols-2 gap-3">
              {GUIDE_TIERS.map((tier) => {
                const selected = guideCategory === tier.value;
                return (
                  <button
                    key={tier.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setGuideCategory(tier.value)}
                    className={cn(
                      "relative rounded-xl border p-3 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted",
                    )}
                  >
                    {selected && (
                      <Check className="absolute right-2 top-2 h-4 w-4 text-primary" />
                    )}
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      {tier.value === "PREMIUM" && (
                        <Award className="h-3.5 w-3.5 text-primary" />
                      )}
                      {tier.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {tier.blurb}
                    </span>
                    <span className="mt-1.5 block text-sm font-medium">
                      {formatCurrency(GUIDE_DAILY_RATE[tier.value])}
                      <span className="text-xs font-normal text-muted-foreground">
                        {" "}
                        / day
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              A guide from this tour&apos;s region is assigned automatically. If
              none is free right now, an admin assigns one shortly.
            </p>
          </div>

          <dl className="space-y-2 rounded-xl bg-muted/60 p-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                {formatCurrency(unitPrice)} × {guestCount} guest
                {guestCount === 1 ? "" : "s"}
              </dt>
              <dd>{formatCurrency(toursTotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                Guide · {formatCurrency(guideRate)} × {durationDays} day
                {durationDays === 1 ? "" : "s"}
              </dt>
              <dd>{formatCurrency(guideCost)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatCurrency(total)}</dd>
            </div>
          </dl>

          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            You&apos;ll be taken to SSLCommerz to pay. Your booking stays
            pending until payment completes.
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={booking}>
              Cancel
            </Button>
            <Button onClick={confirmBooking} loading={booking}>
              {booking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparing payment
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Pay {formatCurrency(total)}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
