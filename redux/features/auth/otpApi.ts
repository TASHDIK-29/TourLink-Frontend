import { baseApi } from "@/redux/baseApi";
import type { ApiResponse } from "@/types";

/**
 * Both routes are public — an unverified user cannot authenticate, so they
 * can't be behind checkAuth. The OTP itself lives in Redis with a 2-minute TTL
 * (OTP_EXPIRATION in otp.service.ts); keep OTP_TTL_SECONDS below in sync.
 */
export const OTP_TTL_SECONDS = 120;

export const otpApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendOtp: builder.mutation<
      ApiResponse<null>,
      { email: string; name?: string }
    >({
      query: (body) => ({ url: "/otp/send", method: "POST", body }),
    }),

    verifyOtp: builder.mutation<
      ApiResponse<null>,
      { email: string; otp: string }
    >({
      query: (body) => ({ url: "/otp/verify", method: "POST", body }),
    }),
  }),
});

export const { useSendOtpMutation, useVerifyOtpMutation } = otpApi;
