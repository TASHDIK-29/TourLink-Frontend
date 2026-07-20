"use client";

import { use } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { TourDetail } from "@/components/tours/TourDetail";

// Next 16: `params` is a Promise. `use()` unwraps it in a client component.
export default function TourDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  // The one route that carries its path across sign-in: a visitor sent here
  // from a shared link lands back on THIS tour after logging in.
  return (
    <AuthGuard preserveTarget>
      <TourDetail slug={slug} />
    </AuthGuard>
  );
}
