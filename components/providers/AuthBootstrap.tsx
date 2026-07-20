"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { setInitialized, setUser } from "@/redux/features/auth/authSlice";
import { useLazyGetMeQuery } from "@/redux/features/auth/authApi";
import { tokenStore } from "@/redux/token";
import { API_BASE_URL } from "@/lib/config";

/**
 * Restores the session on a cold start.
 *
 * With a token in localStorage we just call /user/me. Without one we may still
 * have a valid refreshToken cookie — this is the Google OAuth case, where the
 * backend redirects back having set cookies but no way to hand us a token
 * through the URL. So we attempt a silent refresh before giving up.
 */
export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const [fetchMe] = useLazyGetMeQuery();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const restore = async () => {
      if (!tokenStore.get()) {
        try {
          const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
            method: "POST",
            credentials: "include",
          });
          if (!res.ok) return dispatch(setInitialized());
          const json = await res.json();
          const token = json?.data?.accessToken;
          if (!token) return dispatch(setInitialized());
          tokenStore.set(token);
        } catch {
          return dispatch(setInitialized());
        }
      }

      try {
        const user = await fetchMe().unwrap();
        dispatch(setUser(user));
      } catch {
        tokenStore.clear();
        dispatch(setInitialized());
      }
    };

    void restore();
  }, [dispatch, fetchMe]);

  return null;
}
