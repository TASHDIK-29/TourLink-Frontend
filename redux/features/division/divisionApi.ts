import { baseApi } from "@/redux/baseApi";
import { buildMultipart } from "@/lib/multipart";
import type { ApiResponse, IDivision } from "@/types";

export interface DivisionPayload {
  name: string;
  description?: string;
}

export const divisionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDivisions: builder.query<IDivision[], void>({
      query: () => "/division",
      // getAllDivisions' controller unwraps to `data: result.data` — flat.
      transformResponse: (res: ApiResponse<IDivision[]>) => res.data ?? [],
      providesTags: ["Division"],
    }),

    getDivisionBySlug: builder.query<IDivision, string>({
      query: (slug) => `/division/${slug}`,
      // getSingleDivision's service returns { data: division } — nested.
      transformResponse: (res: ApiResponse<{ data: IDivision }>) =>
        res.data?.data,
      providesTags: ["Division"],
    }),

    createDivision: builder.mutation<
      ApiResponse<IDivision>,
      { payload: DivisionPayload; file?: File | null }
    >({
      query: ({ payload, file }) => ({
        url: "/division/create",
        method: "POST",
        // multer .single("file") here, vs .array("files") on tours.
        body: buildMultipart(payload, file ? [file] : [], "file"),
      }),
      invalidatesTags: ["Division"],
    }),

    updateDivision: builder.mutation<
      ApiResponse<IDivision>,
      { id: string; payload: DivisionPayload; file?: File | null }
    >({
      query: ({ id, payload, file }) => ({
        url: `/division/${id}`,
        method: "PATCH",
        body: buildMultipart(payload, file ? [file] : [], "file"),
      }),
      invalidatesTags: ["Division"],
    }),

    deleteDivision: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/division/${id}`, method: "DELETE" }),
      invalidatesTags: ["Division"],
    }),
  }),
});

export const {
  useGetDivisionsQuery,
  useGetDivisionBySlugQuery,
  useCreateDivisionMutation,
  useUpdateDivisionMutation,
  useDeleteDivisionMutation,
} = divisionApi;
