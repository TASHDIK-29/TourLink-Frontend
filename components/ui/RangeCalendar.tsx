"use client";

import { useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover } from "./Popover";

export interface DateRange {
  from?: Date;
  to?: Date;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const midnight = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * shadcn-style Range Calendar: a date-picker trigger that opens a month grid for
 * selecting a start/end date range. Built on date-fns (no extra dependency).
 * Used for the home search date field and the tour create date range.
 */
export function RangeCalendar({
  value,
  onChange,
  placeholder = "Pick a date range",
  label,
  className,
  align = "start",
  error,
  disablePast = true,
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  align?: "start" | "end";
  error?: string;
  /** Disable selecting days before today (default true). */
  disablePast?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(startOfMonth(value.from ?? new Date()));

  const today = midnight(new Date());
  // Can't page earlier than the current month when past dates are disabled.
  const canGoPrev = !disablePast || isAfter(startOfMonth(month), today);

  const handleDayClick = (day: Date) => {
    const d = midnight(day);
    // No start yet, or a complete range exists -> begin a fresh selection.
    if (!value.from || (value.from && value.to)) {
      onChange({ from: d, to: undefined });
      return;
    }
    // Have a start, picking the end. Clicking before the start restarts instead.
    if (isBefore(d, value.from)) {
      onChange({ from: d, to: undefined });
      return;
    }
    onChange({ from: value.from, to: d });
    setOpen(false);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({});
  };

  const label_ =
    value.from && value.to
      ? `${format(value.from, "MMM d")} – ${format(value.to, "MMM d, yyyy")}`
      : value.from
        ? `${format(value.from, "MMM d, yyyy")} – …`
        : null;

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  });

  const inRange = (d: Date) =>
    value.from && value.to && !isBefore(d, value.from) && !isAfter(d, value.to);

  return (
    <div className="w-full">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </span>
      )}
      <Popover
        open={open}
        onOpenChange={setOpen}
        align={align}
        className={className}
        matchWidth={false}
        panelClassName="p-3"
        trigger={
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className={cn(
              "flex h-12 w-full items-center gap-2 rounded-xl border bg-card px-4 text-sm transition-colors",
              "hover:bg-muted/40 focus:border-ring focus:outline-none",
              error ? "border-destructive" : "border-input",
              open && !error && "border-ring",
            )}
          >
            <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span
              className={cn(
                "flex-1 truncate text-left",
                !label_ && "text-muted-foreground",
              )}
            >
              {label_ ?? placeholder}
            </span>
            {label_ && (
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear dates"
                onClick={clear}
                className="rounded-full p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </span>
            )}
          </button>
        }
      >
        <div className="w-[17rem]">
          {/* Month header */}
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              disabled={!canGoPrev}
              onClick={() => setMonth((m) => subMonths(m, 1))}
              className="rounded-lg p-1.5 hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold">
              {format(month, "MMMM yyyy")}
            </span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setMonth((m) => addMonths(m, 1))}
              className="rounded-lg p-1.5 hover:bg-muted"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday row */}
          <div className="grid grid-cols-7 text-center">
            {WEEKDAYS.map((w) => (
              <span
                key={w}
                className="py-1 text-xs font-medium text-muted-foreground"
              >
                {w}
              </span>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const isFrom = value.from && isSameDay(day, value.from);
              const isTo = value.to && isSameDay(day, value.to);
              const isEndpoint = isFrom || isTo;
              const within = inRange(day) && !isEndpoint;
              const otherMonth = !isSameMonth(day, month);
              const isDisabled = disablePast && isBefore(day, today);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "flex h-9 items-center justify-center text-sm transition-colors",
                    within && "bg-primary/10",
                    isFrom && value.to && "rounded-l-lg",
                    isTo && "rounded-r-lg",
                    !isEndpoint && !within && "rounded-lg",
                    isDisabled
                      ? "cursor-not-allowed text-muted-foreground/30"
                      : isEndpoint
                        ? "bg-primary font-semibold text-primary-foreground"
                        : within
                          ? "text-primary"
                          : otherMonth
                            ? "text-muted-foreground/50 hover:bg-muted"
                            : "hover:bg-muted",
                    isToday(day) &&
                      !isEndpoint &&
                      !isDisabled &&
                      "font-semibold text-primary",
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {value.from && (
            <button
              type="button"
              onClick={() => onChange({})}
              className="mt-3 w-full rounded-lg border border-border py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              Clear
            </button>
          )}
        </div>
      </Popover>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
