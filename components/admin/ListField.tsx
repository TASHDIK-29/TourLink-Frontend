"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Editor for the tour's string-array fields (included, excluded, amenities,
 * tourPlan). Rows are kept as a controlled array so empty ones can be stripped
 * before submit — the backend stores whatever it's given.
 */
export function ListField({
  label,
  values,
  onChange,
  placeholder,
  addLabel = "Add item",
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}) {
  const update = (index: number, value: string) => {
    const next = [...values];
    next[index] = value;
    onChange(next);
  };

  const remove = (index: number) =>
    onChange(values.filter((_, i) => i !== index));

  return (
    <div className="w-full">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>

      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={value}
              onChange={(e) => update(index, e.target.value)}
              placeholder={placeholder}
              aria-label={`${label} item ${index + 1}`}
              className="h-11 flex-1 rounded-xl border border-input bg-card px-4 text-sm focus:border-ring focus:outline-none"
            />
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label={`Remove ${label} item ${index + 1}`}
              className="rounded-xl px-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => onChange([...values, ""])}
      >
        <Plus className="h-3.5 w-3.5" />
        {addLabel}
      </Button>
    </div>
  );
}
