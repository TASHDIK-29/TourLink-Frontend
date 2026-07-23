"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BadgeCheck,
  CheckCircle2,
  Compass,
  Info,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { Skeleton } from "@/components/ui/Skeleton";
import { getApiErrorMessage } from "@/lib/apiError";
import { useAppSelector } from "@/redux/hooks";
import { useGetDivisionsQuery } from "@/redux/features/division/divisionApi";
import {
  useApplyForGuideMutation,
  useGetMyGuideApplicationQuery,
} from "@/redux/features/guide/guideApi";
import type { IDivision } from "@/types";

// Mirrors the backend applyGuideZodSchema (divisionId required); the NID photo
// is a file handled outside RHF, so it is validated on submit.
const schema = z.object({
  divisionId: z.string().min(1, "Please choose a division."),
});
type FormValues = z.infer<typeof schema>;

export default function BecomeGuidePage() {
  const user = useAppSelector((s) => s.auth.user);
  const isUser = user?.role === "USER";

  // Only travellers query their application status; guides/admins get static
  // cards below (and the /guide/me route is USER/GUIDE-only anyway).
  const {
    data: myApplication,
    isLoading: statusLoading,
    refetch: refetchStatus,
  } = useGetMyGuideApplicationQuery(undefined, { skip: !isUser });

  const { data: divisions, isLoading: divisionsLoading } =
    useGetDivisionsQuery();
  const [applyForGuide, { isLoading: submitting }] = useApplyForGuideMutation();

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    if (!file) {
      setFileError("A photo of your NID is required.");
      return;
    }

    try {
      await applyForGuide({ divisionId: values.divisionId, file }).unwrap();
      // The mutation invalidates the Guide tag, so the status query refetches
      // and this page flips to the "pending review" panel on its own.
      toast.success("Application submitted");
    } catch (error) {
      // 409 = a race where an application already exists; the invalidation
      // never fired (it only runs on success), so pull fresh status manually.
      if ((error as { status?: number }).status === 409) {
        refetchStatus();
        return;
      }
      toast.error(getApiErrorMessage(error, "Could not submit your application"));
    }
  };

  // Guides and admins don't apply — show them the relevant next step instead.
  if (user?.role === "GUIDE") {
    return (
      <Shell>
        <StateCard
          icon={<BadgeCheck className="h-7 w-7 text-accent" />}
          title="You're already a guide"
          body="Your guide application has been approved. Head to your guide area to get started."
          action={
            <Link href="/guide">
              <Button>Go to guide area</Button>
            </Link>
          }
        />
      </Shell>
    );
  }

  if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") {
    return (
      <Shell>
        <StateCard
          icon={<ShieldCheck className="h-7 w-7 text-primary" />}
          title="Admins review applications"
          body="This page is for travellers applying to become guides. You can review and decide on applications from the admin area."
          action={
            <Link href="/admin/guides">
              <Button>Manage applications</Button>
            </Link>
          }
        />
      </Shell>
    );
  }

  // Traveller: wait for their status before deciding between panel and form,
  // so a returning applicant never sees the form flash before their status.
  if (statusLoading) {
    return (
      <Shell>
        <div className="flex min-h-64 items-center justify-center rounded-card border border-border bg-card">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Shell>
    );
  }

  if (myApplication) {
    const divisionName =
      typeof myApplication.division === "object"
        ? myApplication.division.name
        : undefined;

    if (myApplication.status === "PENDING") {
      return (
        <Shell>
          <StateCard
            icon={<CheckCircle2 className="h-7 w-7 text-amber-500" />}
            title="Application under review"
            body={`Thanks for applying${
              divisionName ? ` to guide in ${divisionName}` : ""
            }! An admin is reviewing your details and NID. Once you're approved, your account is upgraded to a guide — sign in again to see your guide area.`}
            action={
              <Link href="/dashboard">
                <Button variant="outline">Back to dashboard</Button>
              </Link>
            }
          />
        </Shell>
      );
    }

    if (myApplication.status === "APPROVED") {
      return (
        <Shell>
          <StateCard
            icon={<BadgeCheck className="h-7 w-7 text-accent" />}
            title="You're approved!"
            body="Your guide application was approved. Sign out and back in to refresh your account, then your guide area will be available."
            action={
              <Link href="/guide">
                <Button>Go to guide area</Button>
              </Link>
            }
          />
        </Shell>
      );
    }

    // REJECTED — the backend blocks re-applying (one application per user), so
    // this is a terminal state rather than a prompt to try again.
    return (
      <Shell>
        <StateCard
          icon={<XCircle className="h-7 w-7 text-destructive" />}
          title="Application not approved"
          body="Unfortunately your guide application wasn't approved this time. If you think this was a mistake, please contact support."
          action={
            <Link href="/dashboard">
              <Button variant="outline">Back to dashboard</Button>
            </Link>
          }
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Compass className="h-3.5 w-3.5" />
          Become a guide
        </span>
        <h1 className="mt-4 text-3xl font-bold">Share the places you love</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Apply to lead tours in your region. Choose the division you want to
          guide in and upload a photo of your National ID for verification.
        </p>
      </div>

      <div className="rounded-card border border-border bg-card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {divisionsLoading ? (
            <Skeleton className="h-12 w-full rounded-xl" />
          ) : (
            <Select
              label="Division"
              error={errors.divisionId?.message}
              defaultValue=""
              {...register("divisionId")}
            >
              <option value="" disabled>
                Select the division you&apos;ll guide in
              </option>
              {divisions?.map((division: IDivision) => (
                <option key={division._id} value={division._id}>
                  {division.name}
                </option>
              ))}
            </Select>
          )}

          <ImagePicker
            label="NID photo"
            file={file}
            onChange={(f) => {
              setFile(f);
              if (f) setFileError(undefined);
            }}
            hint="Upload a clear photo of your National ID card."
          />
          {fileError && (
            <p className="-mt-2 text-xs text-destructive">{fileError}</p>
          )}

          <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              Your ID is used only to verify your identity. You can apply for one
              division at a time.
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={submitting}>
              Submit application
            </Button>
          </div>
        </form>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">{children}</div>
  );
}

function StateCard({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-border bg-card p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <h1 className="mt-4 text-2xl font-bold">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground">{body}</p>
      <div className="mt-6 flex justify-center">{action}</div>
    </div>
  );
}
