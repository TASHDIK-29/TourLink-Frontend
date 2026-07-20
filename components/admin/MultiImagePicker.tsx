"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { ImagePlus, RotateCcw, X } from "lucide-react";

/**
 * Manages tour images across two sources.
 *
 * On update the backend APPENDS uploaded files to the existing array, and
 * separately removes any URL listed in `deleteImages` (then deletes it from
 * Cloudinary). So removing an existing image is a staged intent, not an
 * immediate action — hence the undo affordance.
 */
export function MultiImagePicker({
  files,
  onFilesChange,
  existingUrls = [],
  markedForDeletion = [],
  onToggleDelete,
}: {
  files: File[];
  onFilesChange: (files: File[]) => void;
  existingUrls?: string[];
  markedForDeletion?: string[];
  onToggleDelete?: (url: string) => void;
}) {
  // Derived during render rather than stored in state: object URLs are a pure
  // function of `files`, so an effect + setState would only add a render pass.
  // The effect exists solely to revoke them and avoid leaking blob URLs.
  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  );

  useEffect(
    () => () => previews.forEach((url) => URL.revokeObjectURL(url)),
    [previews],
  );

  return (
    <div className="w-full">
      <span className="mb-1.5 block text-sm font-medium">Images</span>

      <div className="flex flex-wrap gap-3">
        {existingUrls.map((url) => {
          const marked = markedForDeletion.includes(url);
          return (
            <div
              key={url}
              className="relative h-24 w-32 overflow-hidden rounded-xl border border-border bg-muted"
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="128px"
                className={marked ? "object-cover opacity-30" : "object-cover"}
              />
              <button
                type="button"
                onClick={() => onToggleDelete?.(url)}
                aria-label={marked ? "Keep this image" : "Remove this image"}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
              >
                {marked ? (
                  <RotateCcw className="h-3 w-3" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </button>
              {marked && (
                <span className="absolute inset-x-0 bottom-0 bg-destructive/90 py-0.5 text-center text-[10px] font-medium text-white">
                  Will be removed
                </span>
              )}
            </div>
          );
        })}

        {previews.map((src, index) => (
          <div
            key={src}
            className="relative h-24 w-32 overflow-hidden rounded-xl border border-primary bg-muted"
          >
            {/* Blob URLs can't go through the Next image optimizer. */}
            <Image
              src={src}
              alt=""
              fill
              sizes="128px"
              unoptimized
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => onFilesChange(files.filter((_, i) => i !== index))}
              aria-label={`Remove new image ${index + 1}`}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            >
              <X className="h-3 w-3" />
            </button>
            <span className="absolute inset-x-0 bottom-0 bg-primary/90 py-0.5 text-center text-[10px] font-medium text-white">
              New
            </span>
          </div>
        ))}

        <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-muted-foreground hover:bg-muted">
          <ImagePlus className="h-5 w-5" />
          <span className="text-xs font-medium">Add images</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              const picked = Array.from(e.target.files ?? []);
              if (picked.length) onFilesChange([...files, ...picked]);
              // Reset so picking the same file twice still fires onChange.
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}
