import { baseApi } from "@/redux/baseApi";
import type {
  ApiResponse,
  BookingStats,
  PaymentStats,
  TourStats,
  UserStats,
} from "@/types";

/**
 * All four stats controllers send `data: stats` — flat, no double nesting.
 * ADMIN / SUPER_ADMIN only (checkAuth on every route).
 */
export const statsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserStats: builder.query<UserStats, void>({
      query: () => "/stats/user",
      transformResponse: (res: ApiResponse<UserStats>) => res.data,
      providesTags: ["Stats"],
    }),

    getTourStats: builder.query<TourStats, void>({
      query: () => "/stats/tour",
      transformResponse: (res: ApiResponse<TourStats>) => res.data,
      providesTags: ["Stats"],
    }),

    getBookingStats: builder.query<BookingStats, void>({
      query: () => "/stats/booking",
      transformResponse: (res: ApiResponse<BookingStats>) => res.data,
      providesTags: ["Stats"],
    }),

    getPaymentStats: builder.query<PaymentStats, void>({
      query: () => "/stats/payment",
      transformResponse: (res: ApiResponse<PaymentStats>) => res.data,
      providesTags: ["Stats"],
    }),
  }),
});

export const {
  useGetUserStatsQuery,
  useGetTourStatsQuery,
  useGetBookingStatsQuery,
  useGetPaymentStatsQuery,
} = statsApi;

/**
 * `$group: { _id: null }` aggregations come back as `[{ _id: null, x: n }]`,
 * or `[]` when the collection is empty. Pulls the measure out of either.
 */
export const unwrapAgg = <T extends object>(
  rows: T[] | undefined,
  key: keyof T,
): number => Number(rows?.[0]?.[key] ?? 0);
