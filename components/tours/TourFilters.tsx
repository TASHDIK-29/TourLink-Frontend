"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
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
}

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

  const hasFilters = Boolean(value.division || value.tourType);

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
        <Select
          label="Destination"
          value={value.division}
          onChange={(e) => onChange({ division: e.target.value })}
        >
          <option value="">Anywhere</option>
          {divisions?.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </Select>

        <Select
          label="Tour type"
          value={value.tourType}
          onChange={(e) => onChange({ tourType: e.target.value })}
        >
          <option value="">Any type</option>
          {tourTypes?.map((t) => (
            <option key={t._id} value={t._id}>
              {getTourTypeName(t) || "(unnamed)"}
            </option>
          ))}
        </Select>

        <Select
          label="Sort by"
          value={value.sort}
          onChange={(e) => onChange({ sort: e.target.value })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
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
