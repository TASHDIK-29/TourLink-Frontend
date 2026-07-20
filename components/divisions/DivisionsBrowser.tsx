"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useGetDivisionsQuery } from "@/redux/features/division/divisionApi";
import { useGetToursQuery } from "@/redux/features/tour/tourApi";

export function DivisionsBrowser() {
  const { data: divisions, isLoading } = useGetDivisionsQuery();
  // Tours come back with `division` as a bare id string (the backend does not
  // populate), which is exactly what we need to tally counts client-side.
  // There's no per-division count endpoint, so one wide fetch does the job.
  const { data: tourData } = useGetToursQuery({ limit: 200, fields: "division" });

  const [query, setQuery] = useState("");

  const countByDivision = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tour of tourData?.tours ?? []) {
      if (tour.division) {
        counts.set(tour.division, (counts.get(tour.division) ?? 0) + 1);
      }
    }
    return counts;
  }, [tourData]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return divisions ?? [];
    return (divisions ?? []).filter(
      (d) =>
        d.name.toLowerCase().includes(term) ||
        d.description?.toLowerCase().includes(term),
    );
  }, [divisions, query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Destinations</h1>
        <p className="mt-2 text-muted-foreground">
          Bangladesh, division by division. Pick a region and see every tour
          departing there.
        </p>
      </header>

      <div className="relative mt-6 max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search destinations"
          aria-label="Search destinations"
          className="h-12 w-full rounded-full border border-input bg-card pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
        />
      </div>

      {isLoading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-card" />
          ))}
        </div>
      ) : !filtered.length ? (
        <div className="mt-8 rounded-card border border-dashed border-border bg-card p-12 text-center">
          <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-3 font-semibold">
            {divisions?.length
              ? "No destination matches that search"
              : "No destinations yet"}
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            {divisions?.length
              ? "Try a different name."
              : "Destinations will appear here once they're added."}
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((division, i) => {
            const count = countByDivision.get(division._id) ?? 0;
            return (
              <motion.div
                key={division._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.3) }}
              >
                <Link
                  href={`/tours?division=${division._id}`}
                  className="group block overflow-hidden rounded-card border border-border bg-card transition-shadow hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] bg-muted">
                    {division.thumbnail ? (
                      <Image
                        src={division.thumbnail}
                        alt={division.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <MapPin className="h-8 w-8" />
                      </div>
                    )}
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
                    />
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                      <h2 className="text-lg font-semibold text-white">
                        {division.name}
                      </h2>
                      <span className="shrink-0 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-black">
                        {count} tour{count === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    {division.description ? (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {division.description}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Explore what {division.name} has on offer.
                      </p>
                    )}
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      View tours
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
