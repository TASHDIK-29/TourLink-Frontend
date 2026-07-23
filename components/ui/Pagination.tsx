"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Builds the compact page list: always first + last, the current page and its
 * neighbours, with "ellipsis" markers standing in for the gaps.
 */
function getPageItems(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  const wanted = new Set<number>([
    1,
    total,
    current,
    current - 1,
    current + 1,
  ]);
  const pages = [...wanted]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const items: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const p of pages) {
    if (p - prev > 1) items.push("ellipsis");
    items.push(p);
    prev = p;
  }
  return items;
}

const linkBase =
  "inline-flex h-9 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

/**
 * Client-side pagination in the shadcn style (nav > ul > li), driven by state
 * rather than URLs — pass the current page, total pages and a change handler.
 * Renders nothing when there's a single page.
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const items = getPageItems(page, totalPages);

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
    >
      <ul className="flex flex-row items-center gap-1">
        <li>
          <button
            type="button"
            aria-label="Go to previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className={cn(linkBase, "gap-1 px-2.5 hover:bg-muted")}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>
        </li>

        {items.map((item, i) =>
          item === "ellipsis" ? (
            <li key={`e-${i}`}>
              <span
                aria-hidden
                className="flex h-9 w-9 items-center justify-center text-muted-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More pages</span>
              </span>
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                aria-label={`Go to page ${item}`}
                aria-current={item === page ? "page" : undefined}
                onClick={() => onPageChange(item)}
                className={cn(
                  linkBase,
                  "w-9",
                  item === page
                    ? "border border-input bg-background shadow-sm"
                    : "hover:bg-muted",
                )}
              >
                {item}
              </button>
            </li>
          ),
        )}

        <li>
          <button
            type="button"
            aria-label="Go to next page"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className={cn(linkBase, "gap-1 px-2.5 hover:bg-muted")}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
