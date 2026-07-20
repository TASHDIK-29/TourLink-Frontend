import { baseApi } from "@/redux/baseApi";
import type { ApiResponse, IUser, LoginResponse } from "@/types";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<ApiResponse<IUser>, RegisterPayload>({
      query: (body) => ({ url: "/user/register", method: "POST", body }),
    }),

    login: builder.mutation<ApiResponse<LoginResponse>, LoginPayload>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: ["User"],
    }),

    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: ["User"],
    }),

    /** NOTE: getMe's controller returns `result.data`, so the user nests one deeper. */
    getMe: builder.query<IUser, void>({
      query: () => "/user/me",
      transformResponse: (res: ApiResponse<{ data: IUser } | IUser>) => {
        const payload = res.data as { data?: IUser } & IUser;
        return (payload?.data ?? payload) as IUser;
      },
      providesTags: ["User"],
    }),

    forgotPassword: builder.mutation<ApiResponse<null>, { email: string }>({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),

    changePassword: builder.mutation<
      ApiResponse<null>,
      { oldPassword: string; newPassword: string }
    >({
      query: (body) => ({ url: "/auth/change-password", method: "POST", body }),
    }),

    /**
     * The reset link emailed by /auth/forgot-password carries `id` and a
     * 10-minute `token`. The route is behind `checkAuth`, so that token has to
     * ride in the Authorization header (raw, no "Bearer " prefix) — it is the
     * credential here, NOT the current session. `baseApi.prepareHeaders` yields
     * to an explicitly-set Authorization for exactly this case.
     */
    resetPassword: builder.mutation<
      ApiResponse<null>,
      { id: string; newPassword: string; token: string }
    >({
      query: ({ id, newPassword, token }) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: { id, newPassword },
        headers: { Authorization: token },
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useForgotPasswordMutation,
  useChangePasswordMutation,
  useResetPasswordMutation,
} = authApi;
