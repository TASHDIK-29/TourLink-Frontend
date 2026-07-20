import { ACCESS_TOKEN_KEY } from "@/lib/config";

/**
 * The access token lives in localStorage rather than Redux alone so a refresh
 * doesn't log the user out. The refresh token is an httpOnly cookie owned by
 * the backend and is never readable here.
 */
export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  set(token: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};
