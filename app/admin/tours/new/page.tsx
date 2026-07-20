"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { TourForm } from "@/components/admin/TourForm";

export default function NewTourPage() {
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
        title="New tour"
        description="Images are uploaded to Cloudinary when you save."
      />

      <TourForm />
    </>
  );
}
