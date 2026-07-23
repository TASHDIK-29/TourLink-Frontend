"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover } from "./Popover";

export interface ComboboxOption {
  value: string;
  label: string;
  /** Extra text matched by the search box but not shown as the label. */
  keywords?: string;
}

/**
 * shadcn-style Combobox: a trigger button that opens a popover with a search box
 * and a filtered list. Selecting an option calls `onSelect`. Used for the search
 * fields on the home, tours and destinations pages.
 */
export function Combobox({
  options,
  value,
  onSelect,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No results found.",
  className,
  triggerClassName,
  icon,
}: {
  options: ComboboxOption[];
  value?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  triggerClassName?: string;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.keywords?.toLowerCase().includes(q),
    );
  }, [options, query]);

  return (
    <Popover
      className={className}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
      trigger={
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex h-12 w-full items-center gap-2 rounded-xl border border-input bg-card px-4 text-sm transition-colors",
            "hover:bg-muted/40 focus:border-ring focus:outline-none",
            open && "border-ring",
            triggerClassName,
          )}
        >
          {icon ?? <Search className="h-4 w-4 shrink-0 text-muted-foreground" />}
          <span
            className={cn(
              "flex-1 truncate text-left",
              !selected && "text-muted-foreground",
            )}
          >
            {selected?.label ?? placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      }
    >
      <div className="flex items-center gap-2 border-b border-border px-3">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="px-3 py-6 text-center text-sm text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        <ul role="listbox" className="max-h-64 overflow-auto p-1">
          {filtered.map((option) => {
            const active = option.value === value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onSelect(option.value);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    active ? "bg-primary/10 text-primary" : "hover:bg-muted",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {active && <Check className="h-4 w-4 shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Popover>
  );
}
