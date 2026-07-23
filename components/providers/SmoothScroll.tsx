"use client";

import { ReactLenis } from "lenis/react";

/**
 * Global smooth scrolling via Lenis, attached to the window (`root`). The
 * companion CSS in globals.css (`html.lenis …`) keeps native scroll-behaviour
 * from fighting it. Anything that must keep native scrolling (e.g. a modal's
 * inner scroll area) can opt out with `data-lenis-prevent`.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{ lerp: 0.1, duration: 1.1, smoothWheel: true }}
    >
      {children}
    </ReactLenis>
  );
}
