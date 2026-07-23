"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

// useLayoutEffect warns during SSR; fall back to useEffect on the server.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Controlled popover primitive. The panel is rendered in a portal to
 * document.body with fixed positioning, so it escapes any ancestor
 * `overflow-hidden` or stacking context (e.g. the animated hero) instead of
 * being clipped or painted underneath later sections. Position is written
 * imperatively (no setState) to satisfy the set-state-in-effect rule. Closes on
 * outside-click or Escape. Shared by SelectMenu, Combobox and RangeCalendar.
 */
export function Popover({
  open,
  onOpenChange,
  trigger,
  children,
  align = "start",
  matchWidth = true,
  className,
  panelClassName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end";
  /** Force the panel to be at least as wide as the trigger. */
  matchWidth?: boolean;
  className?: string;
  panelClassName?: string;
}) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const position = useCallback(() => {
    const el = triggerRef.current;
    const panel = panelRef.current;
    if (!el || !panel) return;
    const r = el.getBoundingClientRect();
    panel.style.top = `${r.bottom + 8}px`;
    if (align === "end") {
      panel.style.right = `${window.innerWidth - r.right}px`;
      panel.style.left = "auto";
    } else {
      panel.style.left = `${r.left}px`;
      panel.style.right = "auto";
    }
    if (matchWidth) panel.style.minWidth = `${r.width}px`;
  }, [align, matchWidth]);

  // Place the panel before paint so it never flashes at the top-left.
  useIsoLayoutEffect(() => {
    if (open) position();
  }, [open, position]);

  useEffect(() => {
    if (!open) return;

    const onScroll = () => position();
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      onOpenChange(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };

    // capture:true so scrolling inside any container repositions the panel.
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange, position]);

  return (
    <div ref={triggerRef} className={cn("relative", className)}>
      {trigger}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: "fixed", top: 0, left: 0 }}
            className={cn(
              "z-50 overflow-hidden rounded-xl border border-border bg-card shadow-lg",
              panelClassName,
            )}
          >
            {children}
          </div>,
          document.body,
        )}
    </div>
  );
}
