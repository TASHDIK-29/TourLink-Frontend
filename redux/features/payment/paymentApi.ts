import { baseApi } from "@/redux/baseApi";
import type { ApiResponse } from "@/types";

/** Re-opening the SSLCommerz gateway for a booking that was never paid for. */
export interface InitPaymentResult {
  paymentUrl: string;
}

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * `POST /payment/init-payment/:bookingId` looks up the Payment record by
     * booking id and asks SSLCommerz for a fresh gateway URL, reusing the
     * ORIGINAL transactionId — so the success/fail callbacks still resolve to
     * the same payment document. Nothing is created, which is why this is safe
     * to call repeatedly on an unpaid booking.
     */
    initPayment: builder.mutation<ApiResponse<InitPaymentResult>, string>({
      query: (bookingId) => ({
        url: `/payment/init-payment/${bookingId}`,
        method: "POST",
      }),
      // The booking's status only changes once the gateway calls back, so
      // there's nothing to invalidate here.
    }),
  }),
});

export const { useInitPaymentMutation } = paymentApi;
