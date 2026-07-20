import type { Metadata } from "next";
import { Suspense } from "react";
import { ToursBrowser } from "@/components/tours/ToursBrowser";
import { TourCardSkeleton } from "@/components/tours/TourCard";

export const metadata: Metadata = {
  title: "Browse tours",
  description: "Search and filter every tour currently on offer.",
};

export default function ToursPage() {
  // ToursBrowser reads filter state from useSearchParams, which requires a
  // Suspense boundary so the rest of the route can still prerender.
  return (
    <Suspense fallback={<ToursLoading />}>
      <ToursBrowser />
    </Suspense>
  );
}

function ToursLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 h-10 w-64 animate-pulse rounded bg-muted" />
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <TourCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
