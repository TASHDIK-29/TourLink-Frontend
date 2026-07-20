import { baseApi } from "@/redux/baseApi";
import { buildMultipart } from "@/lib/multipart";
import type { ApiResponse, ITour, ITourType } from "@/types";

export interface TourQuery {
  searchTerm?: string;
  division?: string;
  tourType?: string;
  page?: number;
  limit?: number;
  sort?: string;
  fields?: string;
}

export interface TourListResult {
  tours: ITour[];
  meta?: ApiResponse<ITour[]>["meta"];
}

/** The JSON half of a tour create/update — everything except the image files. */
export interface TourPayload {
  title: string;
  division: string;
  tourType: string;
  description?: string;
  location?: string;
  costFrom?: number;
  startDate?: string;
  endDate?: string;
  departureLocation?: string;
  arrivalLocation?: string;
  included?: string[];
  excluded?: string[];
  amenities?: string[];
  tourPlan?: string[];
  maxGuest?: number;
  minAge?: number;
  /** Update only: existing Cloudinary URLs to remove. */
  deleteImages?: string[];
}

export const tourApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTours: builder.query<TourListResult, TourQuery | void>({
      query: (params) => ({ url: "/tour", params: params ?? undefined }),
      // getAllTours' controller unwraps to `data: result.data`, so this one is flat.
      transformResponse: (res: ApiResponse<ITour[]>) => ({
        tours: res.data ?? [],
        meta: res.meta,
      }),
      providesTags: ["Tour"],
    }),

    getTourBySlug: builder.query<ITour, string>({
      query: (slug) => `/tour/${slug}`,
      // getSingleTour's service returns { data: tour } and the controller passes
      // that straight through, so the tour sits at data.data.
      transformResponse: (res: ApiResponse<{ data: ITour }>) => res.data?.data,
      providesTags: ["Tour"],
    }),

    createTour: builder.mutation<
      ApiResponse<ITour>,
      { payload: TourPayload; files: File[] }
    >({
      query: ({ payload, files }) => ({
        url: "/tour/create",
        method: "POST",
        body: buildMultipart(payload, files, "files"),
      }),
      invalidatesTags: ["Tour"],
    }),

    updateTour: builder.mutation<
      ApiResponse<ITour>,
      { id: string; payload: Partial<TourPayload>; files?: File[] }
    >({
      query: ({ id, payload, files = [] }) => ({
        url: `/tour/${id}`,
        method: "PATCH",
        body: buildMultipart(payload, files, "files"),
      }),
      invalidatesTags: ["Tour"],
    }),

    deleteTour: builder.mutation<ApiResponse<ITour>, string>({
      query: (id) => ({ url: `/tour/${id}`, method: "DELETE" }),
      invalidatesTags: ["Tour"],
    }),

    getTourTypes: builder.query<ITourType[], void>({
      query: () => "/tour/tour-types",
      // getAllTourTypes' controller sends `data: result` where result is
      // { data, meta } — unlike getAllTours, it does NOT unwrap. Hence data.data.
      transformResponse: (res: ApiResponse<{ data: ITourType[] }>) =>
        res.data?.data ?? [],
      providesTags: ["TourType"],
    }),

    // Tour types are plain JSON (no multer on these routes). The validation
    // schema expects `name` even though the model field is `tourName`.
    createTourType: builder.mutation<ApiResponse<ITourType>, { name: string }>({
      query: (body) => ({
        url: "/tour/create-tour-type",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TourType"],
    }),

    updateTourType: builder.mutation<
      ApiResponse<ITourType>,
      { id: string; name: string }
    >({
      query: ({ id, name }) => ({
        url: `/tour/tour-types/${id}`,
        method: "PATCH",
        body: { name },
      }),
      invalidatesTags: ["TourType"],
    }),

    deleteTourType: builder.mutation<ApiResponse<ITourType>, string>({
      query: (id) => ({ url: `/tour/tour-types/${id}`, method: "DELETE" }),
      invalidatesTags: ["TourType"],
    }),
  }),
});

export const {
  useGetToursQuery,
  useGetTourBySlugQuery,
  useCreateTourMutation,
  useUpdateTourMutation,
  useDeleteTourMutation,
  useGetTourTypesQuery,
  useCreateTourTypeMutation,
  useUpdateTourTypeMutation,
  useDeleteTourTypeMutation,
} = tourApi;

/** The model field is `tourName` but create/update validation expects `name`. */
export const getTourTypeName = (type?: ITourType | null) =>
  type?.tourName ?? type?.name ?? "";
