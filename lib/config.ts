/**
 * Backend mounts every module under `/api/v1` (see backend `src/app.ts`).
 * API_ORIGIN is the bare origin, needed for full-page redirects such as
 * Google OAuth, which must leave the SPA rather than go through fetch.
 */
export const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://localhost:5000";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? `${API_ORIGIN}/api/v1`;

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "TourLink";

/** Key for the access token in localStorage. */
export const ACCESS_TOKEN_KEY = "tourlink.accessToken";
