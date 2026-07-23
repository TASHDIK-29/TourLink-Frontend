import { baseApi } from "@/redux/baseApi";
import { buildMultipart } from "@/lib/multipart";
import type {
  ApiResponse,
  GuideCategory,
  GuideStatus,
  IGuideApplication,
} from "@/types";

export interface GuideQuery {
  status?: GuideStatus;
  searchTerm?: string;
  division?: string;
  user?: string;
  page?: number;
  limit?: number;
}

export interface GuideListResult {
  applications: IGuideApplication[];
  meta?: ApiResponse<IGuideApplication[]>["meta"];
}

export const guideApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /guide — admin list. getAllGuideApplications' controller unwraps to
    // `data: result.data` with `meta` alongside, so the array is flat.
    getGuideApplications: builder.query<GuideListResult, GuideQuery | void>({
      query: (params) => ({ url: "/guide", params: params ?? undefined }),
      transformResponse: (res: ApiResponse<IGuideApplication[]>) => ({
        applications: res.data ?? [],
        meta: res.meta,
      }),
      providesTags: ["Guide"],
    }),

    // GET /guide/available?division=&category= — admin picker of approved guides
    // in a division (candidates for manual booking assignment).
    getAvailableGuides: builder.query<
      IGuideApplication[],
      { division: string; category?: GuideCategory }
    >({
      query: (params) => ({ url: "/guide/available", params }),
      transformResponse: (res: ApiResponse<IGuideApplication[]>) =>
        res.data ?? [],
      providesTags: ["Guide"],
    }),

    // GET /guide/me — the authenticated applicant's own application, or null if
    // they've never applied (a normal state, not an error).
    getMyGuideApplication: builder.query<IGuideApplication | null, void>({
      query: () => "/guide/me",
      transformResponse: (res: ApiResponse<IGuideApplication | null>) =>
        res.data ?? null,
      providesTags: ["Guide"],
    }),

    // GET /guide/:id — admin single application (bonus endpoint). Returned at
    // `data` directly (not nested).
    getGuideApplication: builder.query<IGuideApplication, string>({
      query: (id) => `/guide/${id}`,
      transformResponse: (res: ApiResponse<IGuideApplication>) => res.data,
      providesTags: ["Guide"],
    }),

    // POST /guide/apply — USER submits. The NID photo goes under the `file`
    // field (multer .single), the rest as the stringified `data` field that
    // `validateRequest` JSON.parses before Zod validation.
    applyForGuide: builder.mutation<
      ApiResponse<IGuideApplication>,
      { divisionId: string; file: File }
    >({
      query: ({ divisionId, file }) => ({
        url: "/guide/apply",
        method: "POST",
        body: buildMultipart({ divisionId }, [file], "file"),
      }),
      invalidatesTags: ["Guide"],
    }),

    // POST /guide/approve/:id — admin approves/rejects. Approval also promotes
    // the applicant to GUIDE server-side, so the User cache is invalidated too.
    decideGuideApplication: builder.mutation<
      ApiResponse<IGuideApplication>,
      { id: string; status: Extract<GuideStatus, "APPROVED" | "REJECTED"> }
    >({
      query: ({ id, status }) => ({
        url: `/guide/approve/${id}`,
        method: "POST",
        body: { status },
      }),
      invalidatesTags: ["Guide", "User"],
    }),
  }),
});

export const {
  useGetGuideApplicationsQuery,
  useGetGuideApplicationQuery,
  useGetMyGuideApplicationQuery,
  useGetAvailableGuidesQuery,
  useApplyForGuideMutation,
  useDecideGuideApplicationMutation,
} = guideApi;
