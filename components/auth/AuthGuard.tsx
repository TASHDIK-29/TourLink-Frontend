"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";

/**
 * Requires a signed-in user of ANY role. Use `RoleGuard` when the area is
 * restricted to specific roles.
 *
 * `preserveTarget` is deliberately opt-in and rare. Post-login the site always
 * returns to the home page, because carrying a redirect target across a
 * sign-out/sign-in boundary sent the NEXT person to sign in — often an admin —
 * straight to the previous user's page. Tour details is the one exception: a
 * visitor who clicked a specific tour should land back on that tour.
 * `LoginForm` independently re-validates the target, so setting this on some
 * other route will not silently widen the exception.
 */
export function AuthGuard({
  children,
  preserveTarget = false,
}: {
  children: React.ReactNode;
  preserveTarget?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, initialized } = useAppSelector((s) => s.auth);

  useEffect(() => {
    // Wait for AuthBootstrap's /user/me probe, or a refresh bounces a
    // legitimately signed-in user to /login.
    if (!initialized || user) return;

    router.replace(
      preserveTarget
        ? `/login?redirect=${encodeURIComponent(pathname)}`
        : "/login",
    );
  }, [initialized, user, router, pathname, preserveTarget]);

  if (!initialized || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
