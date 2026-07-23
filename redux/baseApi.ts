import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { API_BASE_URL } from "@/lib/config";
import { tokenStore } from "./token";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  // Required so the httpOnly refreshToken cookie rides along on /auth/refresh-token.
  credentials: "include",
  prepareHeaders: (headers) => {
    // An endpoint that sets Authorization itself wins. fetchBaseQuery seeds
    // `headers` from the endpoint's own `headers` before calling this, so
    // without this guard the stored session token would clobber it — which
    // breaks /auth/reset-password, whose credential is the short-lived token
    // from the emailed link, not the current session.
    if (headers.has("Authorization")) return headers;

    const token = tokenStore.get();
    if (token) {
      // NOTE: backend `checkAuth` reads req.headers.authorization and passes it
      // straight to verifyToken — it does NOT strip a "Bearer " prefix.
      headers.set("Authorization", token);
    }
    return headers;
  },
});

/** Serialises concurrent 401s so only one refresh request is in flight. */
const refreshMutex = new Mutex();

export const baseQueryWithRefresh: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await refreshMutex.waitForUnlock();
  let result = await rawBaseQuery(args, api, extraOptions);

  // checkAuth throws 403 for a missing token and the JWT layer surfaces 401 for
  // an expired one, so both are worth a refresh attempt.
  const status = result.error?.status;
  const shouldRefresh = status === 401 || status === 403;

  if (shouldRefresh && !refreshMutex.isLocked()) {
    const release = await refreshMutex.acquire();
    try {
      const refresh = await rawBaseQuery(
        { url: "/auth/refresh-token", method: "POST" },
        api,
        extraOptions,
      );
      const newToken = (
        refresh.data as { data?: { accessToken?: string } } | undefined
      )?.data?.accessToken;

      if (newToken) {
        tokenStore.set(newToken);
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        tokenStore.clear();
      }
    } finally {
      release();
    }
  } else if (shouldRefresh) {
    // Another call is already refreshing — wait for it, then retry once.
    await refreshMutex.waitForUnlock();
    result = await rawBaseQuery(args, api, extraOptions);
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithRefresh,
  tagTypes: [
    "User",
    "Tour",
    "TourType",
    "Division",
    "Booking",
    "Stats",
    "Guide",
  ],
  endpoints: () => ({}),
});
