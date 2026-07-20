import { baseApi } from "@/redux/baseApi";
import type { ApiResponse, IBooking, BookingStatus } from "@/types";

export interface CreateBookingPayload {
  tour: string;
  guestCount: number;
}

/** createBooking returns the SSLCommerz gateway URL alongside the booking. */
export interface CreateBookingResult {
  paymentUrl: string;
  booking: IBooking;
}

export interface BookingListResult {
  bookings: IBooking[];
  meta?: ApiResponse<IBooking[]>["meta"];
}

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBooking: builder.mutation<
      ApiResponse<CreateBookingResult>,
      CreateBookingPayload
    >({
      query: (body) => ({ url: "/booking", method: "POST", body }),
      invalidatesTags: ["Booking"],
    }),

    getMyBookings: builder.query<
      BookingListResult,
      { page?: number; limit?: number; status?: BookingStatus } | void
    >({
      query: (params) => ({
        url: "/booking/my-bookings",
        params: params ?? undefined,
      }),
      transformResponse: (res: ApiResponse<IBooking[]>) => ({
        bookings: res.data ?? [],
        meta: res.meta,
      }),
      providesTags: ["Booking"],
    }),

    getBookingById: builder.query<IBooking, string>({
      query: (id) => `/booking/${id}`,
      transformResponse: (res: ApiResponse<IBooking>) => res.data,
      providesTags: ["Booking"],
    }),

    updateBookingStatus: builder.mutation<
      ApiResponse<IBooking>,
      { id: string; status: BookingStatus }
    >({
      query: ({ id, status }) => ({
        url: `/booking/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Booking"],
    }),

    getAllBookings: builder.query<
      BookingListResult,
      { page?: number; limit?: number; status?: BookingStatus } | void
    >({
      query: (params) => ({ url: "/booking", params: params ?? undefined }),
      transformResponse: (res: ApiResponse<IBooking[]>) => ({
        bookings: res.data ?? [],
        meta: res.meta,
      }),
      providesTags: ["Booking"],
    }),
  }),
});

export const {
  useCreateBookingMutation,
  useGetMyBookingsQuery,
  useGetBookingByIdQuery,
  useUpdateBookingStatusMutation,
  useGetAllBookingsQuery,
} = bookingApi;
