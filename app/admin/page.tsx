"use client";

import Link from "next/link";
import {
  Ban,
  CheckCircle2,
  Clock,
  Map,
  MapPin,
  Plus,
  RotateCcw,
  Tags,
  Ticket,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/Button";
import { ChartCard } from "@/components/admin/charts/ChartCard";
import { RankedBarChart } from "@/components/admin/charts/RankedBarChart";
import { StatusBar } from "@/components/admin/charts/StatusBar";
import { HeroFigure, StatTile } from "@/components/admin/charts/StatTile";
import { formatCompact, formatCurrency, formatNumber } from "@/lib/utils";
import { useAppSelector } from "@/redux/hooks";
import {
  unwrapAgg,
  useGetBookingStatsQuery,
  useGetPaymentStatsQuery,
  useGetTourStatsQuery,
  useGetUserStatsQuery,
} from "@/redux/features/stats/statsApi";
import type { CountBucket, TourBookingBucket } from "@/types";

/** Aggregations key on the grouped value, which is null when it was missing. */
const bucketLabel = (id: string | null) => id || "Unspecified";

const toRanked = (buckets: CountBucket[] = []) =>
  buckets
    .map((b) => ({ label: bucketLabel(b._id), value: b.count }))
    .sort((a, b) => b.value - a.value);

const toTourRanked = (buckets: TourBookingBucket[] = []) =>
  buckets
    .map((b) => ({
      label: b.tour?.title ?? "Deleted tour",
      value: b.bookingCount,
    }))
    .sort((a, b) => b.value - a.value);

/** Pulls one status count out of a `{_id, count}` aggregation. */
const countOf = (buckets: CountBucket[] = [], status: string) =>
  buckets.find((b) => b._id === status)?.count ?? 0;

export default function AdminOverviewPage() {
  const user = useAppSelector((s) => s.auth.user);

  const { data: bookingStats, isLoading: bookingLoading } =
    useGetBookingStatsQuery();
  const { data: paymentStats, isLoading: paymentLoading } =
    useGetPaymentStatsQuery();
  const { data: userStats, isLoading: userLoading } = useGetUserStatsQuery();
  const { data: tourStats, isLoading: tourLoading } = useGetTourStatsQuery();

  const totalRevenue = unwrapAgg(paymentStats?.totalRevenue, "totalRevenue");
  const avgPayment = unwrapAgg(paymentStats?.avgPaymentAmount, "avgPaymentAMount");
  const avgTourCost = unwrapAgg(tourStats?.avgTourCost, "avgCostFrom");

  const paidCount = countOf(paymentStats?.totalPaymentByStatus, "PAID");

  // Segment order is load-bearing: good → warning → critical → serious is the
  // ordering that clears the CVD and normal-vision separation gates. See the
  // chart-token note in globals.css before reordering.
  const bookingSegments = [
    {
      key: "COMPLETE",
      label: "Complete",
      value: countOf(bookingStats?.totalBookingByStatus, "COMPLETE"),
      color: "var(--chart-good)",
      icon: CheckCircle2,
    },
    {
      key: "PENDING",
      label: "Pending",
      value: countOf(bookingStats?.totalBookingByStatus, "PENDING"),
      color: "var(--chart-warning)",
      icon: Clock,
    },
    {
      key: "FAILED",
      label: "Failed",
      value: countOf(bookingStats?.totalBookingByStatus, "FAILED"),
      color: "var(--chart-critical)",
      icon: XCircle,
    },
    {
      key: "CANCEL",
      label: "Cancelled",
      value: countOf(bookingStats?.totalBookingByStatus, "CANCEL"),
      color: "var(--chart-serious)",
      icon: Ban,
    },
  ];

  const paymentSegments = [
    {
      key: "PAID",
      label: "Paid",
      value: paidCount,
      color: "var(--chart-good)",
      icon: CheckCircle2,
    },
    {
      key: "UNPAID",
      label: "Unpaid",
      value: countOf(paymentStats?.totalPaymentByStatus, "UNPAID"),
      color: "var(--chart-warning)",
      icon: Clock,
    },
    {
      key: "FAILED",
      label: "Failed",
      value: countOf(paymentStats?.totalPaymentByStatus, "FAILED"),
      color: "var(--chart-critical)",
      icon: XCircle,
    },
    {
      key: "CANCELLED",
      label: "Cancelled",
      value: countOf(paymentStats?.totalPaymentByStatus, "CANCELLED"),
      color: "var(--chart-serious)",
      icon: Ban,
    },
    {
      // Refunded is genuinely neutral rather than good/bad, so it takes the
      // de-emphasis gray instead of inventing a fifth status hue.
      key: "REFUNDED",
      label: "Refunded",
      value: countOf(paymentStats?.totalPaymentByStatus, "REFUNDED"),
      color: "var(--chart-neutral)",
      icon: RotateCcw,
    },
  ];

  const accountSegments = [
    {
      key: "ACTIVE",
      label: "Active",
      value: userStats?.totalActiveUsers ?? 0,
      color: "var(--chart-good)",
      icon: CheckCircle2,
    },
    {
      key: "INACTIVE",
      label: "Inactive",
      value: userStats?.totalInActiveUsers ?? 0,
      color: "var(--chart-warning)",
      icon: Clock,
    },
    {
      key: "BLOCKED",
      label: "Blocked",
      value: userStats?.totalBlockedUsers ?? 0,
      color: "var(--chart-critical)",
      icon: Ban,
    },
  ];

  const topTours = toTourRanked(bookingStats?.bookingsPerTour).slice(0, 8);
  const byDivision = toRanked(tourStats?.totalTourByDivision);
  const byType = toRanked(tourStats?.totalTourByTourType);
  const byRole = toRanked(userStats?.usersByRole);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "admin"}`}
        description="How the platform is performing right now."
        action={
          <Link href="/admin/tours/new">
            <Button>
              <Plus className="h-4 w-4" />
              New tour
            </Button>
          </Link>
        }
      />

      <HeroFigure
        label="Total revenue"
        value={formatCurrency(totalRevenue)}
        context={
          paymentLoading
            ? undefined
            : `From ${formatNumber(paidCount)} paid ${
                paidCount === 1 ? "payment" : "payments"
              } · ${formatCurrency(avgPayment)} average transaction`
        }
        loading={paymentLoading}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Bookings"
          value={formatCompact(bookingStats?.totalBooking)}
          context={
            bookingStats
              ? `${formatNumber(bookingStats.bookingsLast7Days)} in the last 7 days`
              : undefined
          }
          icon={Ticket}
          loading={bookingLoading}
        />
        <StatTile
          label="Booking customers"
          value={formatCompact(bookingStats?.totalBookingByUniqueUsers)}
          context={
            bookingStats
              ? `${bookingStats.avgGuestCountPerBooking.toFixed(1)} guests per booking`
              : undefined
          }
          icon={UserCheck}
          loading={bookingLoading}
        />
        <StatTile
          label="Users"
          value={formatCompact(userStats?.totalUsers)}
          context={
            userStats
              ? `${formatNumber(userStats.newUsersInLast30Days)} joined in 30 days`
              : undefined
          }
          icon={Users}
          loading={userLoading}
        />
        <StatTile
          label="Tours"
          value={formatCompact(tourStats?.totalTour)}
          context={
            tourStats ? `${formatCurrency(avgTourCost)} average price` : undefined
          }
          icon={Map}
          loading={tourLoading}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Bookings by status"
          description="Where every booking currently stands."
          loading={bookingLoading}
          isEmpty={!bookingStats?.totalBooking}
          emptyMessage="No bookings recorded yet."
          columns={[{ header: "Status" }, { header: "Bookings", numeric: true }]}
          rows={bookingSegments.map((s) => [s.label, formatNumber(s.value)])}
        >
          <StatusBar segments={bookingSegments} />
        </ChartCard>

        <ChartCard
          title="Payments by status"
          description="Settlement state across all payment records."
          loading={paymentLoading}
          isEmpty={!paymentStats?.totalPayment}
          emptyMessage="No payments recorded yet."
          columns={[{ header: "Status" }, { header: "Payments", numeric: true }]}
          rows={paymentSegments.map((s) => [s.label, formatNumber(s.value)])}
        >
          <StatusBar segments={paymentSegments} />
        </ChartCard>
      </div>

      <div className="mt-4">
        <ChartCard
          title="Most booked tours"
          description="Top 8 by booking count — the leader is highlighted."
          loading={bookingLoading}
          isEmpty={!topTours.length}
          emptyMessage="No tours have been booked yet."
          columns={[{ header: "Tour" }, { header: "Bookings", numeric: true }]}
          rows={topTours.map((t) => [t.label, formatNumber(t.value)])}
        >
          <RankedBarChart
            data={topTours}
            valueLabel="Bookings"
            highlightFirst
          />
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Tours by division"
          description="Catalogue coverage across the country."
          loading={tourLoading}
          isEmpty={!byDivision.length}
          columns={[{ header: "Division" }, { header: "Tours", numeric: true }]}
          rows={byDivision.map((d) => [d.label, formatNumber(d.value)])}
        >
          <RankedBarChart data={byDivision} valueLabel="Tours" />
        </ChartCard>

        <ChartCard
          title="Tours by type"
          description="How the catalogue splits across tour types."
          loading={tourLoading}
          isEmpty={!byType.length}
          columns={[{ header: "Tour type" }, { header: "Tours", numeric: true }]}
          rows={byType.map((t) => [t.label, formatNumber(t.value)])}
        >
          <RankedBarChart data={byType} valueLabel="Tours" />
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Users by role"
          description="Who holds which permissions."
          loading={userLoading}
          isEmpty={!byRole.length}
          columns={[{ header: "Role" }, { header: "Users", numeric: true }]}
          rows={byRole.map((r) => [r.label, formatNumber(r.value)])}
        >
          <RankedBarChart data={byRole} valueLabel="Users" />
        </ChartCard>

        <ChartCard
          title="Account status"
          description="Active, dormant and blocked accounts."
          loading={userLoading}
          isEmpty={!userStats?.totalUsers}
          columns={[{ header: "Status" }, { header: "Users", numeric: true }]}
          rows={accountSegments.map((s) => [s.label, formatNumber(s.value)])}
        >
          <StatusBar segments={accountSegments} />
        </ChartCard>
      </div>

      <div className="mt-8 rounded-card border border-border bg-card p-6">
        <h2 className="font-semibold">Manage the catalogue</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A tour requires both a division and a tour type, so create those first.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/divisions">
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4" />
              Manage divisions
            </Button>
          </Link>
          <Link href="/admin/tour-types">
            <Button variant="outline" size="sm">
              <Tags className="h-4 w-4" />
              Manage tour types
            </Button>
          </Link>
          <Link href="/admin/tours">
            <Button variant="outline" size="sm">
              <Map className="h-4 w-4" />
              Manage tours
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
