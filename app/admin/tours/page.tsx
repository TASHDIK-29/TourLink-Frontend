"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
// Aliased: the unprefixed `Map` icon would shadow the global Map constructor.
import { Map as MapIcon, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  getTourTypeName,
  useDeleteTourMutation,
  useGetToursQuery,
  useGetTourTypesQuery,
} from "@/redux/features/tour/tourApi";
import { useGetDivisionsQuery } from "@/redux/features/division/divisionApi";
import type { ITour } from "@/types";

const PAGE_SIZE = 10;

export default function AdminToursPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching } = useGetToursQuery({
    page,
    limit: PAGE_SIZE,
    ...(search ? { searchTerm: search } : {}),
  });
  const { data: divisions } = useGetDivisionsQuery();
  const { data: tourTypes } = useGetTourTypesQuery();
  const [deleteTour, { isLoading: deleting }] = useDeleteTourMutation();

  const [toDelete, setToDelete] = useState<ITour | null>(null);

  // Tours come back unpopulated — division/tourType are raw ids, so names have
  // to be resolved client-side from the reference lists.
  const divisionNames = useMemo(
    () => new Map(divisions?.map((d) => [d._id, d.name])),
    [divisions],
  );
  const typeNames = useMemo(
    () => new Map(tourTypes?.map((t) => [t._id, getTourTypeName(t)])),
    [tourTypes],
  );

  const tours = data?.tours ?? [];
  const totalPage = data?.meta?.totalPage ?? 1;

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteTour(toDelete._id).unwrap();
      toast.success("Tour deleted");
      setToDelete(null);
      // Stepping back avoids landing on a page that no longer exists.
      if (tours.length === 1 && page > 1) setPage((p) => p - 1);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete the tour"));
    }
  };

  return (
    <>
      <PageHeader
        title="Tours"
        description="Create, edit and remove published tours."
        action={
          <Link href="/admin/tours/new">
            <Button>
              <Plus className="h-4 w-4" />
              New tour
            </Button>
          </Link>
        }
      />

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-card px-4">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by title, description or location…"
          aria-label="Search tours"
          className="h-11 w-full bg-transparent text-sm outline-none"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : !tours.length ? (
        <div className="rounded-card border border-dashed border-border bg-card p-12 text-center">
          <MapIcon className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 font-semibold">
            {search ? "No tours match that search" : "No tours yet"}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            {search
              ? "Try a different term."
              : "Create a division and a tour type first, then add your first tour."}
          </p>
          {!search && (
            <Link href="/admin/tours/new">
              <Button className="mt-5">
                <Plus className="h-4 w-4" />
                New tour
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div
          className={`overflow-hidden rounded-card border border-border bg-card ${
            isFetching ? "opacity-60" : ""
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-border bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Tour</th>
                  <th className="px-4 py-3 font-medium">Division</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Starts</th>
                  <th className="px-4 py-3 font-medium">From</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tours.map((tour) => (
                  <tr key={tour._id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {tour.images?.[0] ? (
                            <Image
                              src={tour.images[0]}
                              alt=""
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                              <MapIcon className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{tour.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {tour.location ?? "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {divisionNames.get(tour.division) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {typeNames.get(tour.tourType) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {tour.startDate
                        ? format(new Date(tour.startDate), "MMM d, yyyy")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">{formatCurrency(tour.costFrom)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {/* Keyed by slug: the backend has no get-tour-by-id
                            route, so the edit page loads via GET /tour/:slug. */}
                        <Link href={`/admin/tours/${tour.slug}/edit`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label={`Edit ${tour.title}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setToDelete(tour)}
                          aria-label={`Delete ${tour.title}`}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPage > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPage}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDelete
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        itemName={toDelete?.title ?? ""}
        description="The tour and its bookings reference will be removed."
      />
    </>
  );
}
