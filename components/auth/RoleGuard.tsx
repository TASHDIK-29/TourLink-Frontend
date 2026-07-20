"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import type { Role } from "@/types";

/**
 * Client-side gate for role-restricted areas.
 *
 * This is UX, not security — every protected route is enforced server-side by
 * the backend's `checkAuth`. Its job is to avoid rendering an admin shell for
 * someone who will only get 403s from it.
 *
 * It waits for `initialized` (set once AuthBootstrap's /user/me probe settles)
 * so a page refresh doesn't bounce a legitimately signed-in admin to /login.
 */
export function RoleGuard({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, initialized } = useAppSelector((s) => s.auth);

  const permitted = user ? allow.includes(user.role) : false;

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      // Deliberately NO ?redirect= here. This used to carry the guarded path
      // into /login, so signing out of (say) /dashboard/bookings left that
      // path in the URL — and the next person to sign in, typically an admin,
      // was dropped onto the previous user's bookings page.
      router.replace("/login");
    } else if (!permitted) {
      router.replace("/");
    }
  }, [initialized, user, permitted, router]);

  if (!initialized || !user || !permitted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
