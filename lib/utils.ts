import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount?: number | null) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Thousands-separated integer — for axis ticks and table cells. */
export function formatNumber(value?: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

/** Compact form for stat-tile and hero values: 1,284 / 12.9K / 4.2M. */
export function formatCompact(value?: number | null) {
  if (value == null) return "—";
  if (Math.abs(value) < 10_000) return formatNumber(value);
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
