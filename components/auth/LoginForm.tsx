"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MailWarning } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GoogleButton } from "./GoogleButton";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";
import { useLoginMutation, useLazyGetMeQuery } from "@/redux/features/auth/authApi";
import { setCredentials } from "@/redux/features/auth/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import { getApiErrorMessage } from "@/lib/apiError";

/**
 * `/tours/<slug>` and nothing else. The leading-slash + no-protocol check also
 * rules out `//evil.com` and `https://evil.com`, which would otherwise be an
 * open redirect off the site.
 */
const TOUR_DETAIL_PATH = /^\/tours\/[A-Za-z0-9._~-]+$/;

function sanitiseRedirect(target: string | null): string {
  if (!target) return "/";
  return TOUR_DETAIL_PATH.test(target) ? target : "/";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [fetchMe] = useLazyGetMeQuery();

  // Login lands on the home page by default. The ONLY honoured redirect target
  // is a tour detail page, so that a visitor who clicked a specific tour gets
  // back to it. Anything else — including a stale ?redirect= left in a shared
  // or bookmarked URL, or an off-site absolute URL — falls through to "/".
  // Enforced here rather than trusting whoever set the param.
  const redirectTo = sanitiseRedirect(searchParams.get("redirect"));
  const oauthError = searchParams.get("error");
  // Prefilled after verifying, so the user doesn't retype their address.
  const prefillEmail = searchParams.get("email") ?? "";

  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  // The Google failureRedirect sends the reason back as ?error=…
  useEffect(() => {
    if (oauthError) toast.error(oauthError);
  }, [oauthError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: prefillEmail, password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      const res = await login(values).unwrap();
      const { accessToken, user } = res.data;

      // Seed the store from the login payload, then reconcile with /user/me,
      // which returns the full document (login echoes the passport user).
      dispatch(setCredentials({ user, token: accessToken }));
      let resolvedUser = user;
      try {
        const me = await fetchMe().unwrap();
        dispatch(setCredentials({ user: me }));
        resolvedUser = me;
      } catch {
        // Non-fatal — the login payload is enough to proceed.
      }

      toast.success("Welcome back!");
      // Admins land straight on their dashboard; everyone else follows the
      // sanitised redirect (home, or the tour they came from).
      // replace, not push: the back button should not return to the login form
      // of a session that has already started.
      const isAdmin =
        resolvedUser.role === "ADMIN" || resolvedUser.role === "SUPER_ADMIN";
      router.replace(isAdmin ? "/admin" : redirectTo);
    } catch (error) {
      const message = getApiErrorMessage(error, "Could not sign you in");

      // The passport local strategy rejects unverified accounts before it ever
      // checks the password, so this is a dead end without the OTP flow.
      // Send them there instead of leaving them stuck on a correct password.
      if (message.toLowerCase().includes("not verified")) {
        setUnverifiedEmail(values.email);
        toast.error("Your email isn't verified yet.");
        return;
      }

      toast.error(message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md"
    >
      <div className="rounded-card border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Log in to manage your bookings and trips.
        </p>

        {unverifiedEmail && (
          <div className="mt-5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
            <p className="flex items-start gap-2 text-sm">
              <MailWarning className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                This account hasn&apos;t been verified yet. We can email you a
                six-digit code to finish setting it up.
              </span>
            </p>
            <Link
              href={`/verify?email=${encodeURIComponent(unverifiedEmail)}`}
              className="mt-3 block"
            >
              <Button size="sm" className="w-full">
                Verify my email
              </Button>
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={isLoading}>
            Log in
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">OR</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <GoogleButton redirect={redirectTo} />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
