"use client";

import { format } from "date-fns";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { RangeCalendar, type DateRange } from "@/components/ui/RangeCalendar";
import { useGetDivisionsQuery } from "@/redux/features/division/divisionApi";
import {
  getTourTypeName,
  useGetTourTypesQuery,
} from "@/redux/features/tour/tourApi";

export const SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest first" },
  { value: "costFrom", label: "Price: low to high" },
  { value: "-costFrom", label: "Price: high to low" },
  { value: "title", label: "Title: A–Z" },
];

export interface TourFilterState {
  division: string;
  tourType: string;
  sort: string;
  dateFrom: string;
  dateTo: string;
}

const parseDate = (s: string) => (s ? new Date(`${s}T00:00:00`) : undefined);
const fmt = (d?: Date) => (d ? format(d, "yyyy-MM-dd") : "");

export function TourFilters({
  value,
  onChange,
  onReset,
  resultsLabel,
}: {
  value: TourFilterState;
  onChange: (patch: Partial<TourFilterState>) => void;
  onReset: () => void;
  resultsLabel?: string;
}) {
  const { data: divisions } = useGetDivisionsQuery();
  const { data: tourTypes } = useGetTourTypesQuery();

  const hasFilters = Boolean(
    value.division || value.tourType || value.dateFrom || value.dateTo,
  );

  const range: DateRange = {
    from: parseDate(value.dateFrom),
    to: parseDate(value.dateTo),
  };

  return (
    <aside className="rounded-card border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </h2>
        {hasFilters && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      <div className="space-y-4">
        <SelectMenu
          label="Destination"
          value={value.division}
          onValueChange={(v) => onChange({ division: v })}
          options={[
            { value: "", label: "Anywhere" },
            ...(divisions ?? []).map((d) => ({ value: d._id, label: d.name })),
          ]}
        />

        <SelectMenu
          label="Tour type"
          value={value.tourType}
          onValueChange={(v) => onChange({ tourType: v })}
          options={[
            { value: "", label: "Any type" },
            ...(tourTypes ?? []).map((t) => ({
              value: t._id,
              label: getTourTypeName(t) || "(unnamed)",
            })),
          ]}
        />

        <RangeCalendar
          label="Travel dates"
          value={range}
          placeholder="Any dates"
          onChange={(r) =>
            onChange({ dateFrom: fmt(r.from), dateTo: fmt(r.to) })
          }
        />

        <SelectMenu
          label="Sort by"
          value={value.sort}
          onValueChange={(v) => onChange({ sort: v })}
          options={SORT_OPTIONS}
        />
      </div>

      {resultsLabel && (
        <p className="mt-5 border-t border-border pt-4 text-sm text-muted-foreground">
          {resultsLabel}
        </p>
      )}
    </aside>
  );
}

export function MobileFilterBar({
  onOpen,
  activeCount,
}: {
  onOpen: () => void;
  activeCount: number;
}) {
  return (
    <Button variant="outline" onClick={onOpen} className="lg:hidden">
      <SlidersHorizontal className="h-4 w-4" />
      Filters
      {activeCount > 0 && (
        <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
          {activeCount}
        </span>
      )}
    </Button>
  );
}
