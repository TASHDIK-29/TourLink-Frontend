"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Compass, Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TourCard, TourCardSkeleton } from "./TourCard";
import { TourFilters, MobileFilterBar, SORT_OPTIONS } from "./TourFilters";
import { useGetToursQuery } from "@/redux/features/tour/tourApi";

const PAGE_SIZE = 12;
const DEFAULT_SORT = SORT_OPTIONS[0].value;

export function ToursBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchTerm = searchParams.get("searchTerm") ?? "";
  const division = searchParams.get("division") ?? "";
  const tourType = searchParams.get("tourType") ?? "";
  const sort = searchParams.get("sort") ?? DEFAULT_SORT;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  // Local mirror so typing feels instant; the URL updates on a debounce below.
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Keep the box in sync when the URL changes from elsewhere (hero, back button).
  const [lastSynced, setLastSynced] = useState(searchTerm);
  if (lastSynced !== searchTerm) {
    setLastSynced(searchTerm);
    setSearchInput(searchTerm);
  }

  const setParams = (patch: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === "" || value === 1) next.delete(key);
      else next.set(key, String(value));
    }
    // Any filter change invalidates the current page offset.
    if (!("page" in patch)) next.delete("page");
    router.push(`/tours${next.toString() ? `?${next}` : ""}`, { scroll: false });
  };

  // Debounce search so each keystroke isn't a request + history entry.
  useEffect(() => {
    if (searchInput === searchTerm) return;
    const timer = setTimeout(() => setParams({ searchTerm: searchInput }), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const { data, isLoading, isFetching, isError } = useGetToursQuery({
    page,
    limit: PAGE_SIZE,
    sort,
    ...(searchTerm ? { searchTerm } : {}),
    ...(division ? { division } : {}),
    ...(tourType ? { tourType } : {}),
  });

  const tours = data?.tours ?? [];
  const isFiltered = Boolean(searchTerm || division || tourType);

  /*
   * Pagination is derived from the page contents, NOT meta.totalPage.
   *
   * The backend's QueryBuilder.getMeta() runs countDocuments() with no filter,
   * so meta.total/totalPage describe the whole collection and are wrong the
   * moment a search or filter is applied — trusting them would offer pages
   * that come back empty. A full page implies there may be another.
   */
  const hasNextPage = tours.length === PAGE_SIZE;
  const activeFilterCount = [division, tourType].filter(Boolean).length;

  const resultsLabel = isFiltered
    ? undefined // meta.total is unfiltered, so any count here would be a lie.
    : data?.meta?.total != null
      ? `${data.meta.total} tour${data.meta.total === 1 ? "" : "s"} available`
      : undefined;

  const filterState = { division, tourType, sort };
  const handleFilterChange = (patch: Partial<typeof filterState>) =>
    setParams(patch);
  const handleReset = () => setParams({ division: "", tourType: "" });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">Browse tours</h1>
        <p className="mt-2 text-muted-foreground">
          {isFiltered
            ? "Showing tours that match your filters."
            : "Every trip currently on offer."}
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex min-w-64 flex-1 items-center gap-2 rounded-full border border-border bg-card px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search tours, places, activities…"
            aria-label="Search tours"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              aria-label="Clear search"
              className="rounded-full p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <MobileFilterBar
          onOpen={() => setFiltersOpen(true)}
          activeCount={activeFilterCount}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <TourFilters
              value={filterState}
              onChange={handleFilterChange}
              onReset={handleReset}
              resultsLabel={resultsLabel}
            />
          </div>
        </div>

        <div>
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <TourCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <EmptyBox
              title="Couldn't load tours"
              body="The server didn't respond as expected. Please try again shortly."
            />
          ) : !tours.length ? (
            <EmptyBox
              title={isFiltered ? "No tours match those filters" : "No tours yet"}
              body={
                isFiltered
                  ? "Try widening your search or clearing a filter."
                  : "Check back soon — new trips are added regularly."
              }
              action={
                isFiltered ? (
                  <Button
                    variant="outline"
                    onClick={() =>
                      setParams({ searchTerm: "", division: "", tourType: "" })
                    }
                  >
                    Clear all filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <div
                className={`grid gap-6 sm:grid-cols-2 xl:grid-cols-3 ${
                  isFetching ? "opacity-60 transition-opacity" : ""
                }`}
              >
                {tours.map((tour, i) => (
                  <TourCard key={tour._id} tour={tour} index={i} />
                ))}
              </div>

              {(page > 1 || hasNextPage) && (
                <div className="mt-10 flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    disabled={page <= 1 || isFetching}
                    onClick={() => setParams({ page: page - 1 })}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page}
                  </span>
                  <Button
                    variant="outline"
                    disabled={!hasNextPage || isFetching}
                    onClick={() => setParams({ page: page + 1 })}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
      >
        <TourFilters
          value={filterState}
          onChange={handleFilterChange}
          onReset={handleReset}
        />
        <Button className="mt-4 w-full" onClick={() => setFiltersOpen(false)}>
          Show results
        </Button>
      </Modal>
    </div>
  );
}

function EmptyBox({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-dashed border-border bg-card p-12 text-center">
      <Compass className="mx-auto h-8 w-8 text-muted-foreground" />
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        {body}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
