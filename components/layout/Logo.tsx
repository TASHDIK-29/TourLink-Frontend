import Link from "next/link";
import { Waypoints } from "lucide-react";
import { SITE_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

/**
 * The brand mark, in one place so the four shells (public navbar, footer, auth
 * screens, admin sidebar) can never drift apart.
 *
 * `Waypoints` replaces the old compass: connected nodes read as "link" and as
 * legs of a route, which is the name. The glyph sits in a filled tile so the
 * mark still reads as a logo rather than as one more UI icon on a page that
 * already uses lucide throughout.
 */
export function Logo({
  href = "/",
  size = "md",
  className,
}: {
  /** Pass null to render the mark without wrapping it in a link. */
  href?: string | null;
  size?: "sm" | "md";
  className?: string;
}) {
  const content = (
    <>
      <span
        aria-hidden
        className={cn(
          "flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm",
          size === "sm" ? "h-7 w-7" : "h-9 w-9",
        )}
      >
        <Waypoints className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
      </span>
      <span
        className={cn(
          "font-bold tracking-tight",
          size === "sm" ? "text-base" : "text-lg",
        )}
      >
        {SITE_NAME}
      </span>
    </>
  );

  if (href === null) {
    return (
      <span className={cn("inline-flex items-center gap-2.5", className)}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 transition-opacity hover:opacity-90",
        className,
      )}
    >
      {content}
    </Link>
  );
}
