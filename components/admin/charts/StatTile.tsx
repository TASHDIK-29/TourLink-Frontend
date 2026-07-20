"use client";

import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

/**
 * Stat tile: label · value · optional context line.
 *
 * Values use PROPORTIONAL figures — `tabular-nums` is for columns that align
 * vertically (the table view, axis ticks), and makes a big standalone number
 * look loose.
 */
export function StatTile({
  label,
  value,
  context,
  icon: Icon,
  loading,
  className,
}: {
  label: string;
  value: string;
  context?: string;
  icon: LucideIcon;
  loading?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-card p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>

      {loading ? (
        <Skeleton className="mt-2 h-8 w-20" />
      ) : (
        <p className="mt-2 text-2xl font-bold">{value}</p>
      )}

      {context && !loading && (
        <p className="mt-1 text-xs text-muted-foreground">{context}</p>
      )}
    </div>
  );
}

/**
 * The one number the dashboard leads with. Exactly one per view, ≥48px, in the
 * same sans as everything else — a display face here reads as decoration.
 */
export function HeroFigure({
  label,
  value,
  context,
  loading,
}: {
  label: string;
  value: string;
  context?: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-card border border-border bg-card p-6 sm:p-8">
      <p className="text-sm text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="mt-3 h-14 w-64" />
      ) : (
        <p className="mt-2 text-5xl font-bold leading-tight sm:text-6xl">
          {value}
        </p>
      )}
      {context && !loading && (
        <p className="mt-2 text-sm text-muted-foreground">{context}</p>
      )}
    </div>
  );
}
