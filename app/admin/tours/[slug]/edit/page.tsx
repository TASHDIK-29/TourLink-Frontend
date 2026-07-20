"use client";

import Link from "next/link";
import { use } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { TourForm } from "@/components/admin/TourForm";
import { useGetTourBySlugQuery } from "@/redux/features/tour/tourApi";

// Next 16: route `params` is a Promise and must be unwrapped — `use()` in a
// client component, or `await` in a server one.
export default function EditTourPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: tour, isLoading, isError } = useGetTourBySlugQuery(slug);

  return (
    <>
      <Link
        href="/admin/tours"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tours
      </Link>

      <PageHeader
        title="Edit tour"
        description={tour?.title ?? "Loading…"}
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError || !tour ? (
        <p className="rounded-card border border-border bg-card p-8 text-center text-muted-foreground">
          That tour could not be found. It may have been deleted, or its slug
          changed after a title edit.
        </p>
      ) : (
        <TourForm tour={tour} />
      )}
    </>
  );
}
