"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

export interface StatusSegment {
  key: string;
  label: string;
  value: number;
  /** A chart status token: var(--chart-good) etc. */
  color: string;
  icon: LucideIcon;
}

/**
 * Part-to-whole across a handful of states, as one horizontal stacked bar.
 *
 * Hand-rolled rather than charted: a single stacked bar needs exact 2px gaps in
 * the SURFACE color between segments (the spacer that separates touching
 * marks — never a stroke around them), which flex `gap` gives precisely.
 *
 * Status colors are used because these values genuinely mean good/bad, and each
 * one ships with an icon + text label in the legend so state never rides on hue
 * alone. Segment order is fixed by the caller and must stay good → warning →
 * critical → serious; see the note in globals.css.
 */
export function StatusBar({ segments }: { segments: StatusSegment[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const present = segments.filter((s) => s.value > 0);

  if (!total) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Nothing recorded yet.
      </p>
    );
  }

  const pct = (value: number) => (value / total) * 100;

  return (
    <div>
      <div
        className="flex h-11 w-full gap-0.5 overflow-hidden"
        role="img"
        aria-label={present
          .map((s) => `${s.label}: ${s.value} of ${total}`)
          .join(", ")}
      >
        {present.map((segment, i) => {
          const share = pct(segment.value);
          // Only label inside the segment when the text comfortably fits;
          // otherwise the legend and table carry it. Never clipped.
          const fits = share >= 11;
          return (
            <div
              key={segment.key}
              onMouseEnter={() => setHovered(segment.key)}
              onMouseLeave={() => setHovered(null)}
              style={{ width: `${share}%`, background: segment.color }}
              className={cn(
                "relative flex items-center justify-center transition-opacity",
                i === 0 && "rounded-l",
                i === present.length - 1 && "rounded-r",
                hovered && hovered !== segment.key && "opacity-55",
              )}
            >
              {fits && (
                // Set inside a colored fill — white clears contrast on all four
                // status steps, so this is the documented exception to
                // "text never wears the data color".
                <span className="px-2 text-xs font-semibold text-white">
                  {Math.round(share)}%
                </span>
              )}

              {hovered === segment.key && (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-border bg-card px-3 py-2 text-sm shadow-lg">
                  <p className="font-medium">{segment.label}</p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold tabular-nums text-foreground">
                      {formatNumber(segment.value)}
                    </span>{" "}
                    · {share.toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend doubles as the value readout, so no number is hover-gated. */}
      <ul className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {segments.map((segment) => (
          <li
            key={segment.key}
            className="flex items-center gap-2 text-sm"
            onMouseEnter={() => setHovered(segment.key)}
            onMouseLeave={() => setHovered(null)}
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: segment.color }}
            />
            <segment.icon
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
            />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">
              {segment.label}
            </span>
            <span className="shrink-0 font-semibold tabular-nums">
              {formatNumber(segment.value)}
            </span>
            <span className="w-12 shrink-0 text-right tabular-nums text-muted-foreground">
              {segment.value ? `${pct(segment.value).toFixed(0)}%` : "—"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
