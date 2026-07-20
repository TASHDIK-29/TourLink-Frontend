"use client";

import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Plane,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { TourGallery } from "./TourGallery";
import { BookTourDialog } from "@/components/booking/BookTourDialog";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";
import { useGetTourBySlugQuery, getTourTypeName, useGetTourTypesQuery } from "@/redux/features/tour/tourApi";
import { useGetDivisionsQuery } from "@/redux/features/division/divisionApi";
import type { ITour } from "@/types";

export function TourDetail({ slug }: { slug: string }) {
  const { data: tour, isLoading, isError } = useGetTourBySlugQuery(slug);

  if (isLoading) return <DetailSkeleton />;

  if (isError || !tour) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Tour not found</h1>
        <p className="mt-2 text-muted-foreground">
          This tour may have been removed, or its link changed after an edit.
        </p>
        <Link href="/tours">
          <Button className="mt-6">Browse all tours</Button>
        </Link>
      </div>
    );
  }

  return <TourBody tour={tour} />;
}

function TourBody({ tour }: { tour: ITour }) {
  // Tours aren't populated, so division/tourType arrive as ids and their names
  // have to be looked up from the reference lists.
  const { data: divisions } = useGetDivisionsQuery();
  const { data: tourTypes } = useGetTourTypesQuery();
  const [bookingOpen, setBookingOpen] = useState(false);

  const canBook = Boolean(tour.costFrom && tour.costFrom > 0);

  const divisionName = divisions?.find((d) => d._id === tour.division)?.name;
  const typeName = getTourTypeName(
    tourTypes?.find((t) => t._id === tour.tourType),
  );

  const nights =
    tour.startDate && tour.endDate
      ? Math.max(
          0,
          Math.round(
            (new Date(tour.endDate).getTime() -
              new Date(tour.startDate).getTime()) /
              86_400_000,
          ),
        )
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/tours"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tours
      </Link>

      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {typeName && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {typeName}
            </span>
          )}
          {divisionName && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {divisionName}
            </span>
          )}
        </div>

        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{tour.title}</h1>

        {tour.location && (
          <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {tour.location}
          </p>
        )}
      </header>

      <TourGallery images={tour.images ?? []} title={tour.title} />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          {tour.description && (
            <section>
              <h2 className="text-xl font-semibold">About this tour</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">
                {tour.description}
              </p>
            </section>
          )}

          <section>
            <h2 className="text-xl font-semibold">At a glance</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Fact
                icon={CalendarDays}
                label="Starts"
                value={
                  tour.startDate
                    ? format(new Date(tour.startDate), "EEEE, MMMM d, yyyy")
                    : "Flexible"
                }
              />
              <Fact
                icon={CalendarDays}
                label="Ends"
                value={
                  tour.endDate
                    ? format(new Date(tour.endDate), "EEEE, MMMM d, yyyy")
                    : "Flexible"
                }
              />
              {nights !== null && (
                <Fact
                  icon={Clock}
                  label="Duration"
                  value={`${nights} night${nights === 1 ? "" : "s"}`}
                />
              )}
              {tour.maxGuest != null && (
                <Fact
                  icon={Users}
                  label="Group size"
                  value={`Up to ${tour.maxGuest} guests`}
                />
              )}
              {tour.minAge != null && (
                <Fact
                  icon={UserRound}
                  label="Minimum age"
                  value={`${tour.minAge} years`}
                />
              )}
              {tour.departureLocation && (
                <Fact
                  icon={Plane}
                  label="Departs from"
                  value={tour.departureLocation}
                />
              )}
              {tour.arrivalLocation && (
                <Fact
                  icon={MapPin}
                  label="Arrives at"
                  value={tour.arrivalLocation}
                />
              )}
            </dl>
          </section>

          {Boolean(tour.tourPlan?.length) && (
            <section>
              <h2 className="text-xl font-semibold">Itinerary</h2>
              <ol className="mt-4 space-y-4">
                {tour.tourPlan!.map((step, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {index + 1}
                    </span>
                    <p className="pt-1 leading-relaxed text-muted-foreground">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {(Boolean(tour.included?.length) || Boolean(tour.excluded?.length)) && (
            <section className="grid gap-8 sm:grid-cols-2">
              {Boolean(tour.included?.length) && (
                <div>
                  <h2 className="text-xl font-semibold">What&apos;s included</h2>
                  <ul className="mt-3 space-y-2">
                    {tour.included!.map((item) => (
                      <li key={item} className="flex gap-2 text-muted-foreground">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {Boolean(tour.excluded?.length) && (
                <div>
                  <h2 className="text-xl font-semibold">Not included</h2>
                  <ul className="mt-3 space-y-2">
                    {tour.excluded!.map((item) => (
                      <li key={item} className="flex gap-2 text-muted-foreground">
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {Boolean(tour.amenities?.length) && (
            <section>
              <h2 className="text-xl font-semibold">Amenities</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {tour.amenities!.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-card border border-border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">From</p>
            <p className="text-3xl font-bold">{formatCurrency(tour.costFrom)}</p>
            <p className="text-sm text-muted-foreground">per person</p>

            {tour.startDate && (
              <p className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                Departs {format(new Date(tour.startDate), "MMM d, yyyy")}
              </p>
            )}

            {canBook ? (
              <>
                <Button
                  className="mt-5 w-full"
                  size="lg"
                  onClick={() => setBookingOpen(true)}
                >
                  Book this tour
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  You won&apos;t be charged until the payment page.
                </p>
              </>
            ) : (
              <>
                {/* createBooking rejects a tour with no costFrom ("No Tour Cost
                    Found"), so don't offer a button that cannot succeed. */}
                <Button className="mt-5 w-full" size="lg" disabled>
                  Not available
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  This tour has no price set yet.
                </p>
              </>
            )}
          </div>
        </aside>
      </div>

      <BookTourDialog
        tour={tour}
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="font-medium">{value}</dd>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="mt-6 h-10 w-2/3" />
      <Skeleton className="mt-6 aspect-[16/9] w-full rounded-card" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 rounded-card" />
      </div>
    </div>
  );
}
