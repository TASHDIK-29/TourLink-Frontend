import { baseApi } from "@/redux/baseApi";
import type {
  ApiResponse,
  IBooking,
  BookingStatus,
  GuideCategory,
} from "@/types";

export interface CreateBookingPayload {
  tour: string;
  guestCount: number;
  guideCategory: GuideCategory;
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

    // Trips a guide is assigned to lead (their own dashboard).
    getGuideAssignments: builder.query<
      BookingListResult,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/booking/guide-assignments",
        params: params ?? undefined,
      }),
      transformResponse: (res: ApiResponse<IBooking[]>) => ({
        bookings: res.data ?? [],
        meta: res.meta,
      }),
      providesTags: ["Booking"],
    }),

    // Admin manually (re)assigns the guide leading a booking.
    assignGuideToBooking: builder.mutation<
      ApiResponse<IBooking>,
      { id: string; guideId: string }
    >({
      query: ({ id, guideId }) => ({
        url: `/booking/${id}/assign-guide`,
        method: "PATCH",
        body: { guideId },
      }),
      // Crediting/assigning touches guide counters too.
      invalidatesTags: ["Booking", "Guide"],
    }),

    // Admin credits the trip to the assigned guide's guiding count.
    confirmGuiding: builder.mutation<ApiResponse<IBooking>, string>({
      query: (id) => ({
        url: `/booking/${id}/confirm-guiding`,
        method: "PATCH",
      }),
      invalidatesTags: ["Booking", "Guide"],
    }),
  }),
});

export const {
  useCreateBookingMutation,
  useGetMyBookingsQuery,
  useGetBookingByIdQuery,
  useUpdateBookingStatusMutation,
  useGetAllBookingsQuery,
  useGetGuideAssignmentsQuery,
  useAssignGuideToBookingMutation,
  useConfirmGuidingMutation,
} = bookingApi;
