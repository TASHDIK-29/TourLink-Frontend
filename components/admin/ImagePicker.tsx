"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Single-image picker with an object-URL preview (used for division thumbnails). */
export function ImagePicker({
  file,
  onChange,
  existingUrl,
  label = "Thumbnail",
  hint,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  existingUrl?: string;
  label?: string;
  hint?: string;
}) {
  // Derived during render — the URL is a pure function of `file`, so state plus
  // an effect would only add a render pass. The effect just revokes it, since
  // object URLs leak unless released when the file changes or on unmount.
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const shown = preview ?? existingUrl;

  return (
    <div className="w-full">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>

      <div className="flex items-center gap-4">
        <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
          {shown ? (
            <Image
              src={shown}
              alt=""
              fill
              sizes="128px"
              className="object-cover"
              unoptimized={Boolean(preview)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ImagePlus className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <label
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-full border border-border",
              "bg-card px-4 py-2 text-sm font-medium hover:bg-muted",
            )}
          >
            <ImagePlus className="h-4 w-4" />
            {shown ? "Replace image" : "Choose image"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            />
          </label>

          {file && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="ml-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}

          {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
