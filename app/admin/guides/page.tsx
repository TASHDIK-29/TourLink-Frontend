"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Check, ExternalLink, Search, UserCheck, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { GuideStatusBadge } from "@/components/guide/GuideStatusBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  useDecideGuideApplicationMutation,
  useGetGuideApplicationsQuery,
} from "@/redux/features/guide/guideApi";
import type { GuideStatus, IDivision, IGuideApplication, IUser } from "@/types";

const PAGE_SIZE = 15;
const STATUSES: GuideStatus[] = ["PENDING", "APPROVED", "REJECTED"];

type Decision = { app: IGuideApplication; status: "APPROVED" | "REJECTED" };

export default function AdminGuidesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<GuideStatus | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce the search box so each keystroke isn't a request.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching } = useGetGuideApplicationsQuery({
    page,
    limit: PAGE_SIZE,
    ...(status ? { status } : {}),
    ...(searchTerm ? { searchTerm } : {}),
  });
  const [decide, { isLoading: deciding }] = useDecideGuideApplicationMutation();

  const [decision, setDecision] = useState<Decision | null>(null);

  const applications = data?.applications ?? [];
  const totalPage = data?.meta?.totalPage ?? 1;

  const confirmDecision = async () => {
    if (!decision) return;
    try {
      await decide({ id: decision.app._id, status: decision.status }).unwrap();
      toast.success(
        decision.status === "APPROVED"
          ? "Application approved — the applicant is now a guide"
          : "Application rejected",
      );
      setDecision(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update the application"));
    }
  };

  return (
    <>
      <PageHeader
        title="Guide Applications"
        description="Review, approve or reject travellers applying to become guides."
        action={
          <Select
            value={status}
            aria-label="Filter by status"
            onChange={(e) => {
              setStatus(e.target.value as GuideStatus | "");
              setPage(1);
            }}
            className="w-48"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        }
      />

      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by applicant name, email or division"
          className="pl-11"
          aria-label="Search applications"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : !applications.length ? (
        <div className="rounded-card border border-dashed border-border bg-card p-12 text-center">
          <UserCheck className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 font-semibold">
            {status || searchTerm
              ? "No matching applications"
              : "No guide applications yet"}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Applications from travellers will show up here for review.
          </p>
        </div>
      ) : (
        <div
          className={`overflow-hidden rounded-card border border-border bg-card ${
            isFetching ? "opacity-60" : ""
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="border-b border-border bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Applicant</th>
                  <th className="px-4 py-3 font-medium">Division</th>
                  <th className="px-4 py-3 font-medium">NID</th>
                  <th className="px-4 py-3 font-medium">Applied</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {applications.map((app) => {
                  // `user`/`division` are populated on this route, but typed as
                  // unions since the apply response leaves them as ids.
                  const applicant =
                    typeof app.user === "object"
                      ? (app.user as Pick<IUser, "name" | "email">)
                      : null;
                  const division =
                    typeof app.division === "object"
                      ? (app.division as Pick<IDivision, "name">)
                      : null;

                  return (
                    <tr key={app._id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <p className="font-medium">{applicant?.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">
                          {applicant?.email ?? ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">{division?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <a
                          href={app.nidPhoto}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-primary hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </a>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {app.createdAt
                          ? format(new Date(app.createdAt), "MMM d, yyyy")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <GuideStatusBadge status={app.status} />
                      </td>
                      <td className="px-4 py-3">
                        {app.status === "PENDING" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                setDecision({ app, status: "APPROVED" })
                              }
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              aria-label={`Reject ${applicant?.name ?? "application"}`}
                              onClick={() =>
                                setDecision({ app, status: "REJECTED" })
                              }
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <X className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <p className="text-right text-xs text-muted-foreground">
                            Decided
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPage > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPage} · {data?.meta?.total} total
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal
        open={Boolean(decision)}
        onClose={() => setDecision(null)}
        title={
          decision?.status === "APPROVED"
            ? "Approve this application?"
            : "Reject this application?"
        }
        className="max-w-md"
      >
        <p className="text-sm text-muted-foreground">
          {decision?.status === "APPROVED" ? (
            <>
              <span className="font-medium text-foreground">
                {decisionApplicantName(decision)}
              </span>{" "}
              will be promoted to a <span className="font-medium">GUIDE</span> and
              can begin guiding. This decision is final.
            </>
          ) : (
            <>
              <span className="font-medium text-foreground">
                {decisionApplicantName(decision)}
              </span>
              &apos;s application will be rejected. This decision is final.
            </>
          )}
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setDecision(null)}
            disabled={deciding}
          >
            Cancel
          </Button>
          <Button
            variant={decision?.status === "APPROVED" ? "primary" : "destructive"}
            onClick={confirmDecision}
            loading={deciding}
          >
            {decision?.status === "APPROVED" ? "Approve" : "Reject"}
          </Button>
        </div>
      </Modal>
    </>
  );
}

function decisionApplicantName(decision: Decision | null) {
  if (!decision) return "This applicant";
  const user = decision.app.user;
  return typeof user === "object" ? user.name : "This applicant";
}
