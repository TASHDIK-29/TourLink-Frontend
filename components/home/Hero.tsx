"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { RangeCalendar, type DateRange } from "@/components/ui/RangeCalendar";
import { useGetDivisionsQuery } from "@/redux/features/division/divisionApi";
import { useGetToursQuery } from "@/redux/features/tour/tourApi";

export function Hero() {
  const router = useRouter();
  const { data: divisions } = useGetDivisionsQuery();
  // Lightweight list of tours to power the search combobox autocomplete.
  const { data: tourData } = useGetToursQuery({
    limit: 200,
    fields: "title,slug",
  });

  const [division, setDivision] = useState("");
  const [range, setRange] = useState<DateRange>({});

  const tourOptions = useMemo(
    () =>
      (tourData?.tours ?? []).map((t) => ({
        value: t.slug,
        label: t.title,
      })),
    [tourData],
  );

  const divisionOptions = useMemo(
    () => [
      { value: "", label: "Anywhere" },
      ...(divisions ?? []).map((d) => ({ value: d._id, label: d.name })),
    ],
    [divisions],
  );

  // The combobox jumps straight to a chosen tour.
  const goToTour = (slug: string) => {
    if (slug) router.push(`/tours/${slug}`);
  };

  // The Search button browses /tours filtered by division and/or date range.
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (division) params.set("division", division);
    if (range.from) params.set("dateFrom", format(range.from, "yyyy-MM-dd"));
    if (range.to) params.set("dateTo", format(range.to, "yyyy-MM-dd"));
    router.push(`/tours${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-background to-background"
      />

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Find your next{" "}
            <span className="text-primary">unforgettable</span> journey
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Handpicked tours across Bangladesh — search by trip, destination or
            the dates you&apos;re free to travel.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mx-auto mt-10 max-w-4xl rounded-2xl border border-border bg-card p-4 shadow-lg"
        >
          <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1.2fr_auto] md:items-end">
            <div>
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Tour
              </span>
              <Combobox
                options={tourOptions}
                onSelect={goToTour}
                placeholder="Search tours…"
                searchPlaceholder="Search tours, places…"
                emptyText="No tours found."
              />
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Destination
              </span>
              <SelectMenu
                value={division}
                onValueChange={setDivision}
                options={divisionOptions}
                aria-label="Filter by destination"
              />
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                When
              </span>
              <RangeCalendar
                value={range}
                onChange={setRange}
                placeholder="Any dates"
                align="end"
              />
            </div>

            <Button type="button" size="lg" onClick={handleSearch} className="md:h-12">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
