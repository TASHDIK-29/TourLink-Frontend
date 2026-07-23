"use client";

import { useId, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover } from "./Popover";

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * shadcn-style Select: a button trigger that opens a popover of options with a
 * checkmark on the active one. Controlled via `value` / `onValueChange` (a
 * string, unlike the native <select> Select component this replaces).
 */
export function SelectMenu({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  label,
  className,
  disabled,
  error,
  "aria-label": ariaLabel,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  "aria-label"?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const selected = options.find((o) => o.value === value);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      <Popover
        open={open}
        onOpenChange={setOpen}
        trigger={
          <button
            type="button"
            id={id}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label={ariaLabel}
            onClick={() => setOpen((o) => !o)}
            className={cn(
              "flex h-12 w-full items-center justify-between gap-2 rounded-xl border bg-card px-4 text-sm transition-colors",
              "hover:bg-muted/40 focus:border-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              error ? "border-destructive" : "border-input",
              open && !error && "border-ring",
              className,
            )}
          >
            <span className={cn("truncate", !selected && "text-muted-foreground")}>
              {selected?.label ?? placeholder}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
            />
          </button>
        }
      >
        <ul role="listbox" className="max-h-64 overflow-auto p-1">
          {options.map((option) => {
            const active = option.value === value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onValueChange(option.value);
                    setOpen(false);
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
      </Popover>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
