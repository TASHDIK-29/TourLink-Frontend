"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";

/**
 * The inverse of AuthGuard: for pages that only make sense signed OUT (login,
 * register). An already-authenticated visitor is sent home rather than shown a
 * login form for the account they are already using.
 *
 * NOT applied to /verify or /reset-password — both are reached from an emailed
 * link and must work whatever the current session state is.
 */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, initialized } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (initialized && user) router.replace("/");
  }, [initialized, user, router]);

  if (!initialized || user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
