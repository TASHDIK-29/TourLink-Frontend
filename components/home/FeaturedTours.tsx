"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useGetToursQuery } from "@/redux/features/tour/tourApi";
import { TourCard, TourCardSkeleton } from "@/components/tours/TourCard";
import { Button } from "@/components/ui/Button";

export function FeaturedTours() {
  const { data, isLoading, isError } = useGetToursQuery({ limit: 8 });
  const tours = data?.tours ?? [];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">Featured tours</h2>
          <p className="mt-1 text-muted-foreground">
            Recently added trips worth your time.
          </p>
        </div>
        <Link href="/tours" className="hidden sm:block">
          <Button variant="outline" size="sm">
            View all <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <TourCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <p className="rounded-card border border-border bg-muted/40 p-8 text-center text-muted-foreground">
          Couldn&apos;t load tours right now. Please try again shortly.
        </p>
      ) : tours.length === 0 ? (
        <p className="rounded-card border border-border bg-muted/40 p-8 text-center text-muted-foreground">
          No tours published yet. Check back soon.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tours.map((tour, i) => (
            <TourCard key={tour._id} tour={tour} index={i} />
          ))}
        </div>
      )}

      <div className="mt-8 sm:hidden">
        <Link href="/tours">
          <Button variant="outline" className="w-full">
            View all tours <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
