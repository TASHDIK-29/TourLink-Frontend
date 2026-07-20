import { baseApi } from "@/redux/baseApi";
import type { ApiResponse, IUser } from "@/types";

export interface UpdateUserPayload {
  name?: string;
  phone?: string;
  address?: string;
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateUser: builder.mutation<
      ApiResponse<IUser>,
      { id: string; payload: UpdateUserPayload }
    >({
      query: ({ id, payload }) => ({
        url: `/user/${id}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useUpdateUserMutation } = userApi;
