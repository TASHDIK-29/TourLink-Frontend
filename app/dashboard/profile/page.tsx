"use client";

import { format } from "date-fns";
import { BadgeCheck, Mail, ShieldCheck, User as UserIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { useGetMeQuery } from "@/redux/features/auth/authApi";

export default function ProfilePage() {
  // Read from /user/me rather than the auth slice: the slice's copy can come
  // from the login response, which predates any edit made in another tab, and
  // we need `auths` to know whether a password even exists for this account.
  const { data: user, isLoading } = useGetMeQuery();

  if (isLoading || !user) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-card" />
        <Skeleton className="h-56 rounded-card" />
      </div>
    );
  }

  // Google-only accounts have no password hash, so /auth/change-password would
  // blow up in bcrypt.compare. Those users get an explanatory note instead.
  const hasPassword =
    user.auths?.some((a) => a.provider === "credentials") ?? true;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your details and how you sign in.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-card border border-border bg-muted/40 p-5 text-sm">
        <span className="flex items-center gap-1.5">
          <UserIcon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{user.name}</span>
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Mail className="h-4 w-4" />
          {user.email}
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
          {user.role.replace("_", " ").toLowerCase()}
        </span>
        {user.isVerified && (
          <span className="flex items-center gap-1.5 text-primary">
            <BadgeCheck className="h-4 w-4" />
            Verified
          </span>
        )}
        {user.createdAt && (
          <span className="text-muted-foreground">
            Joined {format(new Date(user.createdAt), "MMMM yyyy")}
          </span>
        )}
      </div>

      <div className="space-y-6">
        <ProfileForm user={user} />

        {hasPassword ? (
          <ChangePasswordForm />
        ) : (
          <div className="rounded-card border border-border bg-card p-6">
            <h2 className="font-semibold">Password</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              You sign in with Google, so there&apos;s no password on this
              account to change.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
