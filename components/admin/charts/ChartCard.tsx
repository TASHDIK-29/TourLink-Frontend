"use client";

import { useState } from "react";
import { Table2, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

export interface TableColumn {
  header: string;
  /** Right-aligned + tabular figures — use for the measure columns. */
  numeric?: boolean;
}

/**
 * Every chart ships a table-view twin, so no value is reachable only by
 * hovering. The toggle is part of the card chrome, not a per-chart filter.
 */
export function ChartCard({
  title,
  description,
  loading,
  isEmpty,
  emptyMessage = "No data yet.",
  columns,
  rows,
  children,
  className,
}: {
  title: string;
  description?: string;
  loading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  columns: TableColumn[];
  rows: (string | number)[][];
  children: React.ReactNode;
  className?: string;
}) {
  const [showTable, setShowTable] = useState(false);

  return (
    <section
      className={cn(
        "rounded-card border border-border bg-card p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-semibold">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {!loading && !isEmpty && (
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            aria-pressed={showTable}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {showTable ? (
              <BarChart3 className="h-3.5 w-3.5" />
            ) : (
              <Table2 className="h-3.5 w-3.5" />
            )}
            {showTable ? "Chart" : "Table"}
          </button>
        )}
      </div>

      <div className="mt-5">
        {loading ? (
          <Skeleton className="h-56 w-full rounded-xl" />
        ) : isEmpty ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : showTable ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {columns.map((col) => (
                    <th
                      key={col.header}
                      scope="col"
                      className={cn(
                        "pb-2 font-medium text-muted-foreground",
                        col.numeric && "text-right",
                      )}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-border/60 last:border-0">
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={cn(
                          "py-2",
                          columns[j]?.numeric &&
                            "text-right tabular-nums font-medium",
                        )}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
