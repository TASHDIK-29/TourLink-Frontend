"use client";

import { format } from "date-fns";
import { Award, BadgeCheck, MapPin, Trophy, Users, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { GuideCategoryBadge } from "@/components/guide/GuideCategoryBadge";
import { cn, formatCurrency } from "@/lib/utils";
import { useAppSelector } from "@/redux/hooks";
import { useGetMyGuideApplicationQuery } from "@/redux/features/guide/guideApi";
import { useGetGuideAssignmentsQuery } from "@/redux/features/booking/bookingApi";
import {
  GUIDE_CATEGORY_THRESHOLD,
  guideCategoryFromCount,
  type IBooking,
  type IUser,
} from "@/types";

/**
 * A guide's earning per trip is the booking's guide fee, but it is only "Paid"
 * once an ADMIN confirms the guiding (credits it) — not when the customer pays
 * for the tour. Until then it stays "Pending"; a cancelled trip is "Canceled".
 */
type TripPayment = "Paid" | "Pending" | "Canceled";

function tripPayment(trip: IBooking): TripPayment {
  if (trip.guidingConfirmed) return "Paid";
  if (trip.status === "CANCEL" || trip.status === "FAILED") return "Canceled";
  return "Pending";
}

const PAYMENT_TONES: Record<TripPayment, string> = {
  Paid: "bg-accent/15 text-accent",
  Pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  Canceled: "bg-muted text-muted-foreground",
};

export default function GuidePage() {
  const user = useAppSelector((s) => s.auth.user);

  const { data: application, isLoading: profileLoading } =
    useGetMyGuideApplicationQuery();
  const { data: assignments, isLoading: assignmentsLoading } =
    useGetGuideAssignmentsQuery({ limit: 50 });

  const completed = application?.completedGuidings ?? 0;
  const category = guideCategoryFromCount(completed);
  const divisionName =
    application && typeof application.division === "object"
      ? application.division.name
      : undefined;

  // How many more guidings until PREMIUM (only meaningful while STANDARD).
  const toPremium = Math.max(0, GUIDE_CATEGORY_THRESHOLD + 1 - completed);

  const trips = assignments?.bookings ?? [];

  // Realised earnings: guide fee summed over trips an admin has credited
  // (guidingConfirmed) — money the guide has actually earned.
  const totalEarnings = trips.reduce(
    (sum, t) => (t.guidingConfirmed ? sum + (t.guideCost ?? 0) : sum),
    0,
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
          <BadgeCheck className="h-3.5 w-3.5" />
          Approved guide
        </span>
        <h1 className="mt-4 text-3xl font-bold">
          Welcome, {user?.name?.split(" ")[0] ?? "guide"}
        </h1>
        <p className="mt-1 max-w-xl text-muted-foreground">
          Here are the trips you&apos;re assigned to lead and your guiding record.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={<Trophy className="h-4 w-4 text-muted-foreground" />}
          label="Completed guidings"
          loading={profileLoading}
          value={String(completed)}
        />
        <div className="rounded-card border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Your tier</span>
            <Award className="h-4 w-4 text-muted-foreground" />
          </div>
          {profileLoading ? (
            <Skeleton className="mt-2 h-8 w-24" />
          ) : (
            <div className="mt-2">
              <GuideCategoryBadge category={category} />
              {category === "STANDARD" && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {toPremium} more to reach Premium
                </p>
              )}
            </div>
          )}
        </div>
        <StatTile
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
          label="Total earnings"
          loading={assignmentsLoading}
          value={formatCurrency(totalEarnings)}
        />
        <StatTile
          icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
          label="Region"
          loading={profileLoading}
          value={divisionName ?? "—"}
        />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-semibold">Assigned trips</h2>

        {assignmentsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : !trips.length ? (
          <div className="rounded-card border border-dashed border-border bg-card p-10 text-center">
            <Users className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-3 font-semibold">No trips assigned yet</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              When a traveller books a tour in your region and category, it shows
              up here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-card border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead className="border-b border-border bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tour</th>
                    <th className="px-4 py-3 font-medium">Traveller</th>
                    <th className="px-4 py-3 font-medium">Guests</th>
                    <th className="px-4 py-3 font-medium">Earning</th>
                    <th className="px-4 py-3 font-medium">Payment</th>
                    <th className="px-4 py-3 font-medium">Booked</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {trips.map((trip) => {
                    const traveller =
                      typeof trip.user === "object"
                        ? (trip.user as Pick<IUser, "name" | "email" | "phone">)
                        : null;
                    return (
                      <tr key={trip._id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <p className="max-w-48 truncate font-medium">
                            {trip.tour?.title ?? (
                              <span className="text-muted-foreground">
                                Tour removed
                              </span>
                            )}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{traveller?.name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">
                            {traveller?.phone ?? traveller?.email ?? ""}
                          </p>
                        </td>
                        <td className="px-4 py-3">{trip.guestCount}</td>
                        <td className="px-4 py-3 font-medium">
                          {formatCurrency(trip.guideCost)}
                        </td>
                        <td className="px-4 py-3">
                          {(() => {
                            const label = tripPayment(trip);
                            return (
                              <span
                                className={cn(
                                  "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                                  PAYMENT_TONES[label],
                                )}
                              >
                                {label}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {format(new Date(trip.createdAt), "MMM d, yyyy")}
                        </td>
                        <td className="px-4 py-3">
                          <BookingStatusBadge status={trip.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-card border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {icon}
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-20" />
      ) : (
        <p className="mt-2 truncate text-2xl font-bold">{value}</p>
      )}
    </div>
  );
}
