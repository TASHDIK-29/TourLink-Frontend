"use client";

import Link from "next/link";
import { Compass, Luggage, Wallet, Waypoints } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";
import { useAppSelector } from "@/redux/hooks";
import { useGetMyBookingsQuery } from "@/redux/features/booking/bookingApi";

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  const { data, isLoading } = useGetMyBookingsQuery({ limit: 50 });

  const bookings = data?.bookings ?? [];
  const confirmed = bookings.filter((b) => b.status === "COMPLETE").length;
  const totalPaid = bookings
    .filter((b) => b.payment?.status === "PAID")
    .reduce((sum, b) => sum + (b.payment?.amount ?? 0), 0);

  const stats = [
    { label: "Bookings", value: String(bookings.length), icon: Luggage },
    { label: "Confirmed", value: String(confirmed), icon: Compass },
    { label: "Total paid", value: formatCurrency(totalPaid), icon: Wallet },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Hi, {user?.name?.split(" ")[0] ?? "traveller"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s where your trips stand.
          </p>
        </div>
        <Link href="/tours">
          <Button>Browse tours</Button>
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-card border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {stat.label}
              </span>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            {isLoading ? (
              <Skeleton className="mt-2 h-8 w-20" />
            ) : (
              <p className="mt-2 text-2xl font-bold">{stat.value}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-card border border-border bg-card p-6">
        <h2 className="font-semibold">Your bookings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review trips, check payment status and download invoices.
        </p>
        <Link href="/dashboard/bookings">
          <Button variant="outline" size="sm" className="mt-4">
            <Luggage className="h-4 w-4" />
            View all bookings
          </Button>
        </Link>
      </div>

      {/* Only travellers (USER) can apply; guides and admins have their own areas. */}
      {user?.role === "USER" && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-gradient-to-br from-primary/10 to-transparent p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Waypoints className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-semibold">Become a guide</h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Know a region well? Apply to lead tours and share the places you
                love with travellers.
              </p>
            </div>
          </div>
          <Link href="/dashboard/guide">
            <Button size="sm">Apply now</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
